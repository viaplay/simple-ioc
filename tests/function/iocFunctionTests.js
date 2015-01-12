var assert = require( 'assert' );
describe( 'lib/ioc', function() {
	var ioc;
	before( function() {
		ioc = require( '../../lib/ioc.js' )();
	} );
	describe( 'container.registerIocSettings( name )', function() {
		it( 'Should register settings from ioc in container with specific name', function( callback ) {
			ioc.setSettings( {
				log: {
					level: 2,
					includeEnvironemtVariables: {},
					output: 'memoryJson'
				},
				testData: 'testValue'
			}, {
				testData: 'newTestValue'
			} )
			.getContainer()
			.registerIocSettings( 'configuration' )
			.resolve( 'configuration', function( err, instance ) {
				assert.equal( instance.testData, 'newTestValue' );
				callback();
			} );
		} );
	} );
	describe( 'ioc.registerWriter( resolvedWriter )', function() {

	} );
} );
