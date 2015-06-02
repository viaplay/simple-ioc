var log = require( '../log/log.js' )( 'timer' );
module.exports = function( waitingTime ) {
	var pub = {},
		intervalObject,
		timestamp,
		started = {};
	var startTimer = function() {
		timestamp = Date.now();
		if( Object.keys( started ).length )
			intervalObject = setInterval( logWarning, waitingTime );
	};
	var stopTimer = function() {
		if( intervalObject )
			clearInterval( intervalObject );
		intervalObject = undefined;
	};
	var logWarning = function() {
		log.warning( 'Waiting for callback from', Object.keys( started ).map( function( name ) {
			return [ name, ': ', Math.round( ( Date.now() - started[ name ] ) / 1000 ), ' s.' ];
		} ) );
	};
	var updateTimer = function() {
		stopTimer();
		startTimer();
	};
	pub.startTimer = function( name ) {
		started[ name ] = Date.now();
		updateTimer();
	};
	pub.stopTimer = function( name ) {
		if( name )
			delete started[ name ];
		updateTimer();
	};
	return pub;
};