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
	merge = function( o1, o2 ) {
		for( var prop in o2 )
			if( typeof( o2[ prop ] ) === 'object' && !Array.isArray( o2[ prop ] ) ) {
				o1[ prop ] = o1[ prop ] || {};
				merge( o1[ prop ], o2[ prop ] );
			}
			else
				o1[ prop ] = o2[ prop ];
	},
	set = function( arr ) {
		if ( settingsObj )
			log.debug( 'Replacing settings with new value' );
		var tempSettings = {};
		arr.forEach( function( item ) {
			merge( tempSettings, item );
		} );
		settingsObj = tempSettings;
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