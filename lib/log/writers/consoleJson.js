module.exports = function() {
	var pub = {};
	var levels = [
		'FATAL',
		'ERROR',
		'WARNING',
		'INFO',
		'DEBUG',
		'TRACE'
	];
	pub.output = function( logObject ) {
		logObject.level = levels[ logObject.level ];
		console.log( JSON.stringify( logObject ) + '\r' );
	};
	pub.getEntries = function() {};
	pub.reset = function() {};
	return pub;
};
