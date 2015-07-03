var logger = require( './logger.js' )(),
	applicationName = 'unknown';
try {
	var currentModule = module,
		path = require( 'path' );
	while( currentModule.parent )
		currentModule = currentModule.parent;
	applicationName = require( path.resolve( path.dirname( currentModule.filename ), 'package.json' ) ).name;
}
catch( ex ) {
	applicationName = 'unknown';
}
module.exports = function( parentName ) {
	var pub = {};
	var log = function( level, message, data ) {
		if( level <= logger.level ) {
			logger.log( {
				level: level,
				time: new Date().toISOString(),
				application: applicationName,
				component: parentName,
				message: message,
				meta: data
			} );
		}
	};
	pub.trace = log.bind( undefined, 5 );
	pub.debug = log.bind( undefined, 4 );
	pub.info = log.bind( undefined, 3 );
	pub.warning = log.bind( undefined, 2 );
	pub.error = log.bind( undefined, 1 );
	pub.fatal = function( message, data ) {
		log( 0, message, data );
		process.exit( 1 );
	};
	pub.updateSettings = logger.updateSettings;
	pub.getEntries = logger.getEntries;
	pub.reset = logger.reset;
	pub.useWriter = logger.useWriter;
	return pub;
};
