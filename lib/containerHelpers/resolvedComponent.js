module.exports = function() {
	var pub = {};
	var ResolvedComponent = function( instance ) {
		var usages = [];
		Object.defineProperty( this, 'instance', {
			get: function() {
				return instance;
			}
		} );
		Object.defineProperty( this, 'usages', {
			get: function() { return usages.slice( 0 ); }
		} );
		this.addUsage = function( parentName ) {
			if( usages.indexOf( parentName ) < 0 && parentName !== 'resolver.js' )
				usages.push( parentName );
			return this;
		};

	};
	pub.get = function( instance ) {
		return new ResolvedComponent( instance );
	};
	return pub;
};