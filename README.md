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





### setLogLevel( level )

Sets the level of logging and returns the ioc.

Valid values are:

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
Will cause the ioc to only outputs FATAL and ERROR logs.

NOTE: All FATAL errors also exists the application.



### register( name, pathOrLoaded, lifecycleTransient )

Sets the level of logging and returns the ioc.

Valid values are:

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
Will cause the ioc to only outputs FATAL and ERROR logs.

NOTE: All FATAL errors also exists the application.


v




---------------------------------------
<a name="register" />
### register( name, pathOrLoaded, lifecycleTransient )

Regsisters a component in the ioc.

__Arguments__

* name - The name to identify the component when injecting
* pathOrLoaded - Can either be a filepath, which will be required by the ioc and injected, all other types (objects, functions etc) will just be loaded into the ioc.
* lifecycleTransient - Boolean, if set, the comopnent will be re-injected, when ever used as a dependency.

__Returns__

The ioc

__Example__

```js
ioc
	.register( 'async', require( 'async' ) ) // Registers the async library as async
	.register( 'test', './test.js', true ); // Requires './test.js', and when used as dependency will be injected every time
```
---------------------------------------
<a name="registerRequired" />
### registerRequired( name, required, lifecycleTransient )

Regsisters a function that will be injected when used as a dependency in the ioc.

__Arguments__

* name - The name to identify the component when injecting
* required - function that can be injected
* lifecycleTransient - Boolean, if set, the comopnent will be re-injected, when ever used as a dependency.

__Returns__

The ioc

__Example__

```js
ioc.registerRequired( 'myLibrary', require( 'my-library-in-node_modules' ) );
```
---------------------------------------
<a name="autoRegister" />
### autoRegister( relativePath )

Searches the path for files that ends with '.js' and registers all with the filename (exluding .js) as name.

__Arguments__

* relativePath - Path to folder or file.

__Returns__

The ioc

__Example__

```js
ioc.autoRegister( './app' ); // Registers all files in the folder 'app'
```
---------------------------------------
<a name="start" />
### start( callback )

Resolves and injects all registerd components that do not have a transient lifecycle.

__Arguments__

* callback - Function that will be injected when all components are resolved. If setStartedCallback has been called, this function will also be injected.

__Returns__

The ioc

__Example__

```js
ioc.start( function( async, myLibrary ) {
	// Code that uses async and myLibrary
} );
```
---------------------------------------
<a name="inject" />
### inject( fn )

Injects a function, similar to start, but will not resolve components that the function is not dependent of.

__Arguments__

* fn - Function that will be injected.

__Returns__

The ioc

__Example__

```js
ioc.inject( function( async, myLibrary ) {
	// Code that uses async and myLibrary
} );
```
---------------------------------------
<a name="reset" />
### reset()

Resets the ioc by removing all components, normally used in tests

__Returns__

The ioc

__Example__

```js
ioc
	.register( 'test', { val: 1 } )
	.reset()
	.inject( function( test ) {
		// Will cause an fatal error, since test is no longer registered in the ioc.
	} );
```
---------------------------------------
<a name="setStartedCallback" />
### setStartedCallback( fn )

Sets a function that will be injected after start is finished. If starts was called earlier, the function will be called directly.

__Arguments__

* fn - Function that will be injected after start

__Returns__

The ioc

__Example__

```js
ioc.setStartedCallback( function( test ) {
		console.log( test.toString() );
	} )
	.start();
```
---------------------------------------
<a name="setSettings" />
### setSettings( name, obj )

Sets settings that is registered and the ioc can access.

__Arguments__

* name - Identifying name of settings
* obj - The settings, an object.

__Returns__

The ioc

__Example__

```js
ioc.setSettings( 'settings', { environment: 'test' } )
	.start( function( settings ) {
		console.log( settings.environment ); // Should output 'test'
	} );
```
---------------------------------------
<a name="conditionalRegister" />
### conditionalRegister( settingsKey, conditionalValue, name, pathOrLoaded )

Reads settings, compares value to conditionalValue, if match perfoms a register

__Arguments__

* settingsKey - String to search for in settings, .-notated
* conditionalValue - value to compare against
* path - Path to send to autoRegister if match.

__Returns__

The ioc

__Example__

```js
ioc.setSettings( 'settings', { environment: 'test' } )
	.conditionalAutoRegister( 'evironment', 'test', './lib' ); // Sould autoRegister './lib'
```






		conditionalAutoRegister: conditionalAutoRegister,
		conditionalRegister: conditionalRegister,
		conditionalRegisterRequired: conditionalRegisterRequired,
		setWaitingWarningTime: setWaitingWarningTime









