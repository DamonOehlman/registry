var registry = require('../');

registry.module('welcomer.polite', function() {
	return {
		sayHello: function() {
			console.log('hi, how are you?');
		}
	};
});

registry.module('welcomer.rude', function() {
	return {
		sayHello: function() {
			console.log('um, what do you want?!');
		}
	};
});

registry('welcomer').sayHello();