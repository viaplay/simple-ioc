module.exports = function( test1module1, test1module2, test1module3, test1module4, callback ) {
	setImmediate( function() {
		callback( {
			value: test1module1.value + '-' + test1module2 + '-' + test1module3.value + '-' + test1module4.value
		} );
	} );
};