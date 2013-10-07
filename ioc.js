( function() {
	var path = require( 'path' ), fs = require( 'fs' ),
		log = require( './log.js' )( 'ioc' ),
		settings = require( './settings.js' )( require( './log.js' )( 'settings' ) ),
		container = require( './container.js' )( require( './log.js' )( 'container' ) ),
		files = require( './files.js' )( path, fs, require( './log.js' )( 'files' ), require( 'path' ).dirname( module.parent.filename ) ),
		startedCallback,
		started = false,

	register = function( name, pathOrLoaded, lifecycleTransient ) {
		if( typeof( pathOrLoaded ) == 'string' )
			container.register( name, require( files.getFullPath( pathOrLoaded ) ), lifecycleTransient ? false : true );
		else
			container.load( name, pathOrLoaded );
		return ioc;
	},
	registerRequired = function( name, required, lifecycleTransient ) {
		container.register( name, required, lifecycleTransient ? false : true );
		return ioc;
	},
	autoRegister = function( relativePath ) {
		log.trace( 'ioc', 'Auto regestering', relativePath, undefined );
		files.findValidFiles( relativePath, register );
		return ioc;
	},
	wrap = function( name, wrapperName ) {
		log.info( 'Wrapping', wrapperName + '( ' + name + ' )' );
		container.wrap( name, wrapperName );
		return ioc;
	},
	start = function( callback ) {
		log.info( 'ioc', 'Starting by resolving all', undefined, undefined );
		container.resolveAll( function() {
			log.info( 'ioc', 'All resolved', undefined, undefined );
			started = true;
			if( callback )
				container.inject( callback );
			if( startedCallback )
				container.inject( startedCallback );
		} );
		return ioc;
	},
	inject = function( fn ) {
		container.inject( fn );
		return ioc;
	},
	reset = function() {
		container.reset();
		settings.reset();
		register( 'ioc', ioc );
		return ioc;
	},
	setLogLevel = function( level ) {
		log.setLogLevel( level );
		return ioc;
	},
	setStartedCallback = function( fn ) {
		startedCallback = fn;
		if( started )
			inject( startedCallback );
		return ioc;
	},
	setSettings = function( name, data ) {
		settings.set( data );
		register( name, data );
		return ioc;
	},
	conditionalAutoRegister = function( settingsKey, conditionalValue, path ) {
		log.trace( 'ioc', 'ConditionalAutoRegister', settingsKey, undefined );
		return ( settings.matchesSetting( settingsKey, conditionalValue ) ) ? autoRegister( path ) : ioc;
	},
	conditionalPathAutoRegister = function( settingsKey, basePath ) {
		log.trace( 'ioc', 'ConditionalPathAutoRegister', settingsKey, undefined );
		var settingsValue = settings.getSetting( settingsKey );
		if( settingsValue ) {
			if( basePath.indexOf( '/', basePath.length - 1 ) < 0 )
				basePath += '/';
			return autoRegister( basePath + settingsValue );
		}
		else return ioc;
	},
	conditionalRegister = function( settingsKey, conditionalValue, name, pathOrLoaded, lifecycleTransient ) {
		log.trace( 'ioc', 'ConditionalRegister', settingsKey, undefined );
		return ( settings.matchesSetting( settingsKey, conditionalValue ) ) ? register( name, pathOrLoaded, lifecycleTransient ) : ioc;
	},
	conditionalRegisterRequired = function( settingsKey, conditionalValue, name, required, lifecycleTransient ) {
		log.trace( 'ioc', 'ConditionalRegisterRequired', settingsKey, undefined );
		return ( settings.matchesSetting( settingsKey, conditionalValue ) ) ? registerRequired( name, required, lifecycleTransient ) : ioc;
	},
	wrapFromSettings = function( settingsKey ) {
		log.trace( 'wrapFromSettings', settingsKey );
		var wrapperSettings = settings.getSetting( settingsKey );
		if( wrapperSettings ) {
			for( var name in wrapperSettings )
				wrap( name, wrapperSettings[ name ] );
		}
		return ioc;
	},

	setWaitingWarningTime = function( milliseconds ) {
		container.setWaitingWarningTime( milliseconds );
		return ioc;
	},
	setLogger = function( name, logger ) {
		var resolvedLogger = logger( 'ioc', settings.getSettings() );
		registerRequired( name, logger, true );
		log = resolvedLogger;
		settings.setLogger( logger( 'settings', settings.getSettings() ) );
		container.setLogger( logger( 'container', settings.getSettings() ) );
		files.setLogger( logger( 'files', settings.getSettings() ) );
		return ioc;
	},
	ioc = {
		setLogLevel: setLogLevel,
		setLogger: setLogger,
		register: register,
		registerRequired: registerRequired,
		autoRegister: autoRegister,
		start: start,
		inject: inject,
		reset: reset,
		setStartedCallback: setStartedCallback,
		setSettings: setSettings,
		conditionalAutoRegister: conditionalAutoRegister,
		conditionalPathAutoRegister: conditionalPathAutoRegister,
		conditionalRegister: conditionalRegister,
		conditionalRegisterRequired: conditionalRegisterRequired,
		setWaitingWarningTime: setWaitingWarningTime,
		wrap: wrap,
		wrapFromSettings: wrapFromSettings
	};

	register( 'ioc', ioc );
	module.exports = ioc;
} ).call( this );
