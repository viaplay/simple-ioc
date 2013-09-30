module.exports = function( log ) {
	var settingsObj,
	getSetting = function( settingsKey ) {
		var settingsParts = settingsKey.split( '.' );
		var setting = settingsObj;
		while( settingsParts.length > 0 && setting !== undefined ) {
			var part = settingsParts.shift();
			setting = setting[ part ];
		}
		return setting;
	},
	set = function( obj ) {
		if ( settingsObj )
			log.debug( 'Replacing settings with new value' );
		settingsObj = obj;
	},
	reset = function() {
		settingsObj = undefined;
	},
	matchesSetting = function( settingsKey, conditionalValue ) {
		var setting = getSetting( settingsKey );
		if( setting === undefined )
			log.debug( 'No settingsKey match', settingsKey + ' (' + conditionalValue + ')' );
		var matches = setting == conditionalValue;
		if( matches )
			log.debug( 'Value matches setting', settingsKey + ' (' + conditionalValue + ')' );
		return matches;
	},
	getSettings = function() {
		return settingsObj;
	},
	setLogger = function( logger ) {
		log = logger;
	};
	settings = {
		set: set,
		reset: reset,
		getSetting: getSetting,
		matchesSetting: matchesSetting,
		getSettings: getSettings,
		setLogger: setLogger
	};
	return settings;
};