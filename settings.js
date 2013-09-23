module.exports = function( log ) {

	var settingsObj;

	function getSetting( settingsKey ) {
		var settingsParts = settingsKey.split( '.' );
		var setting = settingsObj;
		while( settingsParts.length > 0 && setting !== undefined ) {
			var part = settingsParts.shift();
			setting = setting[ part ];
		}
		return setting;
	}

	var set = function( obj ) {
		if ( settingsObj )
			log.debug( 'settings', 'Replacing settings with new value' );
		settingsObj = obj;
	},
	reset = function() {
		settingsObj = undefined;
	},
	matchesSetting = function( settingsKey, conditionalValue ) {
		var setting = getSetting( settingsKey );
		log.debug( 'settings', 'settings', settingsObj );
		if( setting === undefined )
			log.debug( 'settings', 'No settingsKey match', settingsKey + ' (' + conditionalValue + ')' );
		var matches = setting == conditionalValue;
		if( matches )
			log.debug( 'settings', 'Value matches setting', settingsKey + ' (' + conditionalValue + ')' );
		return matches;
	};
	settings = {
		set: set,
		reset: reset,
		matchesSetting: matchesSetting
	};
	return settings;
};