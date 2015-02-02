var assert = require( 'assert' );
describe( 'lib/container.export', function() {
	var container1, container2, testVar = true;
	before( function() {
		container1 = require( '../../lib/container.js' )( require( '../../lib/log/log.js' ) )
			.registerInjectable( {
				test1: function( pub ) {
					testVar = false;
					pub.value = 2;
				},
				test2: function( pub ) {
					pub.value = 1;
				}
			} )
			.resolveAllAndInject( function( test1, test2 ) {

			} );
		container2 = require( '../../lib/container.js' )( require( '../../lib/log/log.js' ) )
			.registerInjectable( {
				test2: container1.export( 'test2' )
			} );
	} );
	describe( 'export( name )', function() {
		it( 'Should not have resolved test1', function() {
			assert.ok( testVar );
		} );
		it( 'Should have test2 in container2', function( done ) {
			container2.inject( function( test2 ) {
				assert.equal( test2.value, 1 );
				done();
			} );
		} );
	} );
} );