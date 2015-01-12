var dependencyParser = require( './dependencyParser.js' )();
module.exports = function() {
	var pub = {};
	var InjectableComponent = function( fn ) {
		var usages = [],
			waiting = [],
			dependencies = dependencyParser.getDependencies( fn );
		Object.defineProperty( this, 'dependencies', {
			get: function() { return dependencies; }
		} );
		Object.defineProperty( this, 'fn', {
			get: function() { return fn; }
		} );
		Object.defineProperty( this, 'isTransient', {
			get: function() { return dependencies.hasParentName; }
		} );
		Object.defineProperty( this, 'usages', {
			get: function() { return usages.slice( 0 ); }
		} );
		Object.defineProperty( this, 'hasWaiting', {
			get: function() { return waiting.length > 0; }
		} );
		Object.defineProperty( this, 'waiting', {
			get: function() {
				if( this.hasWaiting )
					return waiting.pop();
				else
					throw new Error( 'Component has no waiting' );
			},
			set: function( value ) {
				waiting.push( value );
			}
		} );
		this.addUsage = function( parentName ) {
			if( usages.indexOf( parentName ) < 0 && parentName !== 'resolver.js' )
				usages.push( parentName );
			return this;
		};
	};
	pub.get = function( fn ) {
		return new InjectableComponent( fn );
	};
	return pub;
};
