var assert = require( 'assert' );
describe( 'lib/containerHelpers/files', function() {
	var files;
	before( function() {
		files = require( '../../../../lib/containerHelpers/files.js' )();
	} );
	describe( 'getInjectablesInPath', function() {
		it( 'Should return a object corresponding to the files in path', function() {
			var modulesInPath = files.getModulesInPath( './filesTestData', false, false, 1 );
			assert.deepEqual( modulesInPath.injectables, {
				module1: 'value1',
				module2: 'value2',
				module3: 'value3',
				module4: 'value4'
			} );
		} );
		it( 'Should throw error if path not found', function() {
			try {
				files.getModulesInPath( './notExistingPath', false, false, 1 );
				assert.ok( false );
			}
			catch( err ) {
				assert.ok( true );
			}
		} );
	} );
} );
