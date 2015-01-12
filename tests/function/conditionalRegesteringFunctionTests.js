var assert = require( 'assert' );
describe( 'lib/ioc', function() {
	var container;
	before( function() {
		var settings = {
			key: {
				conditional: true
			},
			pathKey: {
				value: './containerTestData/test2/folder1'
			}
		};
		container = ioc = require( '../../lib/ioc.js' )().setSettings( settings ).getContainer();
	} );
	describe( 'container.registerResolvedIfSetting( settingKey, name, instance )', function() {
		it( 'Should register component if setting exist', function( callback ) {
			container
			.registerResolvedIfSetting( 'key.conditional', 'component1', { key: 'value1' } )
			.resolve( 'component1', function( err, instance ) {
				assert.ok( !err );
				assert.equal( instance.key, 'value1' );
				callback();
			} );
		} );
		it( 'Should not register component if setting does not exist', function( callback ) {
			container
			.registerResolvedIfSetting( 'key.conditionalX', 'component2', { key: 'value2' } )
			.resolve( 'component2', function( err, instance ) {
				assert.ok( !instance );
				assert.ok( !!err );
				callback();
			} );
		} );
	} );
	describe( 'container.registerInjectableIfSetting( settingKey, name, fn )', function() {
		it( 'Should register component if setting exist', function( callback ) {
			container
			.registerInjectableIfSetting( 'key.conditional', 'component3', function( pub ) { pub.key = 'value1'; } )
			.resolve( 'component3', function( err, instance ) {
				assert.ok( !err );
				assert.equal( instance.key, 'value1' );
				callback();
			} );
		} );
		it( 'Should not register component if setting does not exist', function( callback ) {
			container
			.registerInjectableIfSetting( 'key.conditionalX', 'component4', function( pub ) { pub.key = 'value1'; } )
			.resolve( 'component4', function( err, instance ) {
				assert.ok( !instance );
				assert.ok( !!err );
				callback();
			} );
		} );
	} );
	describe( 'container.autoRegisterPathInSetting( settingKey )', function() {
		it( 'Should register component if setting exist', function( callback ) {
			container
			.autoRegisterPathInSetting( 'pathKey.value' )
			.resolve( 'module1', function( err, instance ) {
				assert.ok( !err );
				assert.equal( instance.testKey, 'testValue' );
				callback();
			} );
		} );
	} );
} );
