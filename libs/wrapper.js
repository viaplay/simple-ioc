module.exports = function() {
	var pub = {},
		wrappers = {},
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
	};
	pub.wrap = function( name, wrapperName ) {
		wrappers[ name ] = wrapperName;
	};
	pub.shouldWrapComponent = function( name ) {
		return !!wrappers[ name ];
	};
	pub.wrapObject = function( parentName, name, obj, wrapper ) {
		var result = ( typeof( obj ) == 'function' ) ? wrapFunction( obj, parentName, name, obj, wrapper ) : {};
		for( var prop in obj ) {
			if( typeof( obj[ prop ] ) == 'function' )
				result[ prop ] = wrapFunction( obj, parentName, name + '.' + prop, obj[ prop ], wrapper );
			else if( !wrapper.hideWrappingWarning )
				log.warning( 'Wrapping component with public non-function fields', name + '.' + prop );
		}
		return result;
	};
	return pub;
};