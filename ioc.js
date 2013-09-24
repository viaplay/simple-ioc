( function() {
	var path = require( 'path' ), fs = require( 'fs' ),
		log = require( './log.js' )(),
		settings = require( './settings.js' )( log ),
		container = require( './container.js' )( log ),
		files = require( './files.js' )( path, fs, log, require( 'path' ).dirname( module.parent.filename ) ),
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
		log.trace( 'ioc', 'Auto regestering', relativePath );
		files.findValidFiles( relativePath, register );
		return ioc;
	},
	start = function( callback ) {
		log.info( 'ioc', 'Starting by resolving all' );
		container.resolveAll( function() {
			log.info( 'ioc', 'All resolved' );
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
		log.trace( 'ioc', 'ConditionalAutoRegister', settingsKey );
		return ( settings.matchesSetting( settingsKey, conditionalValue ) ) ? autoRegister( path ) : ioc;
	},
	conditionalRegister = function( settingsKey, conditionalValue, name, pathOrLoaded, lifecycleTransient ) {
		log.trace( 'ioc', 'ConditionalRegister', settingsKey );
		return ( settings.matchesSetting( settingsKey, conditionalValue ) ) ? register( name, pathOrLoaded, lifecycleTransient ) : ioc;
	},
	conditionalRegisterRequired = function( settingsKey, conditionalValue, name, required, lifecycleTransient ) {
		log.trace( 'ioc', 'ConditionalRegisterRequired', settingsKey );
		return ( settings.matchesSetting( settingsKey, conditionalValue ) ) ? registerRequired( name, required, lifecycleTransient ) : ioc;
	},
	setWaitingWarningTime = function( milliseconds ) {
		container.setWaitingWarningTime( milliseconds );
		return ioc;
	},
	ioc = {
		setLogLevel: setLogLevel,
		register: register,
		registerRequired: registerRequired,
		autoRegister: autoRegister,
		start: start,
		inject: inject,
		reset: reset,
		setStartedCallback: setStartedCallback,
		setSettings: setSettings,
		conditionalAutoRegister: conditionalAutoRegister,
		conditionalRegister: conditionalRegister,
		conditionalRegisterRequired: conditionalRegisterRequired,
		setWaitingWarningTime: setWaitingWarningTime
	};

	register( 'ioc', ioc );
	module.exports = ioc;
} ).call( this );
