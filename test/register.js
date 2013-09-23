var assert = require( 'assert' );

var registered = {
	dummyDescription: 'This is a component registered by name'
};

require( '../ioc' )
	.setLogLevel( 5 )
	.register( 'someName', registered )
	.start( function( someName) {
		assert.deepEqual( someName, registered );
	} );
