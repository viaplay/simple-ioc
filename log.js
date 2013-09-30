var logLevel = 2,
	jsonLevels = [
		'FATAL',
		'ERROR',
		'WARNING',
		'INFO',
		'DEBUG',
		'TRACE' ],
	readableLevels = [
		'\033[30m\033[41mFATAL\033[0m',
		'\033[31mERROR\033[0m',
		'\033[33mWARNING\033[0m',
		'\033[32mINFO\033[0m',
		'\033[0mDEBUG\033[0m',
		'\033[37mTRACE\033[0m' ],
	logSettings = {
		level: 2,
		plainOutput: true
	},
getLogObject = function( level, component, params ) {
	switch( params.length ) {
		case 0:
			return {
				level: level,
				component: component,
				time: new Date(),
				message: ''
			};
		case 1:
			return {
				level: level,
				component: component,
				time: new Date(),
				message: params[0]
			};
		case 2:
			return {
				level: level,
				component: component,
				time: new Date(),
				message: params[0],
				meta: params[1]
			};
		case 3:
			return {
				level: level,
				component: component,
				time: new Date(),
				message: params[0],
				meta: params[1],
				guid: params[2]
			};
		default:
			return {
				level: level,
				time: new Date(),
				component: params[0],
				message: params[1],
				meta: params[2],
				guid: params[3]
			};
	}
},
log = function( logObject ) {
	if( logSettings.plainOutput )
		logReadable( logObject );
	else
		logJson( logObject );
},
logReadable = function( logObject ) {
	if( logObject.meta ) {
		if( typeof( logObject.meta ) == 'string' )
			console.log( readableLevels[ logObject.level ], logObject.component ? '(' + logObject.component + ')' : '()', logObject.message + ':', logObject.meta );
		else {
			console.log( readableLevels[ logObject.level ], logObject.component ? '(' + logObject.component + ')' : '()', logObject.message );
			console.log( logObject.meta );
		}
	}
	else
		console.log( readableLevels[ logObject.level ], logObject.component ? '(' + logObject.component + ')' : '()', logObject.message );
},
logJson = function( logObject ) {
	logObject.level = jsonLevels[ logObject.level ];
	console.log( JSON.stringify( logObject ) );
};

var Log = function( iocParentName ) {
	this.iocParentName = iocParentName;
	this.fatal = function()		{ if( 0 > logSettings.level ) return; log( getLogObject( 0, this.iocParentName, arguments ) ); process.exit( 1 ); };
	this.error = function()		{ if( 1 > logSettings.level ) return; log( getLogObject( 1, this.iocParentName, arguments ) ); };
	this.warning = function()	{ if( 2 > logSettings.level ) return; log( getLogObject( 2, this.iocParentName, arguments ) ); };
	this.info = function()		{ if( 3 > logSettings.level ) return; log( getLogObject( 3, this.iocParentName, arguments ) ); };
	this.debug = function()		{ if( 4 > logSettings.level ) return; log( getLogObject( 4, this.iocParentName, arguments ) ); };
	this.trace = function()		{ if( 5 > logSettings.level ) return; log( getLogObject( 5, this.iocParentName, arguments ) ); };
	this.setLogLevel = function( level ) { logLevel = level; };
};

module.exports = function( iocParentName, settings ) {
	if( settings && settings.log )
		logSettings = settings.log;

	return new Log( iocParentName );
};
