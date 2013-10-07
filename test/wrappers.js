var assert = require( 'assert' );

var q = 0;

require( '../ioc' )
	.setSettings( {
		log: 5
	} )
	.registerRequired( 'unwrapped', function() {
		return {
			test: function( callback ) {
				setTimeout( function() { callback( true ); }, 10 );
			}
		};
	} )
	.registerRequired( 'wrapper', function() {
		return function( parentName, name, parameters, callback ) {
			var ts = new Date().getTime();
			callback( function( result ) {
				q++;
				console.log( parentName, name, new Date().getTime() - ts);
			} );
		};
	} )
	.registerRequired( 'parent', function( unwrapped, iocCallback ) {
		unwrapped.test( iocCallback );
	} )
	.registerWrapper( 'unwrapped', 'wrapper' )
	.start( function( unwrapped ) {
		unwrapped.test( function( result ) {
			assert.equal( q, 2 );
		} );
	} );
