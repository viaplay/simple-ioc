var fs = require( 'fs' ),
	path = require( 'path' ),
	IocError = require( '../genericHelpers/IocError.js' )(),
	log = require( '../log/log.js' )( 'files' ),
	anoymousParentResolver = require( '../genericHelpers/anonymousParentResolver.js' )();
module.exports = function() {
	var pub = {};
	var notifyLineCount = function( name, fileContent ) {
		var lineCount = fileContent.split( '\n' ).length;
		if( lineCount > 200 )
			log.warning( 'Component consists of more than 200 lines (' + lineCount + ')', name );
		else if( lineCount > 100 )
			log.info( 'Component consists of more than 100 lines (' + lineCount + ')', name );
	};
	var getModuleName = function( absolutePath ) {
		return path.basename( absolutePath, '.js' );
	};
	var getNormalizedPath = function( relativePath, stepsBack ) {
		return relativePath.indexOf( '/' ) === 0 ?
			relativePath :
			path.normalize( [ anoymousParentResolver.resolvePath( stepsBack ), relativePath ].join( '/' ) );
	};
	var hasValidFileEnding = function( absolutePath ) {
		return [ '.js' ].indexOf( path.extname( absolutePath ) ) >= 0;
	};
	var shouldIgnore = function( fileContent ) {
		return fileContent.replace( /\n|\r/g, '' ).search( /\/\*(.*ioc:ignore.*?)\*\// ) >= 0;
	};
	var isAlreadyResolved = function( fileContent ) {
		return fileContent.replace( /\n|\r/g, '' ).search( /\/\*(.*ioc:noresolve.*?)\*\// ) >= 0;
	};
	var addToStore = function( store, name, required ) {
		if( !store[ name ] )
			store[ name ] = required;
		else
			throw new IocError( 'Component with same name exists in path', name );
	};
	var addToResult = function( result, absolutePath, omitFileIocComments, omitFileLengthLogging ) {
		var fileContent = ( omitFileIocComments && omitFileLengthLogging ) ? undefined : fs.readFileSync( absolutePath, 'utf-8' ),
			isResolved = omitFileIocComments ? false : isAlreadyResolved( fileContent ),
			isIgnored = omitFileIocComments ? false : shouldIgnore( fileContent );
		if( !isIgnored ) {
			var required = require( absolutePath );
			if( isResolved )
				addToStore( result.resolved, getModuleName( absolutePath ), required );
			else {
				var possibleName = required.toString().match( /\W*function\s*([^\(]*)\(/ ),
					name = possibleName[ 1 ].length ? possibleName[ 1 ] : getModuleName( absolutePath );
				addToStore( result.injectables, name, required );
			}
		}
	};
	var scanPath = function( absolutePath, omitFileIocComments, omitFileLengthLogging ) {
		var result = { injectables: {}, resolved: {} };
		( function recursive( recursivePath ) {
			if( fs.existsSync( recursivePath ) ) {
				if( fs.lstatSync( recursivePath ).isDirectory() )
					fs.readdirSync( recursivePath ).forEach( function( filename ) {
						recursive( path.resolve( recursivePath, filename ) );
					} );
				else if( hasValidFileEnding( recursivePath ) )
					addToResult( result, recursivePath, omitFileIocComments, omitFileLengthLogging );
			}
			else
				throw( new Error( 'Could not find file: ' + recursivePath ) );
		} )( absolutePath );
		return result;
	};
	pub.getModulesInPath = function( relativePath, omitFileIocComments, omitFileLengthLogging, stepsBack ) {
		return scanPath( getNormalizedPath( relativePath, ( stepsBack || 0 ) + 1 ), omitFileIocComments, omitFileLengthLogging );
	};
	return pub;
};