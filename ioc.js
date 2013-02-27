var registeredComponents = {};
var loadedComponents = {};
var isResolving = false;
var logLevel = 1;
var verifyCallback = null;
var forcedLog = {};

var register = function( name, pathOrLoaded, log ) {
	if( typeof( pathOrLoaded ) == 'string' ) {
		registeredComponents[name] = require( pathOrLoaded );
		forcedLog[name] = log;
	}
	else {
		loadedComponents[name] = pathOrLoaded;
		if( ( logLevel >= 2 ) || log )
			console.log( ' Loading created:        ' + name );
	}
	resolveAll();
	return ioc;
};

var isLoaded = function( name ) {
	return loadedComponents[ name ];
};

var getParameterNames = function( func ) {
	var result = [];
	var names = func.toString().match( /function\s+\w*\s*\((.*?)\)/ )[1].split( /\s*,\s*/ )
		.map( function( item ) { return item.trim(); } ).forEach( function( item ) {
			if( item.length > 0 )
				result.push( item );
		} );
	return result;
};

var getRegistered = function( name ) {
	return registeredComponents[ name ];
};

var inject = function( func ) {
	func.apply( ioc, getParameterNames( func ).map( function( parameterName ) { return resolve( parameterName ); } ) );
};

var resolve = function( name, callback ) {
	if( isLoaded( name ) )
		return loadedComponents[ name ];
	else {
		var timestamp = new Date();
		var registered = getRegistered( name );
		var parameters = [], callbackRegistered = false;
		var whenRegistered = function( loaded ) {
			delete registeredComponents[ name ];
			loadedComponents[ name ] = loaded;
			if( logLevel >= 2 || forcedLog[name] === true )
				console.log( ' Registered loaded:     ', name, 'in', ( new Date().getTime() - timestamp.getTime() ), 'ms' );
			if( logLevel >= 3 )
				console.log( 'Left:', Object.keys( registeredComponents ) );
			if( callback )
				callback();
			else
				return loaded;
		};
		getParameterNames( registered ).forEach( function( parameterName ) {
			if( parameterName == 'readyCallback' ) {
				parameters.push( whenRegistered );
				callbackRegistered = true;
			}
			else
				parameters.push( resolve( parameterName ) );
		} );
		if( logLevel >= 3 )
			console.log( ' Loading registered:     ' + name + '...' );
		if( callbackRegistered )
			registered.apply( ioc, parameters );			
		else
			return whenRegistered( registered.apply( ioc, parameters ) );
	}
};

var needsCallback = function( name ) {
	if( loadedComponents[ name ] )
		return false;
	else {
		var registered = getRegistered( name );
		if( registered )
			return getParameterNames( registered ).indexOf( 'readyCallback' ) >= 0;
		else
			throw 'IoC ERROR: Component "' + name + '" is not registered!';
	}
};

var haveDependienciesThatNeedsCallback = function( name ) {
	var parameterNames = getParameterNames( getRegistered( name ) );
	var indexOfReadyCallback = parameterNames.indexOf( 'readyCallback' );
	if( indexOfReadyCallback >= 0 )
		parameterNames.splice( indexOfReadyCallback, 1 );
	for( var i = 0 ; i < parameterNames.length ; i++ ) {
		if( needsCallback( parameterNames[i] ) ) {
			return true;
		}
	}
	return false;
};

var findNextRegisteredThatDoesNotHaveDependenciesThatNeedsCallback = function() {
	for( var name in registeredComponents ) {
		if( canBeResolved( name ) && !haveDependienciesThatNeedsCallback( name ) )
			return name;
	}
	return null;
};

var resolveAllRecursevly = function() {
	var name = findNextRegisteredThatDoesNotHaveDependenciesThatNeedsCallback();
	if( name )
		resolve( name, resolveAllRecursevly );		
	else {
		isResolving = false;
		if( verifyCallback && Object.keys( registeredComponents ).length == 0 )
			verifyCallback();		
	}
}

var resolveAll = function() {
	if( !isResolving ) {
		isResolving = true;
		resolveAllRecursevly();
	}
};

var canBeResolved = function( name ) {
	if( isLoaded( name ) )
		return true;
	var registered = getRegistered( name );
	if( !registered )
		return false;
	var parameterNames = getParameterNames( registered );
	var indexOfReadyCallback = parameterNames.indexOf( 'readyCallback' );
	if( indexOfReadyCallback >= 0 )
		parameterNames.splice( indexOfReadyCallback, 1 );
	if( parameterNames.length == 0 )
		return true;
	for( var i = 0 ; i < parameterNames.length ; i++ )
		if( !canBeResolved( parameterNames[i] ) )
			return false;
	return registeredComponents[ name ] ? true : false;
};

var fs = require( 'fs' );
var autoRegister = function( path, log ) {
	if( fs.lstatSync( path ).isDirectory() ) {
		fs.readdirSync( path ).forEach( function( name ) {
			var insertSlash = path.indexOf( '/', path.length - 1 ) >= 0 ? '' : '/';
			autoRegister( path + insertSlash + name );
		} );
	} 
	else {
		var name = path.split( '/' );
		name = name[ name.length - 1 ];
		var parts = name.split( '.' );
		var identifier = parts.splice( 0, parts.length - 1 ).join( '' );
		register( identifier, path, log );
	}
	return ioc;
};

var setLogLevel = function( level ) {
	logLevel = level;
	return ioc;
};

var verify = function( callback ) {
	if( Object.keys( registeredComponents ).length == 0 )
		callback();
	else
		verifyCallback = callback;
};

var ioc = {
	setLogLevel: setLogLevel,
	register: register,
	autoRegister: autoRegister,
	resolve: resolve,
	inject: inject,
	verify: verify
};

register( 'ioc', ioc );

module.exports = ioc;