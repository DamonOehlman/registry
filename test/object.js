describe('existing object tests', function() {
    var registry = require('../dist/commonjs/registry'),
        expect = require('expect.js');

    it('can define an instance', function() {
        registry.define('config', {
            test: true
        });
    });
    
    it('if an existing instance was defined, then that instance is returned on a second registry call', function() {
        var config1 = registry('config'),
            config2 = registry('config');
            
        expect(config1 === config2).to.be.ok();
        expect(config1.test).to.be.ok();
    });
});