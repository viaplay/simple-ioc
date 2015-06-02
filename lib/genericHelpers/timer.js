var log = require( '../log/log.js' )( 'timer' );
module.exports = function( waitingTime ) {
	var pub = {},
		intervalObject,
		timestamp,
		stack = [];
	var startTimer = function() {
		timestamp = Date.now();
		if( stack.length )
			intervalObject = setInterval( logWarning, waitingTime );
	};
	var stopTimer = function() {
		if( intervalObject )
			clearInterval( intervalObject );
		intervalObject = undefined;
	};
	var logWarning = function() {
		log.warning( 'Waiting for callback from', [ stack.join( ', ' ), '(' + Math.round( ( Date.now() - timestamp ) / 1000 ), 'seconds)' ].join( ' ' ) );
	};
	var updateTimer = function() {
		stopTimer();
		startTimer();
	};
	pub.startTimer = function( name ) {
		stack.unshift( name );
		updateTimer();
	};
	pub.stopTimer = function() {
		if( stack.length )
			stack.shift();
		updateTimer();
	};
	return pub;
};