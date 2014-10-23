var assert = require( 'assert' );

var log = {
		trace: function() { console.log( 'trace', arguments ); },
		debug: function() { console.log( 'debug', arguments ); },
		info: function() { console.log( 'info', arguments ); },
		warning: function() { console.log( 'warning', arguments ); },
		error: function() { console.log( 'error', arguments ); },
		fatal: function() { console.log( 'fatal', arguments ); process.exit(); }
	};

var componentFactory = require( '../../lib/componentFactory.js' )( log, require( '../../lib/dependencyParser.js' )( log ) );

var container = require( '../../lib/container.js' )();

container.registerComponent( componentFactory.createResolved( 'test1', function(  ) {} ) );
assert.ok( container.isComponentRegistered( 'test1' ) );
assert.equal( container.getComponent( 'test1' ).getName(), 'test1' );
assert.ok( container.areAllSingletonsResolved() );
assert.equal( container.getAllResolvingProblems().length, 0 );

container.registerComponent( componentFactory.createInjectable( 'test2', function( test1 ) {} ) );
assert.equal( container.getAllComponents().length, 2 );
assert.ok( !container.areAllSingletonsResolved() );
assert.equal( container.getAllResolvingProblems().length, 0 );
assert.equal( container.getNextResolvable().getName(), 'test2' );

container.registerComponent( componentFactory.createInjectable( 'test3', function( test4 ) {} ) );

assert.equal( container.getAllResolvingProblems().length, 1 );

container.registerComponent( componentFactory.createInjectable( 'test5', function( test4 ) {} ) );

container.registerComponent( componentFactory.createInjectable( 'test4', function( test3 ) {} ) );
console.log( container.getAllResolvingProblems() );
//assert.equal( container.getAllResolvingProblems().length, 0 );

container.registerComponent( componentFactory.createInjectable( 'test6', function( test5 ) {} ) );
container.registerComponent( componentFactory.createInjectable( 'test7', function( test6 ) {} ) );
/*
[ 

  'getComponentsWithUnreferedDependencies',
  'getAllComponentsUsages',
  'reset' ]
  */
