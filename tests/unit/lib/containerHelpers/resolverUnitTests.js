var assert = require( 'assert' );
describe( 'lib/containerHelpers/resolver', function() {
	var resolver;
	before( function() {
		resolver = require( '../../../../lib/containerHelpers/resolver.js' )();
	} );
	describe( 'resolveInjectableComponent( parentName, injectableComponent, resolvedNonReservedDependencies, callback )', function() {
		it( 'Should resolve async component', function( callback ) {
			resolver.resolveInjectableComponent( 'theParentName', {
				fn: function( pub, dependency1, parentName, dependency2, setup, callback ) {
					pub.value1 = dependency1;
					setup( function() {
						setImmediate( function() {
							pub.value2 = dependency2;
							callback();
						} );
					} );
					pub.parentName = parentName;
				},
				dependencies: {
					parameters: [
						{ isPub: true, isReserved: true },
						{ name: 'dependency1' },
						{ isParentName: true, isReserved: true },
						{ name: 'dependency2' },
						{ isSetup: true, isReserved: true },
						{ isCallback: true, isReserved: true }
					],
					hasPub: true
				}
			}, {
				dependency1: 'dependencyValue1',
				dependency2: 'dependencyValue2'
			}, function( err, instance ) {
				assert.equal( instance.value1, 'dependencyValue1' );
				assert.equal( instance.value2, 'dependencyValue2' );
				assert.equal( instance.parentName, 'theParentName' );
				callback();
			} );
		} );
		it( 'Should resolve sync component', function( callback ) {
			resolver.resolveInjectableComponent( 'theParentName2', {
				fn: function( pub, dependency1, parentName, dependency2 ) {
					pub.value1 = dependency1;
					pub.value2 = dependency2;
					pub.parentName = parentName;
				},
				dependencies: {
					parameters: [
						{ isPub: true, isReserved: true },
						{ name: 'dependency1' },
						{ isParentName: true, isReserved: true },
						{ name: 'dependency2' }
					],
					hasPub: true
				}
			}, {
				dependency1: 'dependencyValue1',
				dependency2: 'dependencyValue2'
			}, function( err, instance ) {
				assert.equal( instance.value1, 'dependencyValue1' );
				assert.equal( instance.value2, 'dependencyValue2' );
				assert.equal( instance.parentName, 'theParentName2' );
				callback();
			} );
		} );
	} );
} );
