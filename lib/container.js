var anonymousParentResolver = require( './genericHelpers/anonymousParentResolver.js' )(),
	files = require( './containerHelpers/files.js' )(),
	injectableComponent = require( './containerHelpers/injectableComponent.js' )(),
	resolvedComponent = require( './containerHelpers/resolvedComponent.js' )(),
	IocError = require( './genericHelpers/IocError.js' )(),
	settingsHelper = require( './genericHelpers/settingsHelper.js' )(),
	resolver = require( './containerHelpers/resolver.js' )(),
	containerCount = 0,
	errRerouter = require( './genericHelpers/errRerouter.js' )();
module.exports = function( ioc ) {
	var pub = {},
		log = require( './log/log.js' )( 'container ' + containerCount++ ),
		store = require( './containerHelpers/store.js' )(),
		fnToInjectAfterAllResolved,
		loaderName = anonymousParentResolver.resolvePath( 3 ).split( '/' ).pop(),
		shouldResolveAllAndInject = true;
	pub.registerResolved = function( name, instance ) {
		if( typeof( name ) === 'string' ) {
			log.debug( 'registerResolved', name );
			if( store.isRegistered( name ) )
				throw new IocError( 'Component already registered', name );
			else
				store.setResolved( name, resolvedComponent.get( instance ) );
		}
		else
			Object.keys( name ).forEach( function( comnonentName ) {
				pub.registerResolved( comnonentName, name[ comnonentName ] );
			} );
		return pub;
	};
	var registerInjectable = function( name, fn ) {
		log.debug( 'registerInjectable', name );
		if( store.isRegistered( name ) )
			throw new IocError( 'Component already registered', name );
		else {
			var component = injectableComponent.get( fn );
			if( component.dependencies.hasUnused )
				log.error( name + ' has unused dependencies', component.dependencies.unused.map( function( dependency ) {
					return dependency.name;
				} ) );
			store.setInjectable( name, component );
		}
	};
	var mock = function( name, properties ) {
		log.debug( 'mock', name );
		if( store.isRegistered( name ) )
			throw new IocError( 'Component already registered', name );
		else {
			var instance = {}, values = {}, funcs = {};
			Object.keys( properties ).forEach( function( property ) {
				values[ property ] = properties[ property ];
				funcs[ property ] = function() {
					if( typeof( arguments[ arguments.length - 1 ] ) === 'function' )
						setImmediate( arguments[ arguments.length - 1 ], funcs[ property ].err, values[ property ] );
					else
						return values[ property ];
				};
				Object.defineProperty( instance, property, {
					set: function( value ) {
						values[ property ] = value;
					},
					get: function() {
						return funcs[ property ];
					}
				} );
			} );
			store.setResolved( name, resolvedComponent.get( instance ) );
		}
	};
	pub.mock = function( name, properties ) {
		if( typeof( name ) === 'string' )
			mock( name, properties );
		else
			Object.keys( name ).forEach( function( comnonentName ) {
				pub.mock( comnonentName, name[ comnonentName ] );
			} );
		return pub;
	};
	pub.registerInjectable = function( name, fn ) {
		if( typeof( name ) === 'string' )
			if( typeof( fn ) === 'function' )
				registerInjectable( name, fn );
			else
				throw( new IocError( 'Injectable is not a function', name ) );
		else
			Object.keys( name ).forEach( function( comnonentName ) {
				pub.registerInjectable( comnonentName, name[ comnonentName ] );
			} );
		return pub;
	};
	pub.registerGlobalWrappersFromSettings = function( settingsKey ) {
		var wrapSettings = settingsHelper.getSetting( ioc.getSettings(), settingsKey );
		if( wrapSettings )
			Object.keys( wrapSettings ).forEach( function( componentName ) {
				resolver.registerGlobalWrapper( componentName, pub.resolve.bind( pub, wrapSettings[ componentName ] ) );
			} );
		return pub;
	};
	pub.autoRegisterPath = function( relativePath, omitFileIocComments, omitFileLengthLogging ) {
		log.trace( 'autoRegisterPath', relativePath );
		var modulesInPath = files.getModulesInPath( relativePath, omitFileIocComments, omitFileLengthLogging, 2 );
		Object.keys( modulesInPath.injectables ).forEach( function( name ) {
			pub.registerInjectable( name, modulesInPath.injectables[ name ] );
		} );
		Object.keys( modulesInPath.resolved ).forEach( function( name ) {
			pub.registerResolved( name, modulesInPath.resolved[ name ] );
		} );
		return pub;
	};
	pub.resolve = function( name, callback ) {
		resolver.resolve( store, name, anonymousParentResolver.resolveName( 2 ), callback );
		return pub;
	};
	pub.registerIocSettings = function( name ) {
		pub.registerResolved( name || 'settings', ioc.getSettings() );
		return pub;
	};
	pub.registerIocLog = function( name ) {
		pub.registerInjectable( name || 'log', require( './log/log.js' ) );
		return pub;
	};
	var currentResolvning = {}, ts;
	pub.resolveAllAndInject = function( fn ) {
		if( !ts )
			ts = Date.now();
		var nextResolvable = store.getAllResolvable();
		if( nextResolvable.length )
			setImmediate( function() {
				if( shouldResolveAllAndInject )
					nextResolvable.forEach( function( resolvable ) {
						if( !currentResolvning[ resolvable ] ) {
							currentResolvning[ resolvable ] = true;
							var ts = Date.now();
							pub.resolve( resolvable, function( err, instance ) {
								log.debug( 'Resolved ' + resolvable, Date.now() - ts + ' ms' );
								delete currentResolvning[ resolvable ];
								if( err )
									log.fatal( 'resolveAllAndInject failed when resolving component', err );
								else
									pub.resolveAllAndInject( fn );
							} );
						}
					} );
			} );
		else if( !Object.keys( currentResolvning ).length ) {
			var problems = store.getAllResolvingProblems();
			if( problems.length ) {
				log.debug( 'Problems during resolveAllAndInject', problems );
				var nonRegisteredProblems = {};
				problems.forEach( function( problem ) {
					var filteredErrors = problem.errors.filter( function( error ) {
						return error.problemType === 'dependencyNotRegistered';
					} );
					if( filteredErrors.length )
						nonRegisteredProblems[ problem.name ] = filteredErrors[ 0 ].dependencyNames;
				} );
				log.fatal( 'Failed to resolveAllAndInject, non registered components', nonRegisteredProblems );
			}
			pub.inject( fn, function() {
				var unrefered = store.getUnreferencedComponents();
				if( unrefered.length )
					log.info( 'All resolved ' + loaderName + ' in ' + ( Date.now() - ts ) + ' ms, unrefered components', unrefered );
				else
					log.info( 'All resolved ' + loaderName + ' in ' + ( Date.now() - ts ) + ' ms' );
				if( fnToInjectAfterAllResolved ) {
					pub.inject( fnToInjectAfterAllResolved, function() {} );
				}
			} );
		}
		return pub;
	};
	pub.injectAfterResolveAll = function( fn ) {
		fnToInjectAfterAllResolved = fn;
	};
	pub.inject = function( fn, callback ) {
		resolver.inject( store, fn, anonymousParentResolver.resolveName( 2 ), callback );
		return pub;
	};
	pub.registerResolvedIfSetting = function( settingKey, name, instance ) {
		if( settingsHelper.getSetting( ioc.getSettings(), settingKey ) )
			pub.registerResolved( name, instance );
		return pub;
	};
	pub.registerInjectableIfSetting = function( settingKey, name, fn ) {
		if( settingsHelper.getSetting( ioc.getSettings(), settingKey ) )
			pub.registerInjectable( name, fn );
		return pub;
	};
	pub.autoRegisterPathInSetting = function( settingKey ) {
		var settingValue = settingsHelper.getSetting( ioc.getSettings(), settingKey );
		if( settingValue )
			pub.autoRegisterPath( settingValue );
		return pub;
	};
	pub.removeRegistered = function( name ) {
		store.removeRegistered( name );
		return pub;
	};
	pub.export = function( name ) {
		shouldResolveAllAndInject = false;
		return function( callback ) {
			pub.resolve( name, function( err, resolved ) {
				if( err )
					log.fatal( 'Could not transfer component', err );
				else
					callback( resolved );
			} );
		};
	};
	pub.registerResolved( 'ioc', ioc )
		.registerResolved( 'container', pub )
		.registerResolved( 'errRerouter', errRerouter );

	return pub;
};