require( './../ioc.js' )
	.setLogLevel( 5 )
	.setWaitingWarningTime( 10 )
	.registerRequired( 'test2', function() { return 1; } )
	.registerRequired( 'test3', function() { return 1; } )
	.registerRequired( 'test1', function( test2, test3, readyCallback ) {
		setTimeout( function() {
			readyCallback( 1 );
		}, 50 );
	} )
	.start( function() {
		console.log( 'done' );
	} );
