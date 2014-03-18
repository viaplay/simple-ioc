module.exports = function() {
	var pub = {};
	pub.getDependencies = function( name, fn ) {
		var component = fn ? { fn: fn } : components[ name ];
		if( component ) {
			if( component.instance )
				return [];
			else {
				var dependencies = [];
				if( typeof( component.fn ) == 'function' ) {
					try {
						component.fn.toString()
							.replace( /\n/g, ' ' )
							.match( /function\s+\w*\s*\((.*?)\)/ )[1].split( /\s*,\s*/ )
							.map( function( parameter ) { return parameter.trim(); } )
							.forEach( function( parameter ) {
								if( parameter.length > 0 )
									dependencies.push( parameter );
							} );
						log.trace( 'dependencies for ' + name, dependencies.join( ', ' ) );
						return dependencies;
					}
					catch( ex ) {
						log.fatal( 'function malformatted', name );
					}
				}
				else
					log.fatal( 'getDependencies failed, function not registered', name );
			}
		}
		else
			log.fatal( 'getDependencies failed, not registered', name );
	};
	return pub;
};