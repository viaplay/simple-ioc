var assert = require( 'assert' );
describe( 'lib/containerHelpers/store', function() {
	var store;
	before( function() {
		store = require( '../../../../lib/containerHelpers/store.js' )();
	} );
	describe( 'setResolved( name, resolved )', function() {
		it( 'Should store a resolved component', function() {
			store.setResolved( 'resolved1', {} );
			assert.equal( store.getComponentCount(), 1 );
			assert.ok( store.isResolved( 'resolved1' ) );
			assert.ok( store.isRegistered( 'resolved1' ) );
			assert.ok( store.isResolvable( 'resolved1' ) );
			assert.ok( !store.getInjectable( 'resolved1' ) );
		} );
	} );
	describe( 'setInjectable( name, injectable )', function() {
		it( 'Should store a injectable component', function() {
			store.setInjectable( 'injectable1', {
				dependencies: {
					parameters: [
						{ name: 'resolved1' },
						{ name: 'resolved2' },
						{ name: 'injectable2' },
						{ name: 'injectable3' }
					],
					nonReserved: [ 'resolved1', 'resolved2', 'injectable2', 'injectable3' ]
				},
				isTransient: false
			} );
			assert.equal( store.getComponentCount(), 2 );
			assert.ok( !store.isResolved( 'injectable1' ) );
			assert.ok( store.isRegistered( 'injectable1' ) );
			assert.ok( !store.isResolvable( 'injectable1' ) );
			assert.ok( !!store.getInjectable( 'injectable1' ) );
		} );
	} );
	describe( 'isResolved( name )', function() {
		it( 'Should determine if components are resolved', function() {
			assert.ok( store.isResolved( 'resolved1' ) );
			assert.ok( !store.isResolved( 'injectable1' ) );
		} );
	} );
	describe( 'getResolved( name )', function() {
		it( 'Should get resolved if it exists', function() {
			assert.ok( !store.getResolved( 'injectable1' ) );
			assert.ok( !!store.getResolved( 'resolved1' ) );
		} );
	} );
	describe( 'isRegistered( name )', function() {
		it( 'Should determine if a component is registered', function() {
			assert.ok( store.isRegistered( 'resolved1' ) );
			assert.ok( store.isRegistered( 'injectable1' ) );
			assert.ok( !store.isRegistered( 'injectable2' ) );
		} );
	} );
	describe( 'getInjectable( name )', function() {
		it( 'Should get injectable if it exists', function() {
			assert.ok( !store.getInjectable( 'injectable1' ).isTransient );
		} );
	} );
	describe( 'isResolvable( name )', function() {
		it( 'Should determine if a component is resolvable', function() {
			store.setInjectable( 'injectable2', {
				dependencies: {
					parameters: [ { name: 'resolved1' } ],
					nonReserved: [ 'resolved1' ]
				},
				isTransient: false
			} );
			assert.ok( !store.isResolvable( 'injectable1' ) );
			assert.ok( store.isResolvable( 'injectable2' ) );
		} );
	} );
	describe( 'getComponentCount()', function() {
		it( 'Should return the correct component count', function() {
			assert.equal( store.getComponentCount(), 3 );
		} );
	} );
	describe( 'getAllNonResolved()', function() {
		it( 'Should return all non resolved components', function() {
			assert.deepEqual( store.getAllNonResolved().sort(), [ 'injectable1', 'injectable2' ] );
		} );
	} );
	describe( 'getAllResolvable()', function() {
		it( 'Should return all resolvable components', function() {
			assert.deepEqual( store.getAllResolvable().sort(), [ 'injectable2' ] );
		} );
	} );
	describe( 'getCyclicDependencies( name )', function() {
		it( 'Should find cyclic dependencies of a component', function() {
			store.setInjectable( 'injectable3', {
				dependencies: {
					parameters: [ { name: 'injectable4' } ],
					nonReserved: [ 'injectable4' ]
				},
				isTransient: false
			} );
			store.setInjectable( 'injectable4', {
				dependencies: {
					parameters: [ { name: 'injectable5' } ],
					nonReserved: [ 'injectable5' ]
				},
				isTransient: false
			} );
			store.setInjectable( 'injectable5', {
				dependencies: {
					parameters: [ { name: 'injectable3' } ],
					nonReserved: [ 'injectable3' ]
				},
				isTransient: false
			} );
			assert.deepEqual( store.getAllNonResolved().sort(), [ 'injectable1', 'injectable2', 'injectable3', 'injectable4', 'injectable5' ] );
			assert.deepEqual( store.getCyclicDependencies( 'injectable3' ), [ 'injectable3', 'injectable4', 'injectable5', 'injectable3' ] );
			assert.deepEqual( store.getCyclicDependencies( 'injectable1' ), [] );
		} );
	} );
	describe( 'getAllResolvingProblems()', function() {
		it( 'Should return all resolving problems', function() {
			var problems = store.getAllResolvingProblems().sort( function( problem1, problem2 ) {
				return problem1 < problem2 ? 1 : -1;
			} );
			assert.deepEqual( problems, [
				{ name: 'injectable1', errors: [
					{ problemType: 'dependencyNotRegistered', dependencyNames: [ 'resolved2' ] },
					{ problemType: 'dependencyNotResolvable', dependencyNames: [ 'injectable3' ] }
				] },
				{ name: 'injectable3', errors: [
					{ problemType: 'cyclicDependency', dependencyNames: [ 'injectable4', 'injectable5', 'injectable3' ] }
				] },
				{ name: 'injectable4', errors: [
					{ problemType: 'cyclicDependency', dependencyNames: [ 'injectable5', 'injectable3', 'injectable4' ] }
				] },
				{ name: 'injectable5', errors: [
					{ problemType: 'cyclicDependency', dependencyNames: [ 'injectable3', 'injectable4', 'injectable5' ] }
				] },
			] );
		} );
	} );
} );

