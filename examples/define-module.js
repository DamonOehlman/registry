var registry = require('../');

registry.module('welcomer', function() {
	return {
		sayHello: function() {
			console.log('hi');
		}
	};
});

registry('welcomer').sayHello();