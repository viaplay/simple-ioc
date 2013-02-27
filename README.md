simple-ioc
==========

Simple Dependency Injection for node.js



# simple-ioc

Simple dependency injection

Features:

* TODO

## Getting Started

```
npm install simple-ioc
```

```javascript
var ioc = require( 'simple-ioc' );
```

Simple example

```
require( 'simple-ioc' )
	.setLogLevel( 3 )
	.register( 'settings', require( './configuration/settings' ) )
	.register( 'amqp', require( 'amqp' ) )
	.autoRegister( './lib/' )
	.register( 'app', './handlers/itemQueryHandler.js' )
	.start( function() { console.log( 'Application started' ); } );
```

## Release notes

### 1.0.0

* TODO

