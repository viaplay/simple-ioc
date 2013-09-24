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
---------------------------------------
<a name="setLogLevel" />
### setLogLevel( level )

Sets the minimum level of logs to cause an output, this only affects the ioc's logging.

NOTE: All FATAL errors also exists the application.

__Arguments__

* level - minimum level

NOTE: Possible values:
- `0`: FATAL
- `1`: ERROR
- `2`: WARNING
- `3`: INFO
- `4`: DEBUG
- `5`: TRACE

__Returns__

The ioc

__Example__

```js
ioc.setLogLevel( 1 ); // Will cause the ioc to only outputs FATAL and ERROR logs.
```
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
<a name="conditionalAutoRegister" />
### conditionalAutoRegister( settingsKey, conditionalValue, path )

Reads settings, compares value to conditionalValue, if match perfoms a autoRegister

__Arguments__

* settingsKey - String to search for in settings, .-notated
* conditionalValue - value to compare against
* path - Path to folder or file.

__Returns__

The ioc

__Example__

```js
ioc.setSettings( 'settings', { environment: 'test' } )
	.conditionalAutoRegister( 'evironment', 'test', './lib' ); // Sould autoRegister './lib'
```
---------------------------------------
<a name="conditionalRegister" />
### conditionalRegister( settingsKey, conditionalValue, name, pathOrLoaded, lifecycleTransient )

Reads settings, compares value to conditionalValue, if match perfoms a register

__Arguments__

* settingsKey - String to search for in settings, .-notated
* conditionalValue - value to compare against
* name - The name to identify the component when injecting
* pathOrLoaded - Can either be a filepath, which will be required by the ioc and injected, all other types (objects, functions etc) will just be loaded into the ioc.
* lifecycleTransient - Boolean, if set, the comopnent will be re-injected, when ever used as a dependency.

__Returns__

The ioc

__Example__

```js
ioc.setSettings( 'settings', { environment: 'test' } )
	.conditionalAutoRegister( 'evironment', 'test', 'some_component', require( 'some_component' ) ); // Sould register 'some_component'
```
---------------------------------------
<a name="conditionalRegisterRequired" />
### conditionalRegister( settingsKey, conditionalValue, name, required, lifecycleTransient )

Reads settings, compares value to conditionalValue, if match perfoms a registerRequired

__Arguments__

* settingsKey - String to search for in settings, .-notated
* conditionalValue - value to compare against
* name - The name to identify the component when injecting
* required - function that can be injected
* lifecycleTransient - Boolean, if set, the comopnent will be re-injected, when ever used as a dependency.

__Returns__

The ioc

__Example__

```js
ioc.setSettings( 'settings', { environment: 'test' } )
	.conditionalRegisterRequired( 'evironment', 'test', 'some_component', function( settings ) { return 'test'; } ); // Sould register 'some_component'
```
---------------------------------------
<a name="setWaitingWarningTime" />
### setWaitingWarningTime( milliseconds )

Sets the amount of milliseconds the ioc waits for a component with a readyCallback to callback before it starts to warn

__Arguments__

* milliseconds - amount of milliseconds

__Returns__

The ioc

__Example__

```js
ioc.setWaitingWarningTime( 1000 ); // Will start to log warnings if components take more than 1 seconds to callback
```

## Release notes

### 2.0.5
