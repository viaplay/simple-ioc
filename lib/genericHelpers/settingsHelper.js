module.exports = function() {
	var pub = {};
	pub.getSetting = function( settings, key ) {
		var keyParts = key.split( '.' );
		while( settings && keyParts.length )
			settings = settings[ keyParts.shift() ];
		return settings;
	};
	pub.mergeSettings = function( originalSettings, newSettings ) {
		Object.keys( newSettings ).forEach( function( prop ) {
			var value = newSettings[ prop ];
			if( value && typeof( value ) === 'object' && !Array.isArray( value ) ) {
				originalSettings[ prop ] = originalSettings[ prop ] || {};
				pub.mergeSettings( originalSettings[ prop ], newSettings[ prop ] );
			}
			else
				originalSettings[ prop ] = newSettings[ prop ];
		} );
	};
	return pub;
};