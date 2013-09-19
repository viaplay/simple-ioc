simple-ioc
==========

Simple Dependency Injection for node.js

## Installation

```
npm install simple-ioc
```

## Synopsis

An example of setting up the ioc

```javascript
require( 'simple-ioc' )
	.setLogLevel( 3 )
	.register( 'settings', require( './configuration/settings' ) )
	.register( 'packageInfo', require( './package.json' ) )
	.register( 'amqp', require( 'amqp' ) )
	.autoRegister( './lib/' )
	.register( 'app', './handlers/itemQueryHandler.js' )
	.start( function( packageInfo, ioc ) {
		// ioc not used here but can be injected
		console.log( 'Application started, version:', packageInfo.version );
	} );
```

An example of an injected component, in this case './handlers/itemQueryHandler.js'

```javascript
module.exports = function( settings, amqp ) {

	...some code...
	
	return {
		...something...
	};
};
```

## Methods

### ioc.setLogLevel( logLevel )

Sets the level of logging and returns the ioc

- `0`: FATAL
- `1`: ERROR
- `2`: WARNING
- `3`: INFO
- `4`: DEBUG
- `5`: TRACE

Example:

```javascript
ioc.setLogLevel( 1 );
```
Only outputs FATAL and ERROR logs.

NOTE: FATAL errors exists the application.

### ioc.setLogFunction( logFunction )

Sets the a log function and returns the ioc.

By default simple-ioc logs to console, but can be changed.

Simple-ioc calls the function with the following parameters:

```javascript
function( level, title, message )
```

### ioc.register( name, pathOrLoaded )

Registers a component and returns the ioc.

### ioc.registerRequired( name, function )

Registers a required component and returns the ioc.

Example:
```javascript
ioc.registerRequired( 'module_from_other_project', require( 'module_from_other_project_in_node_modules' ) );
```

### ioc.autoRegister( path )

Automatically registers a component or a path with several components using filenames as name and returns the ioc.

Example:
```javascript
ioc.autoRegister( './lib/' );
```

vill register all .js files under lib folder.

### ioc.start( [func] )

Resolves all registered components and optionally injects a function.

Example:
```javascript
ioc.start( function( settings, packageInfo ) {
	...some code that is depending on settings and packageInfo...
} );
```

Start can be called again if additional components are registered after start.

### ioc.inject( [func] )

Injects a function. Normally only used in tests

Example:
```javascript
ioc.inject( function( settings, packageInfo ) {
	...some code that is depending on settings and packageInfo...
} );
```

Inject is intended to be used only in tests.

Note: Inject does not resolve or load registered components. The method assumes ``` start() ``` was called before injection of registered components.

### ioc.getLoaded( name )

Gets a loaded component by name.

Example:
```javascript
var settings = ioc.getLoaded( 'settings' );
```
getLoaded is intended to be used only in tests.

Note: getLoaded does not resolve or load registered components. The method assumes ``` start() ``` was called before getLoaded of registered components.

### ioc.reset()

Resets the ioc, for testing purposes.

Example:
```javascript
	ioc.reset();
```

reset is intended to be used only in tests.

## Release notes

### 1.1.12




