var errRerouter = require( '../genericHelpers/errRerouter.js' )(),
	log = require( '../log/log.js' )( 'wrapper' ),
	dependencyParser = require( '../containerHelpers/dependencyParser.js' )();
module.exports = function() {
	var pub = {},
		store = {};
	var wrapFunction = function( parentName, name, instance, wrapper, fn ) {
		var dependencies = dependencyParser.getDependencies( fn ).parameters.map( function( parameter ) {
			return parameter.name;
		} );
		if( wrapper.intercept ) {
			return function() {
				var args = Array.prototype.slice.call( arguments ),
					ts = Date.now();
				wrapper.intercept( {
					parentName: parentName,
					wrappedFunction: name,
					instance: instance,
					fn: fn,
					ts: ts
				}, args.slice( 0 ) );
			}
		}
		else {
			if( dependencies.indexOf( 'callback' ) === ( dependencies.length - 1 ) && wrapper.async ) {
				return function() {
					var args = Array.prototype.slice.call( arguments ),
						ts = Date.now(),
						originalCallback = args.pop(),
						wrapperCallback;
					args.push( function() {
						var args = Array.prototype.slice.call( arguments );
						setImmediate( function() {
							wrapperCallback.apply( instance, args );
							originalCallback.apply( instance, args );
						} );
					} );
					var result = fn.apply( instance, args );
					wrapper.async( {
						parentName: parentName,
						wrappedFunction: name,
						async: true,
						ts: ts,
						executionTime: Date.now() - ts,
						result: result
					}, args.slice( 0 ), function( callback ) {
						wrapperCallback = callback;
					} );
					return result;
				};
			}
			else if( wrapper.sync ) {
				return function() {
					var args = Array.prototype.slice.call( arguments ),
						ts = Date.now(),
						result = fn.apply( instance, args );
					wrapper.sync( {
						parentName: parentName,
						wrappedFunction: name,
						sync: true,
						ts: ts,
						executionTime: Date.now() - ts,
					}, args, result );
					return result;
				};
			}
			else if( !wrapper.hideWrappingWarnings ) {
				log.warning( 'Function not wrapped, wrapper is missing type', [ name, property ].join( '.' ) );
				return fn;
			}
			else
				return fn;
		}
	};
	var wrap = function( parentName, name, instance, wrapper ) {
		var result = ( typeof( instance ) === 'function' ) ? wrapFunction( parentName, name, instance, wrapper, instance ) : {};
		Object.keys( instance ).forEach( function( property ) {
			if( typeof( instance[ property ] ) === 'function' )
				result[ property ] = wrapFunction( parentName, [ name, property ].join( '.' ), instance, wrapper, instance[ property ] );
			else if( !wrapper.hideWrappingWarnings )
				log.warning( 'Wrapping component with non-function property', [ name, property ].join( '.' ) );
		} );
		return result;
	};
	pub.registerWrapper = function( componentName, wrapperResolveFn ) {
		store[ componentName ] = wrapperResolveFn;
	};
	pub.wrap = function( parentName, name, instance, callback ) {
		if( store[ name ] ) {
			log.debug( 'Wrapping', name );
			store[ name ]( errRerouter( callback, function( wrapper ) {
				callback( undefined, wrap( parentName, name, instance, wrapper ) );
			} ) );
		}
		else
			setImmediate( callback, undefined, instance );
	};
	return pub;
};
