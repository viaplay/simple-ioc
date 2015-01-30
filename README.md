# simple-ioc
Simple-ioc is a module for simple inversion of control for node.js. Main features are:

* Easy dependency injection without special syntax - in most cases modules can be used without simple-ioc.
* Easy exchangeability of components - settings can determine which components that should be used in different environments.
* Automatic asynchronous resolving - components are only resolved when all dependencies are resolved

## Installation
Simple-ioc is installed from npm.

```
npm install simple-ioc
```

## Basic usage and simple example

The following is a simple example of how to use simple-ioc

### Example of usage
```javascript
// ./lib/store.js
module.exports = function( databaseAdapter, callback ) {
	databaseAdapter.connect( function( err, connection ) {
		if( err ) {
        	console.log( err );
        	process.exit( 1 ); // Application cannot start!
        }
		else {
        	var pub = {};
			pub.getData = function( callback ) {
				connection.query( callback );
			};
            callback( pub );
		}
	} );
};
```

```javascript
// ./lib/module1.js
module.exports = function( pub, store ) {
	pub.printData = function() {
    	store.getData( function( err, data ) {
    	} );
    };
};
```

```javascript
// ./index.js
module.exports = require( 'simple-ioc' )
	.getContainer()
    .registerResolved( 'databaseAdapter', require( 'some-database-adapter' )
    .autoRegisterPath( './lib' )
    .inject( function( module1 ) {
    	module1.printdata();
    } );
```
<a name="reservedDependencies">
### Reseved dependencies
</a>
Simple-ioc has a number of reserved dependencies that cannot be registered in containers, these are:

