module.exports = function() {
	var pub = {};

	var isParameterCallback = function( parameterName ) {
		return [ 'callback', 'iocCallback', 'readyCallback' ].indexOf( parameterName ) >= 0;
	};
	var isParameterParentName = function( parameterName ) {
		return [ 'parentName', 'iocParentName' ].indexOf( parameterName ) >= 0;
	};
	var isParameterPub = function( parameterName ) {
		return [ 'pub', 'iocPub' ].indexOf( parameterName ) >= 0;
	};
	var isParameterSetup = function( parameterName ) {
		return [ 'setup', 'iocSetup' ].indexOf( parameterName ) >= 0;
	};
	var isParameterUsed = function( fnString, parameterName ) {
		return isParameterParentName( parameterName ) || fnString.split( parameterName ).length > 2;
	};
	var getUnusedParameters = function( dependencies ) {
		return dependencies.filter( function( dependency ) {
			return !dependency.isUsed;
		} );
	};
	var getNonReservedDependenciesNames = function( dependencies ) {
		return dependencies.map( function( dependency ) {
			return dependency.name;
		} ).filter( function( dependencyName ) {
			return !pub.isReservedDependencyName( dependencyName );
		} );
	};
	var hasDependency = function( validationFn, dependencies ) {
		return dependencies.some( function( dependency ) {
			return validationFn( dependency.name );
		} );
	};
	var hasCallbackDependency = hasDependency.bind( undefined, isParameterCallback );
	var hasParentNameDependency = hasDependency.bind( undefined, isParameterParentName );
	var hasPubDependency = hasDependency.bind( undefined, isParameterPub );
	var hasSetupDependency = hasDependency.bind( undefined, isParameterSetup );

	pub.isReservedDependencyName = function( dependencyName ) {
		return isParameterCallback( dependencyName ) ||
			isParameterParentName( dependencyName ) ||
			isParameterPub( dependencyName ) ||
			isParameterSetup( dependencyName );
	};
	pub.getDependencies = function( fn ) {
		var fnString = fn.toString();
		var regex = /\((.*?)\).?=>/;

		if (fnString.indexOf('function') === 0) {
			regex = /function\s+\w*\s*\((.*?)\)/;
		}

		var parameters = fnString
			.replace( /\n/g, ' ' )
			.match(regex)[ 1 ].split( /\s*,\s*/ )
			.map( function( parameterName ) { return parameterName.trim(); } )
			.filter( function( parameterName ) { return parameterName.length > 0; } )
			.map( function( parameterName ) {
				return {
					name: parameterName,
					isReserved: pub.isReservedDependencyName( parameterName ),
					isUsed: isParameterUsed( fnString, parameterName ),
					isCallback: isParameterCallback( parameterName ),
					isParentName: isParameterParentName( parameterName ),
					isPub: isParameterPub( parameterName ),
					isSetup: isParameterSetup( parameterName )
				};
			} );
		var unusedParameters = getUnusedParameters( parameters );
		return {
			parameters: parameters,
			nonReserved: getNonReservedDependenciesNames( parameters ),
			unused: unusedParameters,
			hasUnused: unusedParameters.length > 0,
			hasCallback: hasCallbackDependency( parameters ),
			hasParentName: hasParentNameDependency( parameters ),
			hasPub: hasPubDependency( parameters ),
			hasSetup: hasSetupDependency( parameters ),
		};
	};
	return pub;
};