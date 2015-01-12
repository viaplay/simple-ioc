var assert = require( 'assert' );
describe( 'lib/container', function() {
	var container;
	before( function() {
		container = require( '../../lib/container.js' )( require( '../../lib/log/log.js' ) );
	} );
	describe( 'registerResolved( name, fn )', function() {
		it( 'Should register a resolved component', function() {
			container.registerResolved( 'component1', {
				value: 'componentValue1'
			} );
			assert.ok( true );
		} );
	} );
	describe( 'registerInjectable( name, fn )', function() {
		it( 'Should register an injectable component', function() {
			container.registerInjectable( {
				component2: function( pub ) {
					pub.value = 'componentValue2';
				},
				component3: function( pub, component2, callback ) {
					pub.value = component2.value;
					setImmediate( callback );
				},
				component4: function( pub, component3 ) {
					pub.value = component3.value;
				}
			} );
			assert.ok( true );
		} );
	} );
	describe( 'resolve( name, callback )', function() {
		it( 'Should resolve a registered component', function( callback ) {
			container.resolve( 'component4', function( err, instance ) {
				assert.equal( instance.value, 'componentValue2' );
			} );
			callback();
		} );
		it( 'Should get resolving error if trying to resolve a non registered component', function( callback ) {
			container.resolve( 'component5', function( err ) {
				assert.equal( err.context.name, 'component5' );
				assert.equal( err.context.errors[ 0 ].problemType, 'notRegistered' );
			} );
			callback();
		} );
		it( 'Should get resolving error if trying to resolve a component with non resolvable dependencies', function( callback ) {
			container
				.registerInjectable( {
					component5: function( pub, component6 ) {
					}
				} )
				.resolve( 'component5', function( err ) {
					assert.equal( err.context.name, 'component5' );
					assert.equal( err.context.errors[ 0 ].problemType, 'dependencyNotRegistered' );
					assert.deepEqual( err.context.errors[ 0 ].dependencyNames, [ 'component6' ] );
				} );
			callback();
		} );
	} );
	describe( 'autoRegisterPath( relativePath )', function() {
		it( 'Should register all components in a path recursively', function( callback ) {
			container.autoRegisterPath( './containerTestData/test1', true )
				.resolve( 'test1module5', function( err, instance ) {
					assert.equal( 'test1module5-test1module2-test1module2-(test1module2-test1module4)', instance.value );
					callback();
				} );
		} );
		it( 'Should throw error if components are registered more than once', function() {
			try {
				container.autoRegisterPath( './containerTestData/test2' );
			}
			catch( err ) {
				assert.equal( err.message, 'Component with same name exists in path' );
			}
		} );
	} );
	describe( 'inject( fn )', function() {
		it( 'Should inject a function', function( callback ) {
			container.inject( function( component2, component3 ) {
				assert.equal( component2.value, 'componentValue2' );
				assert.equal( component3.value, 'componentValue2' );
				callback();
			} );
		} );
	} );
} );
