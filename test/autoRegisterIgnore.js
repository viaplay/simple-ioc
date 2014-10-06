var assert = require( 'assert' );

require( '../ioc' )
	.setLogLevel( 5 )
	.autoRegister( './data' )
	.start( function( noflag, noresolve, multiexports ) {
		assert.equal( noflag(), 'chupacabra bar' );
    assert.equal(noresolve('bonjour'), 'bonjour');
    assert.equal(multiexports.foo, 'bar');
	} );


