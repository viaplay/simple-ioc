var settingsHelper = require( './genericHelpers/settingsHelper.js' )();
module.exports = function() {
	var pub = {},
		log = require( './log/log.js' )( 'IoC' ),
		settings = {
			log: {
				level: 0,
				includeEnvironemtVariables: { env: 'NODE_ENV' },
				output: 'devNull'
			}
		};
	log.updateSettings( settings.log );
	pub.getContainer = function( trueCallback ) {
		return require( './container.js' )( pub, trueCallback );
	};
	pub.setSettings = function() {
		Array.prototype.slice.call( arguments ).forEach( settingsHelper.mergeSettings.bind( undefined, settings ) );
		log.updateSettings( settings.log );
		return pub;
	};
	pub.getSettings = function() {
		return settings;
	};
	pub.useLogWriter = function( resolvedWriter ) {
		require( './log/logger.js' ).useWriter( resolvedWriter );
		return pub;
	};
	return pub;
};
