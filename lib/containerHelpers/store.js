var ProblemTypes = require( '../types/ProblemTypes.json' ),
	resolvedComponent = require( '../containerHelpers/resolvedComponent.js' )(),
	log = require( '../log/log.js' )( 'container' );
module.exports = function() {
	var pub = {};

	var injectableSingletonStore = {},
		injectableTransientStore = {},
		resolvedStore = {};

	var getCyclicDependencies = function( name, parents ) {
		if( !pub.isRegistered( name ) || pub.isResolved( name ) )
			return [];
		else {
			parents = parents || [];
			if( parents.indexOf( name ) >= 0 )
				return parents.concat( name );
			else {
				var dependencies = pub.getInjectable( name ).dependencies.nonReserved;
				for( var i = 0 ; i < dependencies.length ; i ++ ) {
					var chain = getCyclicDependencies( dependencies[ i ], parents.concat( name ) );
					if( chain.length )
						return chain;
				}
				return [];
			}
		}
	};
	pub.getResolvingProblems = function( name ) {
		if( pub.isResolved( name ) )
			return undefined;
		else if( !pub.isRegistered( name ) )
			return { name: name, errors: [ { problemType: ProblemTypes.notRegistered } ] };
		else {
			var problems = { name: name, errors: [] },
				cyclic = pub.getCyclicDependencies( name ),
				nonReservedDependenciesNames = pub.getInjectable( name ).dependencies.nonReserved,
				nonRegisteredDependencies = nonReservedDependenciesNames.filter( function( dependencyName ) {
					return !pub.isRegistered( dependencyName );
				} ),
				nonResolvableDependencies = nonReservedDependenciesNames.filter( function( dependencyName ) {
					return !pub.isResolvable( dependencyName ) &&
						pub.isRegistered( dependencyName ) &&
						cyclic.indexOf( dependencyName ) < 0;
				} );
			if( cyclic.length )
				problems.errors.push( { problemType: ProblemTypes.cyclicDependency, dependencyNames: cyclic.slice( 1 ) } );
			if( nonRegisteredDependencies.length )
				problems.errors.push( { problemType: ProblemTypes.dependencyNotRegistered, dependencyNames: nonRegisteredDependencies } );
			if( nonResolvableDependencies.length )
				problems.errors.push( { problemType: ProblemTypes.dependencyNotResolvable, dependencyNames: nonResolvableDependencies } );
			return problems.errors.length ? problems : undefined;
		}
	};

	pub.getCyclicDependencies = function( name ) {
		var cyclicDependencies = getCyclicDependencies( name );
		return cyclicDependencies[ 0 ] === cyclicDependencies[ cyclicDependencies.length - 1 ] ? cyclicDependencies : [];
	};

	pub.getAllNonResolved = function() {
		var resolvedComponents = Object.keys( resolvedStore );
		return Object.keys( injectableSingletonStore ).filter( function( item ) {
			return resolvedComponents.indexOf( item ) < 0;
		} );
	};
	pub.isResolved = function( name ) { return !!resolvedStore[ name ]; };
	pub.getResolved = function( name ) { return resolvedStore[ name ]; };
	pub.setResolved = function( name, resolved ) { resolvedStore[ name ] = resolved; };

	pub.isRegistered = function( name ) { return pub.isResolved( name ) || !!injectableSingletonStore[ name ] || !!injectableTransientStore[ name ]; };

	pub.getInjectable = function( name ) { return injectableSingletonStore[ name ] || injectableTransientStore[ name ]; };
	pub.setInjectable = function( name, injectable ) {
		( injectable.isTransient ? injectableTransientStore : injectableSingletonStore )[ name ] = injectable;
	};
	pub.isResolvable = function( name ) {
		if( pub.isResolved( name ) )
			return true;
		else if( !pub.isRegistered( name ) ) {
			try {
				pub.setResolved( name, resolvedComponent.get( require( name ) ) );
				log.debug( 'Automatic required component', name );
				return true;
			}
			catch( ex ) {
				return false;
			}
		}
		else if( getCyclicDependencies( name ).length )
			return false;
		else
			return !pub.getInjectable( name ).dependencies.nonReserved
				.some( function( dependency ) {
					return !pub.isResolvable( dependency );
				} );
	};
	pub.getComponentCount = function() {
		return Object.keys( injectableSingletonStore ).length + Object.keys( injectableTransientStore ).length + Object.keys( resolvedStore ).length;
	};
	pub.getAllResolvable = function() {
		return pub.getAllNonResolved().filter( pub.isResolvable );
	};
	pub.getAllResolvingProblems = function() {
		return pub.getAllNonResolved().map( function( name ) {
			return pub.getResolvingProblems( name );
		} ).filter( function( problems ) {
			return problems;
		} );
	};
	pub.addUsage = function( name, parentName ) {
		( pub.getResolved( name ) || pub.getInjectable( name ) ).addUsage( parentName );
	};
	var getUsages = function( store ) {
		return Object.keys( store ).filter( function( name ) {
			return !store[ name ].usages.length && [ 'ioc', 'container', 'errRerouter' ].indexOf( name ) < 0;
		} );
	};
	pub.getUnreferencedComponents = function() {
		return getUsages( resolvedStore ).concat( getUsages( injectableTransientStore ) );
	};
	pub.removeRegistered = function( name ) {
		if( resolvedStore[ name ] ) {
			if( resolvedStore[ name ].usages.length )
				throw new Error( 'Cannot remove used component: ', name );
			else
				delete resolvedStore[ name ];
		}
		delete injectableSingletonStore[ name ];
		delete injectableTransientStore[ name ];
	};
	return pub;
};