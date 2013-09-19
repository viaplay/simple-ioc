module.exports = function( path, fs, log, basePath ) {
	var validFileExtensions = [ '.js' ],
	isValidFileType = function( fullPath ) {
		return validFileExtensions.indexOf( path.extname( fullPath ) ) >= 0;
	},
	getFullPath = function( relativePath ) {
		log.trace( 'files', 'Resolving full path', relativePath );
		var result;
		if( ( relativePath.indexOf( '/' ) === 0 ) && fs.existsSync( relativePath ) )
			result = relativePath;
		else {
			var localBasePath = '',
				stackTrace = ( new Error() ).stack.split( '\n' );
			stackTrace.shift();
			while( ( localBasePath.length === 0 ) && ( stackTrace.length > 0 ) ) {
				var row = stackTrace.shift().trim();
				if( row.indexOf( '/simple-ioc/' ) < 0 )
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
				log.fatal( 'files', 'Could not find file', relativePath, true );
		}
		result = path.resolve( result );
		log.debug( 'files', 'Full path resolved', result );
		return result;
	},
	findValidFiles = function( relativePath, fn ) {
		log.trace( 'files', 'Finding files in', relativePath );
		var fullPath = getFullPath( relativePath );
		if( fs.lstatSync( fullPath ).isDirectory() )
			fs.readdirSync( fullPath ).forEach( function( name ) {
				findValidFiles( path.join( fullPath, name ), fn );
			} );
		else if( isValidFileType( fullPath ) )
			fn( path.basename( fullPath, path.extname( fullPath ) ), fullPath );
	};
	return {
		getFullPath: getFullPath,
		isValidFileType: isValidFileType,
		findValidFiles: findValidFiles
	};
};