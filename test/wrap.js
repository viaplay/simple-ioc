var assert = require( 'assert' );

var q = 1;

require( '../ioc' )
	.setSettings( {
		log: 5
	} )
	.registerRequired( 'unwrapped', function() {
		return {
			test1: function( x, callback ) {
				setTimeout( function() { callback( true, 1 ); }, 10 );
			},
			test2: function( a ) {
				for( i = 0 ; i < 10000 ; i++ );
				return a + 1;
			}
		};
	} )
	.registerRequired( 'wrapper', function() {
		return {
			async: function( context, parameters, callback ) {
				var ts = new Date().getTime();
				callback( function( r1, r2 ) {
					q++;
					assert.equal( parameters.length, 1 );
					assert.equal( parameters[ 0 ], 5 );
					assert.equal( r1, true );
					assert.equal( r2, 1 );
					assert.deepEqual( context, {
						caller: 'parent',
						wrapped: 'unwrapped.test1',
						async: true
					} );
				} );
			},
			sync: function( context, parameters, result ) {
				assert.equal( context.caller, 'anonymous' );
				assert.equal( context.wrapped, 'unwrapped.test2' );
				assert.equal( context.async, false );
				assert.deepEqual( parameters, [ 1 ] );
				assert.deepEqual( result, 2 );
			}
		};
	} )
	.registerRequired( 'parent', function( unwrapped, iocCallback ) {
		unwrapped.test1( 5, iocCallback );
	} )
	.wrap( 'unwrapped', 'wrapper' )
	.start( function( unwrapped ) {
		assert.equal( q, unwrapped.test2( 1 ) );
	} );
