var util = require( 'util' );
module.exports = function() {
	var IocError = function( message, context ) {
		Error.call( this );
		Error.captureStackTrace( this, this.constructor );
		this.message = message;
		this.message = message;
		this.context = context;
	};
	util.inherits( IocError, Error );
	return IocError;
};
