require( './ioc.js' )
	.setLogLevel( 5 )
	.autoRegister( './tests/' )
	.start( function() {
		console.log( 'IoC done...' );
	} );