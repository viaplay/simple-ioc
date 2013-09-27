var assert = require( 'assert' );

var settings = {
	use: {
		adapter: 'exampleDependencies'
	}
};

require( '../ioc' )
	.setLogLevel( 5 )
	.setSettings( 'settings', settings )
	.conditionalPathAutoRegister( 'use.adapter', '.' )
	.start( function( moduleWithNoDependencies ) {
		assert.deepEqual( moduleWithNoDependencies, require( './exampleDependencies/moduleWithNoDependencies.js' )() );
	} );
