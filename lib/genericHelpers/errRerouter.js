module.exports = function() {
	return function( callback, successFn ) {
		return function( err ) {
			if( err )
				callback( err );
			else
				successFn.apply( undefined, Array.prototype.slice.call( arguments ).slice( 1 ) );
		};
	};
};
