var assert = require( 'assert' );

require( '../ioc' )
	.setLogLevel( 5 )
	.autoRegister( './data' )
	.start( function( noflag ) {
		assert.equal( noflag(), 'chupacabra' );
	} );


