module.exports = function() {
	var pub = {};
	pub.level = 3;
	var	includeEnvironemtVariables = {},
		writer = require( './writers/consoleReadable.js' )();
	pub.log = function( logObject ) {
		Object.keys( includeEnvironemtVariables ).forEach( function( variable ) {
			logObject[ variable ] = process.env[ includeEnvironemtVariables[ variable ] ];
		} );
		logObject.time = new Date().toISOString();
		writer.output( logObject );
	};
	pub.getEntries = function( component ) { return writer.getEntries( component ); };
	pub.reset = function() { return writer.reset(); };
	pub.updateSettings = function( settings ) {
		pub.level = settings.level || pub.level;
		includeEnvironemtVariables = settings.includeEnvironemtVariables || includeEnvironemtVariables;
		if( settings.output )
			writer = require( './writers/' + settings.output + '.js' )( {} );
	};
	pub.useWriter = function( resolvedWriter ) {
		writer = resolvedWriter;
	};
	return pub;
};