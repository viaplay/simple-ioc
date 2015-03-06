module.exports = function() {
	var pub = {};
	pub.level = 3;
	var	includeEnvironmentVariables = {},
		writer = require( './writers/consoleReadable.js' )();
	var legacyTypoSupport = function( settings ) {
		return settings.includeEnvironemtVariables;
	};
	pub.log = function( logObject ) {
		Object.keys( includeEnvironmentVariables ).forEach( function( variable ) {
			logObject[ variable ] = process.env[ includeEnvironmentVariables[ variable ] ];
		} );
		writer.output( logObject );
	};
	pub.getEntries = function( component ) { return writer.getEntries( component ); };
	pub.reset = function() { return writer.reset(); };
	pub.updateSettings = function( settings ) {
		pub.level = settings.level || pub.level;
		includeEnvironmentVariables = settings.includeEnvironmentVariables || legacyTypoSupport( settings ) || includeEnvironmentVariables;
		if( settings.output )
			writer = require( './writers/' + settings.output + '.js' )( {} );
	};
	pub.useWriter = function( resolvedWriter ) {
		writer = resolvedWriter;
	};
	return pub;
};