* [`pub`](#public)
* [`parentName`](#parentName)
* [`callback`](#iocCallback)
* [`setup`](#moduleSetup)

Additionally every container has the following pre-registered components, which makes them virtually reserved as well:

* [`ioc`](#ioc)
* [`container`](#container)
* [`errRerouter`](#errRerouter)

<a name="public">
#### pub
</a>
A module can return its instance in two ways, either by creating the instance itself and returing it (or by using it as the argument asynchronously to the callback, see section [`callback`](#iocCallback) for more information) or by depending on `pub` and attaching properties to this object.

The use of `pub` is optional. It might be handy but it complicates using the module without the ioc, so use it only when you feel comfortable with simple-ioc. 

Example:
```javascript
module.exports = function() {
	var pub = {};
    pub.func = function() {};
	return pub;
};
```
is equivalent to:
```javascript
module.exports = function( pub ) {
	pub.func = function() {};
};
```

If using `pub` the module is more complex to resolve without the ioc. It can still be done by doing something like this:

```javacript
var resolved = {};
myModule( resolved );
```

<a name="parentName">
#### parentName
</a>
Normally all components registered in a container have a singleton lifestyle, but for some components this is not desired. To make a component transient simply let it depend on `parentName`. This way the component will be resolved everytime it is injected.

Example:

```javascript
var container = require( 'simple-ioc' )
	.getContainer()
    .registerInjectable( {
    	transientModule: function( parentName ) {
        	return function() {
            	console.log( parentName );
            };
        },
        singletonModule1: function( transientModule ) {
        	return transientModule;
        },
        singletonModule2: function( transientModule ) {
        	return transientModule;
        }
    } )
    .inject( function( singletonModule1, singletonModule2 ) {
    	singletonModule1(); // Will output "singletonModule1"
    	singletonModule2(); // Will output "singletonModule2"
    } );
```

<a name="iocCallback">
#### callback
</a>
Some components might need asynchronous calls before they can be used. By depending on `callback` the container waits for the callback to be invoked before it considers the component ready. If [`pub`](#pub) is not used the resolved instance should be used as the first argument to `callback`.

Example:
```javascript
var container = require( 'simple-ioc' )
	.getContainer()
    .registerInjectable( {
    	asyncModule: function( callback ) {
        	var pub = {};
			someAsyncSetup( function( err, something ) {
            	pub.func = function() {
                	something();
                };
                callback( pub );
            } );
		}
    } )
    .inject( function( asyncModule ) {
    	asyncModule.fun(); // asyncModule is ready to be used
    } );
```

<a name="moduleSetup">
#### setup
</a>
In future versions of simple-ioc it will be possible to automatically create test-stubs for component. For components that needs to be setup with external dependencies, it might be necessary to resolve components without a "real" setup, so simple-ioc can inspect the component. To prepeare for this it is possible to use `setup`. In normal use setup can be invoked with a function that will be called when the component is resolved.

Note that this this is not implemented yet, but might be a good idea to use.

Example:
```javascript
var container = require( 'simple-ioc' )
	.getContainer()
    .registerInjectable( {
    	module1: function( setup, callback ) {
        	var pub = {},
            	something;
            pub.func = function() {
                something();
            };
            setup( function() {
				someAsyncSetup( function( err, _something ) {
                	something = _something;
    	            callback( pub );
        	    } );
			} );
		}
    } );
```

## Documentation

[ioc](#ioc)

* [`getContainer()`](#getContainer)
* [`setSettings( settings1, settings2, settings3, ... )`](#setSettings)
* [`getSettings()`](#getSettings)
* [`useLogWriter( resolvedWriter )`](#useLogWriter)

[container](#container)

* [`registerResolved( name, instance )`](#registerResolved)
* [`registerInjectable( name, fn )`](#registerInjectable)
* [`mock( name, properties )`](#mock)
* [`registerGlobalWrappersFromSettings( settingsKey )`](#registerGlobalWrappersFromSettings)
* [`autoRegisterPath( relativePath, [omitFileIocComments], [omitFileLengthLogging] )`](#autoRegisterPath)
* [`resolve( name, callback )`](#resolve)
* [`registerIocSettings( name )`](#registerIocSettings)
* [`registerIocLog( name )`](#registerIocLog)
* [`resolveAllAndInject( fn )`](#resolveAllAndInject)
* [`injectAfterResolveAll( fn )`](#injectAfterResolveAll)
* [`inject( fn, [callback] )`](#inject)
* [`registerResolvedIfSetting( settingKey, name, instance )`](#registerResolvedIfSetting)
* [`registerInjectableIfSetting( settingKey, name, fn )`](#registerInjectableIfSetting)
* [`autoRegisterPathInSetting( settingKey )`](#)
* [`removeRegistered( name )`](#removeRegistered)

[log](#log)

* [`fatal( message, [ data ] )`](#logFatal)
* [`error( message, [ data ] )`](#logError)
* [`warning( message, [ data ] )`](#logWrning)
* [`info( message, [ data ] )`](#logInfo)
* [`debug( message, [ data ] )`](#logDebug)
* [`trace( message, [ data ] )`](#logTrace)
* [`getEntries( [componentName] )`](#getEntries)
* [`reset()`](#logReset)

[errRerouter](#errRerouter)

* [`( callback, fn )`](#errRerouter)

<a name="ioc">
## ioc
</a>

The main function of the ioc is to create containers, but it also has a built-in log and settings.

---

<a name="getContainer">
### getContainer()
</a>
Creates a new container.

#### Arguments
None.

#### Returns
A new container.

#### Remarks
The ioc, the container itself and errRerouter is registered automaticaly to the new container.

#### Example
```javascript
var container = require( 'simple-ioc' ).getContainer()
```

---
<a name="setSettings">
### setSettings( settings1, settings2, settings3, ... )
</a>
Sets the settings the ioc will read, initially the sttings will have a log-property, see section [log](#log) for more information about the built-in logger.

#### Arguments
Variable amount of objects with settings, the settings will be merged with the existing settings.

#### Returns
The ioc.

#### Remarks
The ioc has 4 built-in output-writers, these are

* consoleJson - More or less console.log( JSON.stringify( logObject ) )
* consoleReadable - Logs in a readable format, with some coloring of level
* devNull - writes nothing
* memoryJson - writes to memory, which is searchable afterwards. This should never be used in production, only in tests.

The default settings are:
```
{
	log: {
		level: 0,
		includeEnvironemtVariables: { env: 'NODE_ENV' },
		output: 'devNull'
	}
}
```

#### Example
```javascript
require( 'simple-ioc' ).setSettings(
	{
		log: {
			level: 3
		}
    },
	{
		log: {
			output: 'consoleReadable'
		}
	}
);
/*
will result in the following settings
{
	log: {
		level: 3,
		includeEnvironemtVariables: { env: 'NODE_ENV' },
		output: 'consoleReadable'
	}
}
*/
```

---
<a name="getSettings">
### getSettings()
</a>
Gets the settings the ioc uses. See [registerIocSettings](#registerIocSettings) how to register settings in a container for injection.

#### Arguments
None.

#### Returns
The registered settings

#### Remarks
Normally this function is not used, instead settings are injected, but might be useful for debugging.

#### Example
```javascript
require( 'simple-ioc' ).setSettings( {
	key: 'value'
} ).getSettings();
/* Will return
{
	log: {
		level: 0,
		includeEnvironemtVariables: { env: 'NODE_ENV' },
		output: 'devNull'
	},
    key: 'value'
}
*/
```

---

<a name="useLogWriter">
### useLogWriter( resolvedWriter )
</a>
The built-in logger (see [log](#log) for information) can also use a external output writer, it must implement the following functions:

* output( logObject ) - called on every log that is on a level that should be logged.
* getEntries( component ) - can be implemented, but should not be used in production.
* reset() - to reset the log entries.

#### Arguments
* `resolvedWriter` an object that implements at least output( logObject )

#### Returns
The ioc.

#### Remarks
None.

#### Example
```javascript
require( 'simple-ioc' ).useLogWriter( {
	output: function( logObject ) {
		console.log( logObject.level );
	}
} );
// Will only ouptut the level of the log (numeric) to the console.
```

***

## container

Containers are the central part of the ioc, it stores and resolves components.

Note: All functions on the container returns the container itself.

<a name="registerResolved">
### registerResolved( name, instance )
</a>
Registers a already resolved component to the container, e.g. external componens like "express".

#### Arguments
* name - the identifying name of the component
* instance - the resolved instance

OR

* name - An object with key/value pairs reprecenting names/instances

#### Returns
The container

#### Remarks
Packages that have a simple name (without special characters, such as "-") and are possible to require within the current scope, does not need to be registered. For example, a module can have a dependency to "http" without it being registered. If a dependency exists to a component that is not registered, the container will try to require the name of the dependency and register it as a singleton if successful.

#### Example
```javascript
var container = require( 'simple-ioc' ).getContainer()
	.registerResolved( async: require( 'async' ) ) // Registers async
	.registerResolved( { // Registers express and request
		express: require( 'express' ),
		request: require( 'request' )
	} )
    .inject( function( express, http, request, async ) {
    	// Will succeed since the container will register http automatically.
    } );
```

***

### registerInjectable( name, fn )
Registers an injectable component in the container, this method should normally be used when registering internal libraries which can use their own containers.

#### Arguments
* name - the identifying name of the component
* fn - the injectable function

OR

* name - An object with key/value pairs reprecenting names/instances

#### Returns
The container.

#### Remarks
Injectable functions has some reserved parameternames used by the ioc, these cannot be registered or used as normal dependencies. See [Reserved dependencies](#reservedDependencies) for more information.

#### Example
```javascript
var container = require( 'simple-ioc' ).getContainer()
	.registerInjectable( 'myComponent', function( pub, callback ) {
		pub.func1 = function( params ) {
			return whatEver;
		};
		doSomething( function() {
			callback();
		} )
	} ) // Registers a singleton component that has an async setup and a function func1 as myComponent
	.registerInjectable( {
		anotherComponent: function( setup, pub, callback ) {
			setup( function() {
				someSetup( function() {
					pub.xxx = function() {
						return amazingStuff;
					};
					callback();
				} );
			} );
			// Registers a singleton component that has a setup that also is async. The result is a
			// component registered as anotherComponent with a function xxx.
		},
		yetAnother: function( parentName ) {
			return {
				func3: function() {
					return parentName;
				}
			};
			// Registeres a transient component as yetAnother with a function func3. Everytime yetAnother
			// is injected the registered function will be called, creating a new enclosed scope.
		}
	} );
```

---
<a name="mock">
### mock( name, properties )
</a>
Simple-ioc has a built-in mocking function, making it easier to mock modules with sync and async functions. Mock is not supposed to be used in production code, but rather in tests.

#### Arguments

* `name` name of the component to mock
* `properties` the properties to mock with functions, setting the default value of the mocked function

or

* `name` an object with key/value pairs reprecenting names/properties

#### Returns
The container

#### Remarks
Mocking of modules by using "mock" might not be totaly straight forward and cannot be used in every mocking situation. See the example how a possible way to use it and how to achieve the same result without using mock. The values of mocked functions can be changed by setting the properties later.

Mock checks when a function is invoked, if last parameter is a function it will treat is as an async function.

#### Example

```javascript
require( 'simple-ioc' )
	.getContainer()
    .mock( {
    	module1: {
        	sync: 'syncVal',
            async: 'asyncVal'
        }
    } )
    .registerResolved( { // module2 is mocked without using mock
    	module2: {
        	sync: function() {
            	return 'syncVal';
            },
            async: function( param1, callback ) {
            	callback( undefined, 'asyncVal' ); 
            }
        }
    } )
    .inject( function( assert, module1, module2 ) {
		// Sync
		assert.equal( module1.sync(), 'syncVal' );
    	assert.equal( module2.sync(), 'syncVal' );
        // Async
    	module1.async( 'test', function( err, value ) {
        	assert.ok( !err );
			assert.equal( value, 'asyncVal' );
		} );
    	module2.async( 'test', function( err, value ) {
        	assert.ok( !err );
			assert.equal( value, 'asyncVal' );
		} );
        // Changing sync
        module1.sync = 'newSyncVal'; // Changing what sync will return when invoked
        module2.sync = function() { // ... same without mock
        	return 'newSyncVal';
        };
    	assert.equal( module1.sync(), 'newSyncVal' );
    	assert.equal( module2.sync(), 'newSyncVal' );
        // Changing async
        module1.async = 'newAsyncVal'; // Changing what async will callback when invoked
        module2.async = function( param1, callback ) { // ... same without mock
        	callback( undefined, 'newAsyncVal' ); 
		};
    	module1.async( 'test', function( err, value ) {
        	assert.ok( !err );
			assert.equal( value, 'newAsyncVal' );
		} );
    	module2.async( 'test', function( err, value ) {
        	assert.ok( !err );
			assert.equal( value, 'newAsyncVal' );
		} );
        // Change so async callbacks an error
		module1.async.err = 'myError'; // Change async so it callbacks with an error
        module2.async = function( param1, callback ) { // ... same without mock
        	callback( 'myError' ); 
		};
    	module1.async( 'test', function( err, value ) {
        	assert.equal( err, 'myError' );
		} );
    	module2.async( 'test', function( err, value ) {
        	assert.equal( err, 'myError' );
		} );
    } );
```

---

<a name="registerGlobalWrappersFromSettings">
### registerGlobalWrappersFromSettings( settingsKey )
</a>
Simple-ioc offers a method of wrapping methods in components of registered components. This can be useful if interception of calls are needed for tracking or debugging.

#### Arguments

* `settingsKey` the key in settings that specifies which components should be wrapped

#### Returns
The container.

#### Remarks
Wrappers can implement functions `async` and or `sync`, see example of usage. Wrapping is global and affects all containers in the ioc. 

#### Example
```javascript
require( 'simple-ioc' )
    .setSettings( {
        wrapping: {
            request: 'requestWrapper',
            module1: 'syncWrapper'
        }
    } )
    .registerResolved( {
        request: require( 'request' )
    } )
    .registerInjectable( {
        module1: function( pub ) {
            pub.func = function( param1, param2 ) {
                return param1 + param2;
            };
        },
        requestWrapper: function( assert, pub ) {
            pub.async = function( context, arguments, callback ) {
                assert.equal( context.async, true );
                var wrappedComponent = context.parentName; // e.g. request
                var wrappedFunction = context.wrappedFunction; // e.g. get
                var timeOfExecution = context.ts;
                var executionTime = context.executionTime;
                var result = context.result;
                var argumentsToFunction = arguments; // e.g. [ 'www.google.com' ]
                // Do something with this information, e.g. logging
                callback( function( err, result ) { // Will be invoked when on async callback
                    // Do some more logging... e.g. time = Date.now() - timeOfExecution;
                } );
            }
        },
        syncWrapper: function( assert, pub ) {
            pub.sync = function( context, arguments, result ) {
                assert.equal( context.sync, true );
                var wrappedComponent = context.parentName; // e.g. module1
                var wrappedFunction = context.wrappedFunction; // e.g. func
                var timeOfExecution = context.ts;
                var argumentsToFunction = arguments; // e.g. [ 1, 2 ]
                var resultOfInvokation = result; // e.g. 3
                // Do something with this information, e.g. logging
            };
        }
    } )
    .registerGlobalWrappersFromSettings( 'wrapping' )
    .inject( function( request, module1 ) {
        request.get( 'www.google.com', function( err, res, body ) {
            // wrapper has been called before request and when responce is received.
        } );
        var result = module1.func( 1, 2 ); // wrapper has been called
    } );
```
---

<a name="autoRegisterPath">
### autoRegisterPath( relativePath, [omitFileIocComments], [omitFileLengthLogging] )
</a>
Register all files in the given path, using function name or, if not existing, the file name as name of component.

#### Arguments
* `relativePath` relative path or absolut path that th container will recursively look in.
* `omitFileIocComments` (optinal) default false, if true, the container will not look for ioc specific comments.
* `omitFileLengthLogging` (optional) default false, if true, no warnings for long files.

#### Returns
The container.

#### Remarks
Files that contains the followin comments will be handeled different by autoRegisterPath:

* `/* ioc:ignore */` - file will be ignored.
* `/* ioc:noresolve */` - file will be registered as resolved

If omitFileLengthLogging is not set, the ioc will info log if files exceed 100 lines and warning log if files exceed 200 lines.

Normally the ioc uses the name of the file as name of the component, but if the function is not anonymous, the name of the function is used.

#### Example
```javascript
// ./lib/module1.js
module.exports = function( pub ) {
	pub.name = 'mod1';
};
```

```javascript
// ./lib/module2.js
module.exports = function( pub, module1 ) {
	pub.name = [ module1.name, 'mod2' ].join( '.' );
};
```

```javascript
// ./lib/module3ButWithAnotherName.js
module.exports = function module3( pub, module2 ) {
	pub.name = [ module2.name, 'mod3' ].join( '.' );
};
```

```javascript
// ./index.js
module.exports = require( 'simple-ioc' )
	.getContainer()
    .autoRegisterPath( './lib' )
    .inject( function( module3 ) {
    	console.log( module3.name ); // Will print out "mod1.mod2.mod3"
    } );
```
---
<a name="resolve">
### resolve( name, callback )
</a>

#### Arguments

* `name` name of the component to resolve
* `callback( err, instance )` function to be called with the result of the resolve.

#### Returns
The container.

#### Remarks
Resolve can safely be used anytime, since it callbacks an error if the component is unresolvable. 

#### Example
```javascript
var assert = require( 'assert' ); 
module.exports = require( 'simple-ioc' )
	.getContainer()
    .registerInjectable( {
    	test: function( pub ) {}
    } )
    .resolve( 'test', function( err, instance ) {
		assert.ok( !err );
        assert.ok( !!pub );
	} )
    .resolve( 'notRegistered', function( err, instance ) {
		assert.ok( err );
        assert.ok( !pub );
	} )
```

---
<a name="registerIocSettings">
### registerIocSettings( [ name ] )
</a>
Registers the ioc settings to the container with the specified name.

#### Arguments

* `name` the name settings should be registerd as, defaults to "settings"

#### Returns
The container.

#### Remarks
None.

#### Example
```javascript
var assert = require( 'assert' ); 
module.exports = require( 'simple-ioc' )
	.setSettings( {
    	key: 'value'
    } )
	.getContainer()
    .registerIocSettings()
    .inject( function( settings ) {
		assert.equal( settings.key, 'value' );
	} );
```

---

<a name="registerIocLog">
### registerIocLog( [ name ] )
</a>
Registers the build-in ioc logger to the container with the specified name.

#### Arguments

* `name` the name settings should be registerd as, defaults to "log"

#### Returns
The container.

#### Remarks
None.

#### Example
```javascript
var assert = require( 'assert' ); 
module.exports = require( 'simple-ioc' )
	.getContainer()
    .registerIocLog( 'log' )
    .inject( function( log ) {
		assert.ok( !!log.info );
	} );
```

---
<a name="resolveAllAndInject">
### resolveAllAndInject( fn )
</a>
Resolves all components that are unresolved and registered with singleton lifestyle. Finally the `fn` function is injected.

#### Arguments

* `fn` function to inject after all registered injectable singleton components are resolved.

#### Returns
The container.

#### Remarks
ResolveAllAndInject will log information about components that does not have any components that are depending on them.

#### Example
```javascript
var assert = require( 'assert' ); 
module.exports = require( 'simple-ioc' )
	.getContainer()
    .registerInjectable( {
    	module1: function( pub ) {
        	console.log( 'module1' );
            pub.value = 'val1';
        },
        module2: function( module1, callback ) {
        	console.log( 'module2' );
            callback( {
            	value: [ module1.value, 'val2' ].join( '.' );
            } );
        }
    } )
    .resolveAllAndInject( function() {
    	console.log( 'injected' );
    } );
    // Will have the following output:
    // module1
    // module2
    // injected
```

---
<a name="inject">
### inject( fn, [ callback ] )
</a>
Gives the possibility to inject anonymous functions

#### Arguments

* `fn` function to inject.
* `callback` optional, called after the functions is injected.

#### Returns
The container

#### Remarks
None.

#### Example
```javascript
var assert = require( 'assert' ); 
module.exports = require( 'simple-ioc' )
	.getContainer()
    .registerInjectable( {
    	module1: function( pub ) {
            pub.value = 'val1';
        },
        module2: function( pub ) {
        	pub.value = 'val2';
        }
    } )
    .inject( function( assert, module1, module2 ) {
    	assert.equal( module1.value, 'val1' );
    	assert.equal( module2.value, 'val2');
    } );
```

---
<a name="inject">
### injectAfterResolveAll( fn )
</a>
Specify a function that is injected after resolve all is complete, can be used in, for example, system tests.

#### Arguments

* `fn` function to inject

#### Returns
The container.

#### Remarks
None.

#### Example
```javascript
// ./index.js
var assert = require( 'assert' ); 
module.exports = require( 'simple-ioc' )
	.getContainer()
    .registerInjectable( {
    	module1: function( pub, callback ) {
            setTimeout( function() {
            	pub.value = 'val1';
            	callback();
            }, 500 );
        },
        module2: function( pub ) {
        	pub.value = 'val2';
        }
    } )
    .resolveAllAndInject( function( assert, module1, module2 ) {
		console.log( 'Application started' );
    } );
```
```javascript
// ./tests/system/test.js
var container = require( '../../../index.js' )
	.injectAfterResolveAll( function( module1 ) {
    	assert.equal( module1.value, 'val1' );
    } );
```

---

### registerResolvedIfSetting ( settingKey, name, instance )
Registers an resolved component if settings indicates it should be registered. Used for example when a component only should be used in certain environments.

#### Arguments
* settingKey - the dot notated key in settings (true/false)
* name - the identifying name of the component
* fn - the resolved component

#### Returns
The container.

#### Remarks
None.

#### Example
```javascript
var container = require( 'simple-ioc' ).getContainer()
	.setSettings( {
		use: {
			adapter: true
		}
	} )
	.registerResolvedIfSetting( 'use.adapter', 'componentName', require( 'someResolvedComponent' ) ); // Will register required component as resolved
```

***

### registerInjectableIfSetting( settingKey, name, fn )
Registers a injectable component if settings indicates it should be registered. Used for example when a component only should be used in certain environments.

#### Arguments
* settingKey - the dot notated key in settings (true/false)
* name - the identifying name of the component
* fn - the injectable function

#### Returns
The container.

#### Remarks
None.

#### Example
```javascript
var container = require( 'simple-ioc' ).getContainer()
	.setSettings( {
		use: {
			adapter: true
		}
	} )
	.registerInjectableIfSetting( 'use.adapter', 'componentName', require( 'someInjectableComponent' ) ); // Will register required component as injectable
```

***

### autoRegisterPathInSetting( settingKey )
Auto registers path that is specified in the settings, can be used for example when different adapers are used in development and production.

#### Arguments
* settingKey - the dot notated key in settings that referes to the path

#### Returns
The container.

#### Remarks
None.

#### Example
```javascript
var container = require( 'simple-ioc' ).getContainer()
	.setSettings( {
		use: {
			adapter: '/myPath/adaper1'
		}
	} )
	.autoRegisterPathInSetting( 'use.adapter' ); // Will auto register all files in the path '/myPath/adaper1'
```

***

### removeRegistered( name )
Removes an injectable unresolved component from the container, main purpose is to change behaviour in system-tests after an application is started with 'resolveAllAndInject'.

#### Arguments
* name - the identifying name of the component to remove from the container

#### Returns
The container.

#### Remarks
Only injectable components that has not yet been resolved can be removed.

#### Example
```javascript
// ./index.js
var assert = require( 'assert' ); 
module.exports = require( 'simple-ioc' )
    .getContainer()
    .registerInjectable( {
        module1: function( pub, callback ) {
            setTimeout( function() {
                pub.value = 'val1';
                callback();
            }, 500 );
        },
        module2: function( pub, module1 ) {
            pub.value = module1.value;
        }
    } )
    .resolveAllAndInject( function() {
        console.log( 'Application started' );
    } );
```
```javascript
// ./tests/system/test.js
var container = require( '../../../index.js' )
    .removeRegistered( 'module1' )
    .registerResolved( {
        module1: { value: 'newVal1' }
    } )
    .injectAfterResolveAll( function( assert, module2 ) {
        assert.equal( module2.value, 'newVal1' );
    } );
```

### transfer( name )
EXPERIMENTAL! Used to transfer components from one application that has started with resolveAllAndInject

#### Arguments
* name - the identifying name of the component to transfer

#### Returns
An injectable functions with that callbacks the component

#### Remarks
None.

#### Example
```javascript
// ./index.js
var assert = require( 'assert' ); 
module.exports = require( 'simple-ioc' )
    .getContainer()
    .registerInjectable( {
        moduleFromOtherApplication: require( 'otherApplication' ).transfer( 'moduleFromOtherApplication' )
    } )
    .resolveAllAndInject( function( moduleFromOtherApplication ) {
        console.log( 'Application started' );
    } );
```

---

<a name="log">
## log
</a>
The ioc has a built in logger that can be used externaly as well. The logger builds a logObject that looks like this:

```javascript
{
	level: level,
	message: message,
	data: data,
	component: parentName,
	...environment variables specified in the settings
}
```

In the log-settings you can specify envronment values that you would like to include in the log-objects
```javascript
includeEnvironemtVariables: { enviro: 'ENV_NAME' }
// Would include ENV_NAME as "enviro"
```

---
<a name="logFatal">
### fatal( message, [ data ] )
</a>

#### Arguments

* `message` log message
* `data` optional dataobject that will be in the output

#### Returns
Undefined.

#### Remarks
After the log is written system.exit() is automatically called.

#### Example

```javascript
log.fatal( 'Fatal error occured, not recoverable', err ); // Application will exit
```
---

<a name="logError">
### error( message, [ data ] )
</a>

#### Arguments

* `message` log message
* `data` optional dataobject that will be in the output

#### Returns
Undefined.

#### Remarks
None.

#### Example

```javascript
log.error( 'Error occured, request probably fails', err );
```
---

<a name="logWarning">
### warning( message, [ data ] )
</a>

#### Arguments

* `message` log message
* `data` optional dataobject that will be in the output

#### Returns
Undefined.

#### Remarks
None.

#### Example

```javascript
log.warning( 'Unexpected behaviour, recoverable, request will probably not fail', err );
```
---

<a name="logInfo">
### info( message, [ data ] )
</a>

#### Arguments

* `message` log message
* `data` optional dataobject that will be in the output

#### Returns
Undefined.

#### Remarks
None.

#### Example

```javascript
log.info( 'Setup was successful' );
```
---

<a name="logDebug">
### debug( message, [ data ] )
</a>

#### Arguments

* `message` log message
* `data` optional dataobject that will be in the output

#### Returns
Undefined.

#### Remarks
None.

#### Example

```javascript
log.debug( 'Incomming request', req );
```
---

<a name="logTrace">
### trace( message, [ data ] )
</a>

#### Arguments

* `message` log message
* `data` optional dataobject that will be in the output

#### Returns
Undefined.

#### Remarks
None.

#### Example

```javascript
log.trace( 'Session resolved', session );
```
---

<a name="getEntries">
### getEntries( [ componentName ] )
</a>
If the memoryJson writer is used it is possible to iterate through the logs that have been written. This might be useful in tests.

#### Arguments

* `componentName` optional, name of component to get logs from

#### Returns
Undefined.

#### Remarks
None.

#### Example

```javascript
log.info( 'Incomming request' );
assert.equal( log.getEntries()[ 0 ].message, 'Incomming request' );
```
---

<a name="logReset">
### reset()
</a>
If the memoryJson writer is used it is possible to reset the log-store.

#### Arguments
None.

#### Returns
Undefined.

#### Remarks
None.

#### Example

```javascript
log.info( 'Incomming request' );
log.reset();
assert.equal( log.getEntries()[ 0 ].length, 0 );
```
---

<a name="errRerouter">
## errRerouter( callback, successFn )
</a>
Simple ioc offers a small helper function to route errors to calling component, this component is optional to use, but might be handy in some situations.

#### Arguments
* `callback` the callback to send error to
* `successFn` function to call if first argument evaluates as false.

#### Returns
The rerouter

#### remarks
None.

#### Example
```javascript
module.exports = function( pub, errRerouter, someErrorThrowingAsyncComponent ) {
    pub.get = function( callback ) {
        someErrorThrowingAsyncComponent.get( errRerouter( callback, function( data ) {
            callback( undefined, data.someData ); // Just implement "happy-flow"
        } ) );
    };
};
```

Is equivalent to

```javascript
module.exports = function( pub, someErrorThrowingAsyncComponent ) {
    pub.get = function( callback ) {
        someErrorThrowingAsyncComponent.get( function( err, data ) {
            if( err )
                callback( err ); // Check for error needed
            else
                callback( undefined, data.someData );
        } );
    };
};
```
