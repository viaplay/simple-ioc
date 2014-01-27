module.exports = function( log ) {
	var components = {}, wrappers = {}, libCount = 1,
		waitingId, waitingTs, waiting = [], waitingWarningTime = 2000,
		reservedDependencies = [ 'readyCallback', 'iocCallback', 'iocParentName' ],
	isReservedDependency = function( name ) {
		return reservedDependencies.indexOf( name ) >= 0;
	},
	wrap = function( name, wrapperName ) {
		wrappers[ name ] = wrapperName;
	},
	register = function( name, fn, singleton ) {
		name = name || ( 'lib' + libCount++ );
		log.trace( 'registering', name );
		if( components[ name ] )
			log.fatal( 'Same name was already registered', name );
		else {
			components[ name ] = {
				fn: fn,
				singleton: singleton,
				resolved: false
			};
			var dependencies = getDependencies( name );
			components[ name ].dependencies = dependencies;
			if( ( dependencies.indexOf( 'iocParentName' ) >= 0 ) && singleton ) {
				log.error( 'Cannot register a component as singleton if it has iocParentName as dependency, switching to transient', name );
				components[ name ].singleton = false;
			}
			var unusedDependencies = [];
			dependencies.forEach( function( dependency ) {
				if( fn.toString().split( dependency ).length <= 2 )
					unusedDependencies.push( dependency );
			} );
			if( unusedDependencies.length > 0 )
				log.warning( 'Possible unused dependencies for', name + '(' + unusedDependencies.join( ', ' ) + ')' );
			log.debug( 'registered', name );
		}
	},
	registerDependency = function( name, loaded ) {
		if( components[ name ] )
			log.info( 'Dependency already registered, using existing', name );
		else
			load( name, loaded );
	},
	registerLib = function( name, fn ) {
		if( components[ name ] )
			log.info( 'Library already registered, using existing', name );
		else
			register( name, fn, true );
	},
	load = function( name, instance ) {
		if( components[ name ] )
			log.fatal( 'Same name was already registered', name );
		else {
			components[ name ] = {
				instance: instance,
				resolved: true
			};
			log.info( 'loaded', name );
		}
	},
	getDependencies = function( name, fn ) {
		var component = fn ? { fn: fn } : components[ name ];
		if( component ) {
			if( component.instance )
				return [];
			else {
				var dependencies = [];
				if( typeof( component.fn ) == 'function' ) {
					try {
						component.fn.toString()
							.replace( /\n/g, ' ' )
							.match( /function\s+\w*\s*\((.*?)\)/ )[1].split( /\s*,\s*/ )
							.map( function( parameter ) { return parameter.trim(); } )
							.forEach( function( parameter ) {
								if( parameter.length > 0 )
									dependencies.push( parameter );
							} );
						log.trace( 'dependencies for ' + name, dependencies.join( ', ' ) );
						return dependencies;
					}
					catch( ex ) {
						log.fatal( 'function malformatted', name );
					}
				}
				else
					log.fatal( 'getDependencies failed, function not registered', name );
			}
		}
		else
			log.fatal( 'getDependencies failed, not registered', name );
	},
	getUnresolvableDependencies = function( name, parents ) {
		parents = parents || [ name ];
		if( !components[ name ] )
			return parents;
		var dependencies = getDependencies( name );
		for( var i = 0 ; i < dependencies.length ; i++ ) {
			var dependency = dependencies[ i ];
			if( !isReservedDependency( dependency ) )
				if( parents.indexOf( dependency ) >= 0 )
					log.fatal( 'Cyclic dependency', parents.concat( [ dependency ] ).join( ' -> ' ) );
				else {
					var chain = getUnresolvableDependencies( dependency, parents.concat( [ dependency ] ) );
					if( chain )
						return chain;
				}
		}
		return undefined;
	},
	resolveDependencies = function( name, parentName, dependencies, iocCallback, callback, resolved ) {
		resolved = resolved || [];
		if( dependencies.length > 0 ) {
			var dependency = dependencies[ 0 ], remaining = dependencies.slice( 1 );
			if( isReservedDependency( dependency ) ) {
				if( dependency == 'iocParentName' ) {
					resolveDependencies( name, undefined, remaining, iocCallback, callback, resolved.concat( [ parentName ] ) );
				}
				else // readyCallback, parentName
					resolveDependencies( name, parentName, remaining, undefined, callback, resolved.concat( [ iocCallback ] ) );
			}
			else
				resolve( dependency, function( instance ) {
					resolveDependencies( name, parentName, remaining, iocCallback, callback, resolved.concat( [ instance ] ) );
				}, name );
		}
		else {
			callback( resolved, iocCallback );
		}
	},
	shouldWrapComponent = function( name ) {
		return !!wrappers[ name ];
	},
	resolve = function( name, callback, parentName ) {
		var component = components[ name ];
		if ( component === undefined )
			log.fatal( 'Unresolvable, not registered', name );
		else if( component.instance )
			if( shouldWrapComponent( name ) )
				wrapComponent( parentName, name, component.instance, callback );
			else
				callback( component.instance );
		else {
			log.debug( 'resolving', name );
			startWaiting( name );
			resolveDependencies( name, parentName, component.dependencies, function( instance ) {
				if( component.singleton )
					log.info( instance ? 'resolved singleton' : 'only injected singleton', name );
				else
					log.debug( instance ? 'resolved transient' : 'only injected transient', name );
				component.resolved = true;
				if( component.singleton )
					component.instance = instance;
				stopWaiting( name );
				if( shouldWrapComponent( name ) )
					wrapComponent( parentName, name, instance, callback );
				else
					callback( instance );
			}, function( resolvedDependencies, iocCallback ) {
				log.trace( 'injecting', name + ' (' + component.dependencies.join( ', ' ) + ')' );
				if( iocCallback )
					iocCallback( component.fn.apply( this, resolvedDependencies ) );
				else
					component.fn.apply( this, resolvedDependencies );
			} );
		}
	},
	wrapFunctionAsync = function( obj, parentName, name, fn, wrapper ) {
		return function() {
			var args = [];
			for( var argument in arguments ) {
				args.push( arguments[ argument ] );
			}
			var callback = args.pop();
			wrapper( {
				caller: parentName,
				wrapped: name,
				async: true
			}, args.slice( 0 ), function( cb ) {
				args.push( function() {
					cb.apply( cb, arguments );
					callback.apply( callback, arguments );
				} );
				fn.apply( obj, args );
			} );
		};
	},
	wrapFunctionSync = function( obj, parentName, name, fn, wrapper ) {
		return function() {
			var args = [];
			for( var argument in arguments ) {
				args.push( arguments[ argument ] );
			}
			var ts = Date.now();
			var result = fn.apply( obj, args );
			wrapper( {
				caller: parentName,
				wrapped: name,
				async: false,
				ts: ts,
				time: Date.now() - ts
			}, args, result );
			return result;
		};
	},
	wrapFunction = function( obj, parentName, name, fn, wrapper ) {
		var dependencies = getDependencies( undefined, fn );
		if( dependencies.indexOf( 'callback' ) === ( dependencies.length - 1 ) )
			return wrapFunctionAsync( obj, parentName, name, fn, wrapper.async || wrapper );
		else if( wrapper.sync )
			return wrapFunctionSync( obj, parentName, name, fn, wrapper.sync );
		else
			return fn;
	},
	wrapObject = function( parentName, name, obj, wrapper ) {
		var result = ( typeof( obj ) == 'function' ) ? wrapFunction( obj, parentName, name, obj, wrapper ) : {};
		for( var prop in obj ) {
			if( typeof( obj[ prop ] ) == 'function' )
				result[ prop ] = wrapFunction( obj, parentName, name + '.' + prop, obj[ prop ], wrapper );
			else
				log.warning( 'Wrapping component with public non-function fields', name + '.' + prop );
		}
		return result;
	},
	wrapComponent = function( parentName, name, instance, callback ) {
		var wrapperName = wrappers[ name ];
		if( !components[ wrapperName ] )
			log.fatal( 'Wrapper not registered', wrapperName );
		else {
			resolve( wrapperName, function( wrapper ) {
				callback( wrapObject( parentName, name, instance, wrapper ) );
			}, parentName );
		}
	},
	reportWaiting = function() {
		if( waitingId )
			clearInterval( waitingId );
		waitingId = setInterval( function() {
			var ms = new Date().getTime() - waitingTs;
			log.warning( 'Waiting for callback from', waiting[ waiting.length - 1 ] + ' (' + ( ms / 1000 ) + ' s)' );
		}, waitingWarningTime );
	},
	startWaiting = function( name ) {
		waiting.push( name );
		waitingTs = new Date().getTime();
		reportWaiting();
	},
	stopWaiting = function () {
		clearInterval( waitingId );
		waiting.pop();
		waitingId = undefined;
		if( waiting.length > 0 )
			reportWaiting();
	},
	setWaitingWarningTime = function( milliseconds ) {
		waitingWarningTime = milliseconds;
	},
	inject = function( fn ) {
		log.debug( 'injecting anonymous function', undefined );
		resolveDependencies( 'anonymous', undefined, getDependencies( 'anonymous function', fn ), function() {}, function( resolvedDependencies ) {
			fn.apply( this, resolvedDependencies );
		} );
	},
	getNextResolvable = function() {
		var tries = [];
		for( var name in components ) {
			var component = components[ name ];
			if( !component.resolved && component.singleton ) {
				var unresolvableDependencies = getUnresolvableDependencies( name );
				if( unresolvableDependencies ) {
					var text = unresolvableDependencies.join( ' -> ' );
					for( var i = 0 ; ( i < tries.length ) && text ; i++ )
						if( tries[ i ].indexOf( text ) >= 0 )
							text = undefined;
						else if( text.indexOf( tries[ i ] ) >= 0 ) {
							tries[ i ] = text;
							text = undefined;
						}
					if( text )
						tries.push( text );
				}
				else
					return name;
			}
		}
		if( tries.length > 0 )
			log.fatal( 'Unresolvable components', '\n ' + tries.join( '\n ' ) );
	},
	resolveAll = function( callback ) {
		log.trace( 'Resolving all', undefined );
		var nextResolvable = getNextResolvable();
		if( nextResolvable )
			resolve( nextResolvable, function() {
				resolveAll( callback );
			} );
		else {
			log.debug( 'All resolved', undefined );
			setImmediate( callback );
		}
	},
	reset = function() {
		components = {};
	},
	setLogger = function( logger ) {
		log = logger;
	};
	return {
		register: register,
		load: load,
		resolve: resolve,
		resolveAll: resolveAll,
		registerLib: registerLib,
		inject: inject,
		reset: reset,
		setWaitingWarningTime: setWaitingWarningTime,
		setLogger: setLogger,
		wrap: wrap,
		registerDependency: registerDependency
	};
};
