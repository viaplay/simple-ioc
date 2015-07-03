var assert = require( 'assert' );
describe( 'lib/ioc', function() {
	var ioc = require( '../../lib/ioc.js' )();;
	describe( 'ioc.useLogWriter( resolvedWriter )', function() {
		it( 'Should use a custom log writer', function( callback ) {
			var logObject;
			ioc.setSettings( {
				log: {
					level: 2,
					includeEnvironemtVariables: {},
					output: 'memoryJson'
				}
			} )
			.useLogWriter( { output: function( _logObject ) {
				logObject = _logObject;
			} } )
			.getContainer()
			.registerIocLog()
			.registerIocSettings()
			.inject( function( log ) {
				log.error( 'testMessage', 'testData' );
				assert.equal( logObject.message, 'testMessage' );
				assert.equal( logObject.level, 1 );
				assert.equal( logObject.meta, 'testData' );
				callback();
			} );
		} );
	} );
	describe( 'ioc.registerWriter( resolvedWriter )', function() {

	} );
} );
