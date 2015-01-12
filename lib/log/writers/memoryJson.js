module.exports = function() {
	var pub = {};
	var levels = [
			'FATAL',
			'ERROR',
			'WARNING',
			'INFO',
			'DEBUG',
			'TRACE'
		],
		store = [];
	pub.output = function( logObject ) {
		logObject.level = levels[ logObject.level ];
		store.push( logObject );
	};
	pub.getEntries = function( component ) {
		return component ? store.filter( function( entry ) {
			return entry.component === component;
		} ) : store;
	};
	pub.reset = function() { store = []; };
	return pub;
};