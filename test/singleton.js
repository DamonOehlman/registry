var registry = require('../registry.node'),
    expect = require('expect.js');

describe('singleton tests', function() {
    it('can define a singleton', function() {
        registry.define('test.oneonly', function() {
            return {
                name: 'Ted'
            };
        }).singleton();
    });
    
    it('singletons only create the one instance', function() {
        var instance1 = registry('test.oneonly').create(),
            instance2 = registry('test.oneonly').create();
            
        expect(instance1 === instance2).to.be.ok();
        expect(instance1.name).to.equal('Ted');
    });
    
    it('can define a singleton by calling the singleton method on a definition', function() {
        registry.singleton('test.another.oneonly', function() {
            return {
                name: 'Bob'
            };
        });
    });
    
    it('can get the instances for singletons', function() {
        var instances = registry('test').instances();
        
        expect(instances.length).to.be.above(0);
    });
    
    it('can get the first instance for singletons', function() {
        var instance = registry('test').current();
        
        expect(instance).to.be.ok();
        expect(instance.name).to.equal('Ted');
    });
});