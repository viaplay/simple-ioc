var logger = require( './logger.js' )();
module.exports = function( parentName ) {
	var pub = {};
	var log = function( level, message, data ) {
		if( level <= logger.level )
			logger.log( { level: level, message: message, meta: data, component: parentName } );
	};
	pub.trace = log.bind( undefined, 5 );
	pub.debug = log.bind( undefined, 4 );
	pub.info = log.bind( undefined, 3 );
	pub.warning = log.bind( undefined, 2 );
	pub.error = log.bind( undefined, 1 );
	pub.fatal = function( message, data ) {
		logger.log( { level: 0, message: message, meta: data, component: parentName } );
		process.exit( 1 );
	};
	pub.updateSettings = logger.updateSettings;
	pub.getEntries = logger.getEntries;
	pub.reset = logger.reset;
	return pub;
};