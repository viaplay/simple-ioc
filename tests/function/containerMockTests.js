var assert = require( 'assert' );
describe( 'lib/container', function() {
	var container;
	before( function() {
		container = require( '../../lib/container.js' )( require( '../../lib/log/log.js' ) )
			.mock( {
				component: {
					getSomething: 'hej'
				}
			} );
	} );
	describe( 'mock( name, properties )', function() {
		it( 'Should mock a component', function( callback ) {
			container
				.inject( function( component ) {
					assert.equal( component.getSomething(), 'hej' );
					component.getSomething( 1, 2, 3, 4, function( err, result ) {
						assert.equal( result, 'hej' );
						callback();
					} );
				} );
		} );
		it( 'Should mock a component with err', function( callback ) {
			container
				.inject( function( component ) {
					component.getSomething = 'hej1';
					component.getSomething.err = 'hopp';
					component.getSomething( 1, 2, 3, 4, function( err, result ) {
						assert.equal( err, 'hopp' );
						assert.equal( result, 'hej1' );
						callback();
					} );
				} );
		} );
	} );
} );