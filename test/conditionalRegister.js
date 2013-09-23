var assert = require( 'assert' );

var settings = {
	use: {
		implementationA: true
	}
};

var myComponentImplementationA = {
	dummyDescription: 'This is implementation A'
};

var myComponentImplementationB = {
	dummyDescription: 'This is implementation B'
};

require( '../ioc' )
	.setLogLevel( 5 )
	.setSettings( 'conditional', settings )
	.conditionalRegister( 'use.implementationA', true, 'myComponent', myComponentImplementationA )
	.conditionalRegister( 'use.implementationB', true, 'myComponent', myComponentImplementationB )
	.start( function( myComponent ) {
		assert.deepEqual( myComponent, myComponentImplementationA );
	} );
