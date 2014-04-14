require( '../ioc' )
	.setSettings( 'settings', {
		log: 3,
		val1: 1,
		o1: {
			val2: 2
		},
		o3: {
			val4: 4
		},
		s1: 'hejhopp1'
	}, {
		val1: 2,
		o1: {
			val2: 2
		},
		o2: {
			val3: 3
		},
		s1: 'hejhopp2'
	}, {
		val1: 5,
		o1: {
			val2: 2
		},
		a1: [ 1, 2, 3, 4 ],
		o2: {
			val3: 8
		},
		s1: 'hejhopp2'
	} )
	.register( 'assert', require( 'assert' ) )
	.start( function( settings, assert ) {
		assert.equal( settings.log, 3 );
		assert.equal( settings.val1, 5 );
		assert.equal( settings.o1.val2, 2 );
		assert.equal( settings.a1[ 2 ], 3 );
		assert.equal( settings.o2.val3, 8 );
		assert.equal( settings.s1, 'hejhopp2' );
		assert.equal( settings.o3.val4, 4 );
	} );
