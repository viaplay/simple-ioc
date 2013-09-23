var assert = require( 'assert' );

var settings = {
	use: {
		implementationA: true
	}
};

var myComponentImplementationA = {
	dummyDescription: 'This is implementation A'
};

var ioc = require( '../ioc' )
	.setLogLevel( 5 )
	.setSettings( 'conditional', settings )
	.start( function() {
		ioc
			.reset()
			.conditionalRegister( 'use.implementationA', true, 'myComponent', myComponentImplementationA )
			.inject( function ( myComponent ) {
				assert.deepEqual( myComponent, undefined );
				process.exit(0);
			} )
	} );
