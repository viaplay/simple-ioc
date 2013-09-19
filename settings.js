module.exports = function( log ) {
	var set = function( obj ) {
		settings.matchesSetting = function( settingsKey, conditionalValue ) {
			var settingsParts = settingsKey.split( '.' );
			var setting = obj;
			while( settingsParts.length > 0 && setting !== undefined ) {
				var part = settingsParts.shift();
				setting = setting[ part ];
			}
			if( setting === undefined )
				log.debug( 'settings', 'No settingsKey match', settingsKey + ' (' + conditionalValue + ')' );
			var matches = setting == conditionalValue;
			if( matches )
				log.debug( 'settings', 'Value matches setting', settingsKey + ' (' + conditionalValue + ')' );
			return matches;
		};
	},
	settings = {
		set: set
	};
	return settings;
};