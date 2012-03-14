var registry = require('../registry.common'),
    expect = require('expect.js');

describe('existing object tests', function() {
    it('can define an instance', function() {
        registry.define('config', {
            test: true
        });
    });
    
    it('if an existing instance was defined, then calling create does nothing', function() {
        var config1 = registry('config').create(),
            config2 = registry('config').create();
            
        expect(config1 === config2).to.be.ok();
        expect(config1.test).to.be.ok();
    });
});