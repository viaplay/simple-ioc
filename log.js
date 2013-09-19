module.exports = function() {
	var logLevel = 2,
		titleMinWidth = 30,
		levels = [
			'\033[30m\033[41mFATAL\033[0m',
			'\033[31mERROR\033[0m',
			'\033[33mWARNING\033[0m',
			'\033[32mINFO\033[0m',
			'\033[0mDEBUG\033[0m',
			'\033[37mTRACE\033[0m' ],
	log = function( level, component, title, message ) {
		if( level <= logLevel ) {
			var msg = ( typeof( message ) == 'function' ) ? message() : message;
			if( message ) {
				if( typeof( message ) == 'string' )
					console.log( levels[ level ], '(' + component + ')', title + ':', message );
				else {
					console.log( levels[ level ], '(' + component + ')', title );
					console.log( message );
				}
			}
			else
				console.log( levels[ level ], '(' + component + ')', title );
		}
	};

	return {
		clearLog: function() { console.log( '\033[2J\033[H=== IOC: Loggning started @' + new Date() + ' ===' ); },
		setLogLevel: function( minLogLevel ) { logLevel = minLogLevel; },
		fatal: function( component, title, message, omitTrace ) { log( 0, component, title, message );  if( !omitTrace ) console.trace(); process.exit( 1 ); },
		error: function( component, title, message ) { log( 1, component, title, message ); },
		warning: function( component, title, message ) { log( 2, component, title, message ); },
		info: function( component, title, message ) { log( 3, component, title, message ); },
		debug: function( component, title, message ) { log( 4, component, title, message ); },
		trace: function( component, title, message ) { log( 5, component, title, message ); }
	};
};
