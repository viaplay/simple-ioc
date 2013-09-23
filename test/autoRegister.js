var assert = require( 'assert' );

require( '../ioc' )
	.setLogLevel( 5 )
	.autoRegister( './exampleDependencies/moduleWithNoDependencies.js' )
	.start( function( moduleWithNoDependencies ) {
		assert.ok( moduleWithNoDependencies );
	} );
