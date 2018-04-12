var assert = require( 'assert' );
describe( 'lib/dependencyParser', function() {
	var dependencyParser;
	before( function( callback ) {
		dependencyParser = require( '../../../../lib/containerHelpers/dependencyParser.js' )();
		callback();
	} );
	describe( 'isReservesDependencyName', function() {
		it( 'Should identify callback parameter as reserved', function() {
			assert.ok( dependencyParser.isReservedDependencyName( 'callback' ) );
		} );
		it( 'Should identify parentName parameter as reserved', function() {
			assert.ok( dependencyParser.isReservedDependencyName( 'parentName' ) );
		} );
		it( 'Should identify pub parameter as reserved', function() {
			assert.ok( dependencyParser.isReservedDependencyName( 'pub' ) );
		} );
		it( 'Should identify setup parameter as reserved', function() {
			assert.ok( dependencyParser.isReservedDependencyName( 'setup' ) );
		} );
		it( 'Should not identify other parameter as reserved', function() {
			assert.ok( !dependencyParser.isReservedDependencyName( 'other' ) );
		} );
	} );
	describe( 'getDependencies', function() {
		describe( 'parameters', function() {
			it( 'Should have the correct parameters when using function()', function() {
				var dependencies = dependencyParser.getDependencies( function( callback, parentName, pub, setup, p1, p2 ) {
					var arr = [ p1, callback, pub ];
				} );
				assert.deepEqual( dependencies.parameters.map( function( parameter ) {
					return parameter.name;
				} ), [ 'callback', 'parentName', 'pub', 'setup', 'p1', 'p2' ] );
			} );

			it( 'Should have the correct parameters when using () =>', function() {
				var dependencies = dependencyParser.getDependencies( ( callback, parentName, pub, setup, p1, p2 ) => {
					var arr = [ p1, callback, pub ];
				} );
				assert.deepEqual( dependencies.parameters.map( function( parameter ) {
					return parameter.name;
				} ), [ 'callback', 'parentName', 'pub', 'setup', 'p1', 'p2' ] );
			} );
		} );
		describe( 'nonReserved', function() {
			it( 'Should identify all non reserved dependencies', function() {
				var dependencies = dependencyParser.getDependencies( function( callback, parentName, pub, setup, p1, p2 ) {
					var arr = [ p1, callback, pub ];
				} );
				assert.deepEqual( dependencies.nonReserved, [ 'p1', 'p2' ] );
			} );
		} );
		describe( 'hasUnused', function() {
			it( 'Should identify that there are unused parameters', function() {
				var dependencies = dependencyParser.getDependencies( function( callback, parentName, pub, setup, p1, p2 ) {
					var arr = [ p1, callback, pub ];
				} );
				assert.ok( dependencies.hasUnused );
			} );
			it( 'Should identify that there are no unused parameters', function() {
				var dependencies = dependencyParser.getDependencies( function( callback, parentName, pub, setup, p1, p2 ) {
					var arr = [ callback, parentName, pub, setup, p1, p2 ];
				} );
				assert.ok( !dependencies.hasUnused );
			} );
			it( 'Should identify that there are no unused parameters eventhough parentName is unused', function() {
				var dependencies = dependencyParser.getDependencies( function( callback, parentName, pub, setup, p1, p2 ) {
					var arr = [ callback, pub, setup, p1, p2 ];
				} );
				assert.ok( !dependencies.hasUnused );
			} );
		} );
		describe( 'unused', function() {
			it( 'Should omit unused parentName parameter', function() {
				var dependencies = dependencyParser.getDependencies( function( parentName ) {
				} );
					assert.ok( dependencies.unused.length === 0 );
			} );
			it( 'Should identify the correct unused dependencies', function() {
				var dependencies = dependencyParser.getDependencies( function( callback, parentName, pub, setup, p1, p2 ) {
					var arr = [ p1, callback, pub ];
				} );
				assert.ok( dependencies.hasUnused );
				assert.deepEqual( dependencies.unused.map( function( parameter ) {
					return parameter.name;
				} ), [ 'setup', 'p2' ] );
			} );
		} );
		describe( 'isReserved', function() {
			it( 'Should identify reserved dependencies', function() {
				var dependencies = dependencyParser.getDependencies( function( callback, parentName, pub, setup, p1 ) {
				} );
				assert.ok( dependencies.parameters[ 0 ].isReserved );
				assert.ok( dependencies.parameters[ 1 ].isReserved );
				assert.ok( dependencies.parameters[ 2 ].isReserved );
				assert.ok( dependencies.parameters[ 3 ].isReserved );
				assert.ok( !dependencies.parameters[ 4 ].isReserved );
			} );
		} );
		describe( 'isCallback/isParentName/isPub/isSetup', function() {
			it( 'Should identify callback, parentName, pub and setup', function() {
				var dependencies = dependencyParser.getDependencies( function( callback, parentName, pub, setup, p1 ) {
				} );
				assert.ok( dependencies.parameters[ 0 ].isCallback );
				assert.ok( dependencies.parameters[ 1 ].isParentName );
				assert.ok( dependencies.parameters[ 2 ].isPub );
				assert.ok( dependencies.parameters[ 3 ].isSetup );
				assert.ok(
					!dependencies.parameters[ 4 ].isCallback &&
					!dependencies.parameters[ 4 ].isParentName &&
					!dependencies.parameters[ 4 ].isPub &&
					!dependencies.parameters[ 4 ].isSetup
				);
			} );
		} );
		describe( 'hasCallback', function() {
			it( 'Should return true if callback dependeny exists among dependencies', function() {
				var dependencies = dependencyParser.getDependencies( function( callback, parentName, pub, setup, p1 ) {
				} );
				assert.ok( dependencies.hasCallback );
			} );
			it( 'Should return false if no callback dependeny exists among dependencies', function() {
				var dependencies = dependencyParser.getDependencies( function( parentName, pub, setup, p1 ) {
				} );
				assert.ok( !dependencies.hasCallback );
			} );
		} );
		describe( 'hasParentName', function() {
			it( 'Should return true if parentName dependeny exists among dependencies', function() {
				var dependencies = dependencyParser.getDependencies( function( callback, parentName, pub, setup, p1 ) {
				} );
				assert.ok( dependencies.hasParentName );
			} );
			it( 'Should return false if no parentName dependeny exists among dependencies', function() {
				var dependencies = dependencyParser.getDependencies( function( pub, setup, p1 ) {
				} );
				assert.ok( !dependencies.hasParentName );
			} );
		} );
		describe( 'hasPub', function() {
			it( 'Should return true if pub dependeny exists among dependencies', function() {
				var dependencies = dependencyParser.getDependencies( function( callback, parentName, pub, setup, p1 ) {
				} );
				assert.ok( dependencies.hasPub );
			} );
			it( 'Should return false if no pub dependeny exists among dependencies', function() {
				var dependencies = dependencyParser.getDependencies( function( setup, p1 ) {
				} );
				assert.ok( !dependencies.hasPub );
			} );
		} );
		describe( 'hasSetup', function() {
			it( 'Should return true if setup dependeny exists among dependencies', function() {
				var dependencies = dependencyParser.getDependencies( function( callback, parentName, pub, setup, p1 ) {
				} );
				assert.ok( dependencies.hasSetup );
			} );
			it( 'Should return false if no setup dependeny exists among dependencies', function() {
				var dependencies = dependencyParser.getDependencies( function( p1 ) {
				} );
				assert.ok( !dependencies.hasSetup );
			} );
		} );
	} );
} );
