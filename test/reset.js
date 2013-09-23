var assert = require( 'assert' );

var registered = {
	key: 'This is a component registered by name'
};

var ioc = require( '../ioc' )
	.setLogLevel( 5 )
	.register( 'someName', registered )
	.start( function() {
		ioc
			.reset()
			.inject( function ( someName ) {
				assert.equal( someName, null, 'reset should remove all registrations form the ioc' );
				process.exit(0);
			} );
	} );
