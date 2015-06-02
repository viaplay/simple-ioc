var IocError = require( '../genericHelpers/IocError.js' )(),
	log = require( '../log/log.js' )( 'resolver' ),
	errRerouter = require( '../genericHelpers/errRerouter.js' )(),
	resolvedComponent = require( '../containerHelpers/resolvedComponent.js' )(),
	wrapper = require( '../wrapping/wrapper.js' )(),
	timer = require( '../genericHelpers/timer.js' )( 2000 ),
	wrapper = require( '../wrapping/wrapper.js' )(),
	injectableComponent = require( './injectableComponent.js' )();
module.exports = function( trueCallback ) {
	var pub = {};
	pub.resolveInjectableComponent = function( parentName, component, resolvedNonReservedDependencies, callback ) {
		var pub = {},
			setupFn,
			asyncCallback = [ function( err, instance ) {
				if( trueCallback )
					setImmediate( callback, err, component.dependencies.hasPub ? pub : instance );
				else
					setImmediate( callback, undefined, component.dependencies.hasPub ? pub : instance || err );
			}, function() {} ];
		var instance = component.fn.apply( undefined, component.dependencies.parameters.map( function( dependency ) {
			if( !dependency.isReserved )
				return resolvedNonReservedDependencies[ dependency.name ];
			else if( dependency.isCallback )
				return asyncCallback.shift();
			else if( dependency.isParentName )
				return parentName;
			else if( dependency.isPub )
				return pub;
			else if( dependency.isSetup ) {
				return function( setup ) {
					setupFn = setup;
				};
			}
		} ) );
		if( setupFn )
			setupFn();
		asyncCallback.shift()( instance );
	};
	var resolveDependencies = function( store, name, nonReserved, callback ) {
		nonReserved = nonReserved.concat();
		( function recursive( resolved ) {
			if( !nonReserved.length )
				callback( undefined, resolved );
			else {
				var dependencyName = nonReserved.pop();
				pub.resolve( store, dependencyName, name, errRerouter( callback, function( instance ) {
					resolved[ dependencyName ] = instance;
					recursive( resolved );
				} ) );
			}
		} )( {} );
	};
	pub.registerGlobalWrapper = function( name, wrapperResolveFn ) {
		wrapper.registerWrapper( name, wrapperResolveFn );
	};
	pub.inject = function( store, fn, parentName, callback ) {
		var component = injectableComponent.get( fn );
		resolveDependencies( store, 'anonymousFunction', component.dependencies.nonReserved, function( err, resolvedNonReservedDependencies ) {
			if( err && !callback )
				log.fatal( 'Cannot resolve dependencies for anonymous function', err );
			else
				pub.resolveInjectableComponent( parentName, component, resolvedNonReservedDependencies, function( err, instance ) {
					if( callback )
						callback( err, instance );
				} );
		} );
	};
	pub.resolve = function( store, name, parentName, callback ) {
		if( !store.isResolvable( name ) ) {
			setImmediate( callback, new IocError( 'Component unresolvable', store.getResolvingProblems( name ) ) );
		}
		else if( store.isResolved( name ) ) {
			store.addUsage( name, parentName );
			wrapper.wrap( parentName, name, store.getResolved( name ).instance, function( err, wrappedInstance ) {
				callback( undefined, wrappedInstance );
			} );
		}
		else {
			var component = store.getInjectable( name );
			if( !component.isTransient && component.hasWaiting ) {
				component.waiting = pub.resolve.bind( undefined, store, name, parentName, callback );
			}
			else {
				if( !component.isTransient )
					component.waiting = pub.resolve.bind( undefined, store, name, parentName, callback );
				log.trace( 'Resolving', name );
				resolveDependencies( store, name, component.dependencies.nonReserved, errRerouter( callback, function( resolvedNonReservedDependencies ) {
					timer.startTimer( name );
					pub.resolveInjectableComponent( parentName, component, resolvedNonReservedDependencies, errRerouter( callback, function( instance ) {
						timer.stopTimer( name );
						if( component.isTransient ) {
							log.debug( 'Resolved transient', name );
							store.addUsage( name, parentName );
							wrapper.wrap( parentName, name, instance, function( err, wrappedInstance ) {
								callback( undefined, wrappedInstance );
							} );
						}
						else {
							store.setResolved( name, resolvedComponent.get( instance ) );
							while( component.hasWaiting )
								setImmediate( component.waiting );
						}
					} ) );
				} ) );
			}
		}
	};
	return pub;
};