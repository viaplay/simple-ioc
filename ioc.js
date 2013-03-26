( function() {
	var logLevels = { FATAL: 0, ERROR: 1, WARNING: 2, INFO: 3, DEBUG: 4 },
		logNames = [ 'FATAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG' ],
		logColors = [ '\033[30m\033[41m', '\033[31m', '\033[33m', '\033[37m', '\033[37m' ],
		resetColor = '\033[0m',
		logLevel = logLevels.FATAL,
		basePath = require( 'path' ).dirname( module.parent.filename )
		registeredComponents = {},
		loadedComponents = {};

	var logFunction = function( level, title, message ) {
		var name = logNames[level], color = logColors[level], output = [ '   ' ];
		output.push( color + name + resetColor + new Array( 9 - name.length ).join( ' ' ) );
		output.push( title + ':', new Array( 25 - title.length ).join( ' ' ) );
		console.log( output.join( '' ), message );
	};

	var logMessage = function( level, title, message ) {
		if( level <= logLevel )
			logFunction( level, title, typeof( message ) == 'function' ? message() : message );
		if( level == 0 )
			process.exit( 1 );
	};

	var register = function( name, pathOrLoaded ) {
		if( typeof( pathOrLoaded ) == 'string' )
			registerComponent( name, getFullPath( pathOrLoaded ) );
		else
			loadComponent( name, pathOrLoaded );
		return ioc;
	};
	var registerRequired = function( name, required ) {
		registeredComponents[name] = required;
		return ioc;
	}

	var getLoaded = function( name ) { return loadedComponents[ name ]; }
	var getRegistered = function( name ) { return registeredComponents[ name ]; }
	var isLoaded = function( name ) { return getLoaded( name ) ? true : false; }
	var isRegistered = function( name ) { return getRegistered( name ) ? true : false; }
	var isRegisteredOrLoaded = function( name ) { return isLoaded( name ) || isRegistered( name ); }
	var loadComponent = function( name, loaded ) { 
		loadedComponents[ name ] = loaded;
		if( isRegistered( name ) )
			delete registeredComponents[ name ];
		if( !loaded )
			logMessage( logLevels.WARNING, 'Load failed', name + ' did not return anything' );
		logMessage( logLevels.INFO, 'Loaded', name );
	};
	var registerComponent = function( name, path ) {
		registeredComponents[name] = require( path );
		logMessage( logLevels.DEBUG, 'Regestering', name )
	}
	var getRegisteredSafe = function( name, callerName ) {
		if( !isRegistered( name ) ) {
			logMessage( logLevels.FATAL, 'Not registered', callerName + '( ' + name + ' )' );
		} else
			return getRegistered( name );
	};

	var getRegisteredParameterNames = function( nameOrFunc, omitReadyCallback ) {
		var func = typeof( nameOrFunc ) == 'function' ? nameOrFunc : getRegisteredSafe( nameOrFunc, 'getRegisteredParameterNames' );
		var result = [];
		func.toString().match( /function\s+\w*\s*\((.*?)\)/ )[1].split( /\s*,\s*/ )
			.map( function( parameter ) { return parameter.trim(); } )
			.forEach( function( parameter ) {
				if( parameter.length > 0 && ( ( !omitReadyCallback ) || ( parameter != 'readyCallback' ) ) )
					result.push( parameter );
			} );
		return result;
	};
	var needsCallback = function( name ) {
		if( isLoaded( name ) )
			return false;
		var registered = getRegisteredSafe( name, 'needsCallback' );
		var parameterNames = getRegisteredParameterNames( name );
		return parameterNames.indexOf( 'readyCallback' ) >= 0;
	};
	var isResolvable = function( name ) {
		if( isLoaded( name ) ) return true;
		else if( !isRegistered( name ) ) return false;
		else {
			var parameterNames = getRegisteredParameterNames( name, true );
			for( var i = 0 ; i < parameterNames.length ; i++ )
				if( !isResolvable( parameterNames[i] ) )
					return false;
			return true;
		}
	};
	var hasRegisteredAllDependenciesLoaded = function( name ) {
		var parameterNames = getRegisteredParameterNames( name, true );
		for( var i = 0 ; i < parameterNames.length ; i++ )
			if( !isLoaded( parameterNames[i] ) )
				return false;
		return true;
	};
	var isResolvableWhithoutCallback = function( name ) {
		if( isLoaded( name ) ) return true;
		else if( !isRegistered( name ) ) return false;
		else if( needsCallback( name ) ) return false;
		else {
			var parameterNames = getRegisteredParameterNames( name, true );
			for( var i = 0 ; i < parameterNames.length ; i++ )
				if( !isResolvableWhithoutCallback( parameterNames[i] ) )
					return false;
			return true;
		}
	};
	var resolveWithoutCallback = function( name ) {
		logMessage( logLevels.DEBUG, 'Resolving', name + ' (no callback)' );
		var timestamp = new Date();
		var registered = getRegisteredSafe( name, 'resolveWithoutCallback' );
		var params = getRegisteredParameterNames( name ).map( function( parameterName ) {
			return getLoaded( parameterName );
		} );
		var loaded = registered.apply( this, params );
		logMessage( logLevels.INFO, 'Loadtime', ( new Date().getTime() - timestamp.getTime() ) + 'ms (' + name + ')' );
		loadComponent( name, loaded );
		logMessage( logLevels.DEBUG, 'Left', Object.keys( registeredComponents ).toString() );
		return getLoaded( name );
	};
	var resolveWithCallback = function( name, callback ) {
		logMessage( logLevels.DEBUG, 'Resolving', name + ' (callback)' );
		var timestamp = new Date();
		var registered = getRegisteredSafe( name );
		var whenLoaded = function( loaded ) {
			logMessage( logLevels.INFO, 'Loadtime', ( new Date().getTime() - timestamp.getTime() ) + 'ms (' + name + ')' );
			loadComponent( name, loaded );
			logMessage( logLevels.DEBUG, 'Left', Object.keys( registeredComponents ).toString() );
			callback( loaded );
		};
		var params = getRegisteredParameterNames( name ).map( function( parameterName ) {
			return parameterName == 'readyCallback' ?
				whenLoaded : 
				getLoaded( parameterName );
		} );
		registered.apply( this, params );
	};
	var resolve = function( name, callback ) {
		if( !hasRegisteredAllDependenciesLoaded( name ) ) {
			logMessage( logLevels.FATAL, 'Resolve failed', 'Not all dependencies loaded (' + name + ')' );
		}
		else if( isResolvableWhithoutCallback( name ) ) {
			callback( resolveWithoutCallback( name ) );
		}
		else {
			resolveWithCallback( name, callback );
		}
	};
	var getNextResolvable = function( registeredNames ) {
		for( var i = 0 ; i < registeredNames.length ; i ++ )
			if( hasRegisteredAllDependenciesLoaded( registeredNames[i] ) )
				return registeredNames[i];
		return null;
	};
	var findUnresolvableComponent = function() {
		var registeredNames = Object.keys( registeredComponents );
		for( var i = 0 ; i < registeredNames.length ; i++ ) {
			var params = getRegisteredParameterNames( registeredNames[i], true );
			for( var j = 0 ; j < params.length ; j++ ) {
				if( ( !isLoaded( params[j] ) ) && ( !isRegistered( params[j] ) ) ) {
					return { component: registeredNames[i], dependency: params[j] };
				}
			}
		}
		return null;
	};
	var start = function( callback ) {
		var recursive = function() {
			var registeredNames = Object.keys( registeredComponents );
			if( registeredNames.length == 0 ) {
				logMessage( logLevels.INFO, 'Done', 'All resolved' );
				if( callback )
					inject( callback );
			}
			else {
				var resolvableName = getNextResolvable( registeredNames );
				logMessage( logLevels.DEBUG, 'Trying', resolvableName );

				if( resolvableName ) {
					resolve( resolvableName, recursive );
				}
				else {
					var unresolvable = findUnresolvableComponent();
					logMessage( logLevels.FATAL, 'Unresolvable', unresolvable.component + '( ' + unresolvable.dependency + ' )' );
				}
			}
		}
		recursive();
	};

	var getFullPath = function( relativePath ) {
		var path = require( 'path' ),
			fs = require( 'fs' ),
			result;
		if( ( relativePath.indexOf( '/' ) == 0 ) && fs.existsSync( relativePath ) )
			result = relativePath;
		else {
			var localBasePath = '',
				stackTrace = ( new Error() ).stack.split( '\n' );
			stackTrace.shift();
			while( ( localBasePath.length == 0 ) && ( stackTrace.length > 0 ) ) {
				var row = stackTrace.shift().trim();
				if( row.indexOf( 'simple-ioc/ioc.js:' ) < 0 )
					localBasePath = path.dirname( row.substring( row.indexOf( '(' ) + 1, row.indexOf( ':' ) ) );
			}
			if( fs.existsSync( path.join( localBasePath, relativePath ) ) )
				result = path.join( localBasePath, relativePath );
			else if( fs.existsSync( path.join( localBasePath, relativePath + '.js' ) ) )
				result = path.join( localBasePath, relativePath + '.js' );
			else if( fs.existsSync( path.join( basePath, relativePath ) ) )
				result = path.join( basePath, relativePath );
			else if( fs.existsSync( path.join( basePath, relativePath + '.js' ) ) )
				result = path.join( basePath, relativePath + '.js' );
			else
				logMessage( logLevels.FATAL, 'Could not find', relativePath );			
		}
		result = path.resolve( result )
		logMessage( logLevels.DEBUG, 'getFullPathResult', result );
		return result;
	};

	var autoRegister = function( relativePath ) {
		var path = require( 'path' ),
			fs = require( 'fs' );
		logMessage( logLevels.DEBUG, 'Auto registering', relativePath );
		var fullPath = getFullPath( relativePath );
		if( fs.lstatSync( fullPath ).isDirectory() ) {
			fs.readdirSync( fullPath ).forEach( function( name ) {
				autoRegister( path.join( fullPath, name ) );
			} );
		}
		else
			registerComponent( path.basename( fullPath, path.extname( fullPath ) ), fullPath );
		return ioc;
	};
	var setLogLevel = function( level ) {
		logLevel = level;
		return ioc;
	};	
	var inject = function( func ) {
		func.apply( this, getRegisteredParameterNames( func ).map( function( parameterName ) { return getLoaded( parameterName ); } ) );
	};
	var reset = function() {
		registeredComponents = {};
		loadedComponents = {};
		register( 'ioc', ioc );
		return ioc;
	};
	var setLogFunction = function( func ) {
		logFunction = func;
		return ioc;
	};

	var ioc = {
		setLogLevel: setLogLevel,
		setLogFunction: setLogFunction,
		register: register,
		registerRequired: registerRequired,
		autoRegister: autoRegister,
		start: start,
		inject: inject,
		getLoaded: getLoaded,
		reset: reset
	};
	register( 'ioc', ioc );

	module.exports = ioc;
} ).call( this );
