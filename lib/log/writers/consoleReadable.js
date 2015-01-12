module.exports = function() {
	var pub = {};
	var levels = [
		'\033[30m\033[41mFATAL\033[0m',
		'\033[31mERROR\033[0m',
		'\033[33mWARNING\033[0m',
		'\033[32mINFO\033[0m',
		'\033[0mDEBUG\033[0m',
		'\033[37mTRACE\033[0m'
	];
	pub.output = function( logObject ) {
		console.log(
			levels[ logObject.level ],
			[ '(', logObject.component, ')' ].join( '' ),
			logObject.message + ( logObject.meta ? ':' : '' ),
			logObject.meta ? typeof( logObject.meta ) === 'string' ? logObject.meta : JSON.stringify( logObject.meta ) : ''
		);
	};
	pub.getEntries = function() {};
	pub.reset = function() {};
	return pub;
};
