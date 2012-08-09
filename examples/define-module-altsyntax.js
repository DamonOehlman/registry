var registry = require('../');

registry.define('welcomer', (function() {
	return {
		sayHello: function() {
			console.log('hi');
		}
	};
})());

registry('welcomer').sayHello();