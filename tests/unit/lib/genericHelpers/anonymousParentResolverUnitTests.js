var assert = require( 'assert' );
describe( 'lib/genericHelpers/anonymousParentResolver', function() {
	var errRerouter;
	before( function( callback ) {
		anonymousParentNameResolver = require( '../../../../lib/genericHelpers/anonymousParentResolver.js' )();
		callback();
	} );
	describe( 'resolveName', function() {
		it( 'Should return this filename with argument 1', function( callback ) {
			assert.equal( anonymousParentNameResolver.resolveName( 1 ), module.filename.split( '/' ).pop() );
			callback();
		} );
	} );
	describe( 'resolvePath', function() {
		it( 'Should return this path with argument 1', function( callback ) {
			assert.equal( anonymousParentNameResolver.resolvePath( 1 ), require( 'path' ).dirname( module.filename ) );
			callback();
		} );
	} );
} );
