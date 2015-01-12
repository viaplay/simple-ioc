var assert = require( 'assert' );
describe( 'lib/ioc', function() {
	var container;
	before( function() {
		container = require( '../../lib/ioc.js' )()
			.setSettings( {
				log: {
					level: 2,
					includeEnvironemtVariables: {},
					output: 'memoryJson'
				},
				wrapping: {
					component1: 'wrapper1',
					component2: 'wrapper2'
				}
			} ).getContainer();
	} );
	describe( 'registerGlobalWrappersFromSettings( settingsKey )', function() {
		it( 'Should wrap functions', function( callback ) {
			container
				.registerGlobalWrappersFromSettings( 'wrapping' )
				.registerInjectable( 'component1', function( pub ) {
					pub.syncFunction = function( arg1, arg2 ) {
						return arg1 - arg2;
					};
					pub.asyncFunction = function( arg1, arg2, callback ) {
						setImmediate( callback, undefined, arg1 + arg2 );
						return arg1 - arg2;
					};
					pub.asyncFunctionThatTakesSomeTime = function( callback ) {
						setTimeout( callback, 20 );
					};
				} )
				.registerInjectable( 'wrapper1', function( pub ) {
					pub.sync = function( context, args, result ) {
						assert.equal( result, 1 );
						assert.equal( args[ 0 ], 2 );
						assert.equal( args[ 1 ], 1 );
					};
					pub.async = function( context, args, callback ) {
						if( context.wrappedFunction === 'component1.asyncFunction' ) {
							assert.equal( args[ 0 ], 4 );
							assert.equal( args[ 1 ], 2 );
							assert.equal( context.result, 2 );
							assert.equal( context.parentName, 'wrappingFunctionTests.js' );
						}
						callback( function( err, result ) {
							if( context.wrappedFunction === 'component1.asyncFunctionThatTakesSomeTime' )
								assert.ok( Date.now() - context.ts >= 20 );
							else
								assert.equal( result, 6 );
						} );
					};
				} )
				.resolve( 'component1', function( err, component ) {
					assert.equal( component.syncFunction( 2, 1 ), 1 );
					assert.equal( component.asyncFunction( 4, 2, function( err, result ) {
						assert.equal( result, 6 );
						component.asyncFunctionThatTakesSomeTime( function() {
							callback();
						} );
					} ), 2 );
				} );
		} );
		it( 'Should intercept functions', function( callback ) {
			container
				.registerInjectable( 'component2', function( pub ) {
					pub.func = function( arg1, arg2, callback ) {
						setImmediate( function() {
							callback( undefined, arg1 + arg2 );
						} );
					};
				} )
				.registerInjectable( 'wrapper2', function( pub ) {
					pub.intercept = function( context, args ) {
						assert.equal( context.parentName, 'wrappingFunctionTests.js' );
						assert.equal( context.wrappedFunction, 'component2.func' );
						assert.equal( args[ 0 ], 2 );
						assert.equal( args[ 1 ], 1 );
						args[ 0 ]++;
						args[ 1 ]++;
						context.fn.apply( context.instance, args );
					};
				} )
				.resolve( 'component2', function( err, component ) {
					component.func( 2, 1, function( err, result ) {
						assert.equal( result, 5 );
						callback();
					} );
				} );
		} );
	} );
} );