var path = require( 'path' );
module.exports = function( parentModule ) {
	var pub = {};
	var getParentFilename = function( stepsBack ) {
		var prepareStackTraceBackup = Error.prepareStackTrace,
			err = new Error(),
			filename = module.filename;
		Error.prepareStackTrace = function( err, stack ) { return stack.map( function( item ) {
			return item.getFileName();
		} ); };
		var stack = err.stack;
		Error.prepareStackTrace = prepareStackTraceBackup;
		while( stack.length ) {
			if( !stepsBack )
				return filename;
			var top = stack.shift();
			if( top !== filename ) {
				stepsBack--;
				filename = top;
			}
		}
	};
	pub.resolveName = function( stepsBack ) {
		return getParentFilename( stepsBack ).split( '/' ).pop();
	};
	pub.resolvePath = function( stepsBack ) {
		return path.dirname( getParentFilename( stepsBack ) );
	};
	return pub;
};