var assert = require( 'assert' );
describe( 'lib/ioc', function() {
	var container;
	before( function() {
		container = require( '../../lib/ioc.js' )()
			.getContainer();
	} );
	describe( 'container.resolveAllAndInject( fn )', function() {
		it( 'Should resolve all singletons and inject a function', function( callback ) {
			var resolvedComponents = [ false, false, false, false, false, false, false ],
				notResolved = false;
			container
				.registerInjectable( 'component0', function( pub ) {
					resolvedComponents[ 0 ] = true;
				} )
				.registerInjectable( 'component1', function( pub, component0 ) {
					resolvedComponents[ 1 ] = true;
				} )
				.registerInjectable( 'component2', function( pub, component1 ) {
					resolvedComponents[ 2 ] = true;
				} )
				.registerInjectable( 'component3', function( pub, component2, component1 ) {
					resolvedComponents[ 3 ] = true;
				} )
				.registerInjectable( 'component4', function( pub, component3 ) {
					resolvedComponents[ 4 ] = true;
				} )
				.registerInjectable( 'component5', function( pub, component2 ) {
					resolvedComponents[ 5 ] = true;
				} )
				.registerInjectable( 'component6', function( pub, component4, component1 ) {
					resolvedComponents[ 6 ] = true;
				} )
				.registerInjectable( 'component7', function( pub, component4, component1, parentName ) {
					notResolved = true;
				} )
				.resolveAllAndInject( function() {
					assert.ok( !resolvedComponents.some( function( item ) { return !item; } ) );
					assert.ok( !notResolved );
					callback();
				} );
		} );
	} );
} );