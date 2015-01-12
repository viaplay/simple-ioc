/*ioc:ignore*/
module.exports = function( pub, setup, callback, parentName ) {
	setup( function() {
		pub.value = parentName;
		setImmediate( callback );
	} );
};