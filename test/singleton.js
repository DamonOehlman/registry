var registry = require('../registry.node'),
    expect = require('expect.js');

describe('singleton tests', function() {
    it('can define a singleton', function() {
        registry.singleton('test.oneonly', function() {
            return {
                name: 'Ted'
            };
        });
    });
    
    it('singletons only create the one instance', function() {
        var instance1 = registry('test.oneonly').create(),
            instance2 = registry('test.oneonly').create();
            
        expect(instance1 === instance2).to.be.ok();
        expect(instance1.name).to.equal('Ted');
    });
});