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

### ioc.autoRegister( path )

Automatically registers a component or a path with several components using filenames as name and returns the ioc.

### ioc.start( [func] )

Resolves all registered components and optionally injects a function.

### ioc.inject( [func] )

Injects a function.

### ioc.getLoaded( name )

Gets a loaded component by name.

### ioc.reset()

Resets the ioc, for testing purposes.

## Release notes

### 1.1.2


