describe('singleton tests', function() {
    var registry = require('../dist/commonjs/registry'),
        expect = require('expect.js');

    it('can define a singleton', function() {
        registry.define('test.singleton.oneonly', function() {
            return {
                name: 'Ted'
            };
        }).singleton();
    });
    
    it('singletons only create the one instance', function() {
        var instance1 = registry.create('test.singleton.oneonly'),
            instance2 = registry.create('test.singleton.oneonly');
            
        expect(instance1 === instance2).to.be.ok();
        expect(instance1.name).to.equal('Ted');
    });
    
    it('can get the instances for singletons', function() {
        var instances = registry.matching('test').instances();
        
        expect(instances.length).to.be.above(0);
    });
    
    it('can get the first instance for singletons', function() {
        var instance = registry('test.singleton');
        
        expect(instance).to.be.ok();
        expect(instance.name).to.equal('Ted');
    });
    
    it('defines modules as singletons', function() {
        var def = registry.module('test.module', function() {
            return {
                name: 'Test Module'
            };
        });
        
        expect(def).to.be.ok();
        expect(def.singleton).to.be.ok();
    });
});