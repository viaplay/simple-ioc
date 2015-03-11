describe( 'lib/log/logger', function() {
	var assert = require( 'assert' );
	var logger = require( '../../../../lib/log/logger.js' )();
	var mockWriter = {
		entries: [],
		output: function( logObject ) { this.entries.push(logObject); },
		getEntries: function( component ) { return this.entries; },
		reset: function() { this.entries = []; }
	};
	logger.useWriter( mockWriter );
	describe( 'environmentVariables', function() {
		beforeEach( function() {
			logger.reset();
		} );
		it( 'should log ENVIRONMENT_VARIABLE as environmentVar', function() {
			logger.updateSettings( { includeEnvironmentVariables: { 'environmentVar': 'ENVIRONMENT_VARIABLE' } } );
			process.env.ENVIRONMENT_VARIABLE = 'test-value';
			logger.log( {} );
			var entry = logger.getEntries()[ 0 ];
			assert.equal( entry.environmentVar, 'test-value' );
		} );
		it( 'should support legacy typo and log TYPO_VARIABLE as typoVar', function() {
			logger.updateSettings( { includeEnvironemtVariables: { 'typoVar': 'TYPO_VARIABLE' } } );
			process.env.TYPO_VARIABLE = 'typo-value';
			logger.log( {} );
			var entry = logger.getEntries()[ 0 ];
			assert.equal( entry.typoVar, 'typo-value' );
		} );
		it( 'should log nonexisting environments variables as undefined', function() {
			logger.updateSettings( { includeEnvironemtVariables: { 'nonexistingVar': 'NONEXISTING_VARIABLE' } } );
			logger.log( {} );
			var entry = logger.getEntries()[ 0 ];
			assert.deepEqual( entry, { nonexistingVar: undefined } );
		} );
	} );
} );
