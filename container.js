module.exports = function( log ) {
	var components = {},
		waitingId, waitingTs, waiting = [], waitingWarningTime = 2000,
	register = function( name, fn, singleton ) {
		log.trace( 'container', 'registering', name );
		if( components[ name ] )
			log.fatal( 'container', 'Same name was already registered', name, true );
		else {
			components[ name ] = {
				fn: fn,
				singleton: singleton,
				resolved: false
			};
			var dependencies = getDependencies( name );
			components[ name ].dependencies = dependencies;
			var unusedDependencies = [];
			dependencies.forEach( function( dependency ) {
				if( fn.toString().split( dependency ).length <= 2 )
					unusedDependencies.push( dependency );
			} );
			if( unusedDependencies.length > 0 )
				log.warning( 'container', 'Possible unused dependencies for', name + '(' + unusedDependencies.join( ', ' ) + ')' );
			log.debug( 'container', 'registered', name );
		}
	},
	load = function( name, instance ) {
		if( components[ name ] )
			log.fatal( 'container', 'Same name was already registered', name, true );
		else {
			components[ name ] = {
				instance: instance,
				resolved: true
			};
			log.info( 'container', 'loaded', name );
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
						log.trace( 'container', 'dependencies for ' + name, dependencies.join( ', ' ) );
						return dependencies;
					}
					catch( ex ) {
						log.fatal( 'container', 'function malformatted', name, true );
					}
				}
				else
					log.fatal( 'container', 'getDependencies failed, function not registered', name, true );
			}
		}
		else
			log.fatal( 'container', 'getDependencies failed, not registered', name, true );
	},
	getUnresolvableDependencies = function( name, parents ) {
		parents = parents || [ name ];
		if( !components[ name ] )
			return parents;
		var dependencies = getDependencies( name );
		for( var i = 0 ; i < dependencies.length ; i++ ) {
			var dependency = dependencies[ i ];
			if( dependency != 'readyCallback' )
				if( parents.indexOf( dependency ) >= 0 )
					log.fatal( 'container', 'Cyclic dependency', parents.concat( [ dependency ] ).join( ' -> ' ), true );
				else {
					var chain = getUnresolvableDependencies( dependency, parents.concat( [ dependency ] ) );
					if( chain )
						return chain;
				}
		}
		return undefined;
	},
	resolveDependencies = function( dependencies, readyCallback, callback, resolved ) {
		resolved = resolved || [];
		if( dependencies.length > 0 ) {
			if( dependencies[ 0 ] == 'readyCallback' )
				resolveDependencies( dependencies.slice( 1 ), undefined, callback, resolved.concat( [ readyCallback ] ) );
			else
				resolve( dependencies[ 0 ], function( instance ) {
					resolveDependencies( dependencies.slice( 1 ), readyCallback, callback, resolved.concat( [ instance ] ) );
				} );
		}
		else {
			callback( resolved, readyCallback );
		}
	},
	reportWaiting = function() {
		if( waitingId )
			clearInterval( waitingId );
		waitingId = setInterval( function() {
			var ms = new Date().getTime() - waitingTs;
			log.warning( 'container', 'Waiting for callback from', waiting[ waiting.length - 1 ] + ' (' + ( ms / 1000 ) + ' s)' );
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
	resolve = function( name, callback ) {
		var component = components[ name ];
		if( component.instance )
			callback( component.instance );
		else {
			log.debug( 'container', 'resolving', name );
			startWaiting( name );
			resolveDependencies( component.dependencies, function( instance ) {
				log.info( 'container', instance ? 'resolved' : 'only injected', name );
				component.resolved = true;
				if( component.singleton )
					component.instance = instance;
				stopWaiting( name );
				callback( instance );
			}, function( resolvedDependencies, readyCallback ) {
				log.trace( 'container', 'injecting', name + ' (' + component.dependencies.join( ', ' ) + ')' );
				if( readyCallback )
					readyCallback( component.fn.apply( this, resolvedDependencies ) );
				else
					component.fn.apply( this, resolvedDependencies );
			} );
		}
	},
	inject = function( fn ) {
		log.debug( 'container', 'injecting anonymous function' );
		resolveDependencies( getDependencies( 'anonymous function', fn ), function() {}, function( resolvedDependencies ) {
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
			log.fatal( 'container', 'Unresolvable components', '\n ' + tries.join( '\n ' ), true );
	},
	resolveAll = function( callback ) {
		log.trace( 'container', 'Resolving all' );
		var nextResolvable = getNextResolvable();
		if( nextResolvable )
			resolve( nextResolvable, function() {
				resolveAll( callback );
			} );
		else {
			log.debug( 'container', 'All resolved' );
			setImmediate( callback );
		}
	},
	reset = function() {
		components = {};
	};
	return {
		register: register,
		load: load,
		resolve: resolve,
		resolveAll: resolveAll,
		inject: inject,
		reset: reset,
		setWaitingWarningTime: setWaitingWarningTime
	};
};

