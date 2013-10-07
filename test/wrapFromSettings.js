var assert = require( 'assert' );

var q = 0;

require( '../ioc' )
	.setSettings( 'settings', {
		instrumentation: {
			wrapTheseComponents: {
				unwrapped1: 'wrapper'
			}
		}
	} )
	.registerRequired( 'unwrapped1', function() {
		return {
			test: function( callback ) {
				setTimeout( function() { callback( true ); }, 10 );
			}
		};
	} )
	.registerRequired( 'unwrapped2', function() {
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
	.wrapFromSettings( 'instrumentation.wrapTheseComponents' )
	.start( function( unwrapped1, unwrapped2 ) {
		unwrapped1.test( function( result ) {
			unwrapped2.test( function( result ) {
				assert.equal( q, 1 );
			} );
		} );
	} );
