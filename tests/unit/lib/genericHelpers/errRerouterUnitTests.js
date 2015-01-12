var assert = require( 'assert' );
describe( 'lib/genericHelpers/errRerouter', function() {
	var errRerouter;
	before( function( callback ) {
		errRerouter = require( '../../../../lib/genericHelpers/errRerouter.js' )();
		callback();
	} );
	describe( 'called with error', function() {
		it( 'Should reroute to callback with err', function( callback ) {
			var errFn = function( callback ) {
				setImmediate( callback, true );
			};
			errFn( errRerouter( function( err ) {
				assert.ok( err );
				callback();
			}, function() {
				assert.fail( 'Called', 'Not called', 'Fn was called when it was not supposed to.' );
				callback();
			} ) );
		} );
	} );
	describe( 'called without error', function() {
		it( 'Should reroute to fn with called parameters', function( callback ) {
			var okFn = function( callback ) {
				setImmediate( callback, undefined, 1, 2, 3 );
			};
			okFn( errRerouter( function( err ) {
				assert.fail( 'Called', 'Not called', 'Fn was called when it was not supposed to.' );
				callback();
			}, function( p1, p2, p3 ) {
				assert.equal( p1, 1 );
				assert.equal( p2, 2 );
				assert.equal( p3, 3 );
				callback();
			} ) );
		} );
	} );
} );
