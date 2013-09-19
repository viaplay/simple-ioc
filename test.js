var ioc = require( './ioc.js' )
	.setLogLevel( 5 )
	.setWaitingWarningTime( 1000 )
	.registerRequired( 'test1', function( readyCallback ) {
		setTimeout( function() {
			readyCallback( 1 );
		}, 5000 );
	} )
	.start( function() {
		console.log( 'done' );
	} );