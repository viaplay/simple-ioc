var assert = require( 'assert' );
describe( 'lib/genericHelpers/settingsHelper', function() {
	var settingsHelper;
	before( function( callback ) {
		settingsHelper = require( '../../../../lib/genericHelpers/settingsHelper.js' )();
		callback();
	} );
	describe( 'getSetting( settings, key )', function() {
		var settings = {
			branch1: {
				branch3: {
					key1: 'value1'
				},
				branch4: {
					key2: 'value2',
					key3: 'value3'
				}
			},
			branch2: {
				key4: 'value4'
			}
		};
		it( 'Should return correct object', function() {
			assert.deepEqual( settingsHelper.getSetting( settings, 'branch1' ), settings.branch1 );
			assert.deepEqual( settingsHelper.getSetting( settings, 'branch1.branch4' ), settings.branch1.branch4 );
			assert.deepEqual( settingsHelper.getSetting( settings, 'branch2.branch1.key4' ), settings.branch1.key4 );
		} );
		it( 'Should return undefined is key does no exist', function() {
			assert.deepEqual( settingsHelper.getSetting( settings, 'branch3' ), undefined );
			assert.deepEqual( settingsHelper.getSetting( settings, 'branch1.branch5' ), undefined );
		} );
	} );
	describe( 'mergeSettings( originalSettings, newSettings )', function() {
		it( 'Should merge settings', function() {
			var originalSettings = {
				branch1: {
					branch2: {
						branch3: {
							key3: 'value3',
							key4: 'value4'
						},
						key2: 'value2'
					},
					key1: 'value1'
				},
				branch2: {
					key5: 'value5'
				}
			};
			var newSettings = {
				branch1: {
					branch2: {
						branch3: {
							key3: 'newValue3',
							key6: 'value6'
						},
						key2: undefined
					}
				},
				branch2: undefined
			};
			settingsHelper.mergeSettings( originalSettings, newSettings );
			assert.deepEqual( originalSettings, {
				branch1: {
					branch2: {
						branch3: {
							key3: 'newValue3',
							key4: 'value4',
							key6: 'value6'
						},
						key2: undefined
					},
					key1: 'value1'
				},
				branch2: undefined
			} );
		} );
	} );
} );
