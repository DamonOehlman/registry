var IoC = require('IoC'),
    expect = require('chai').expect;

describe('singleton tests', function() {
    it('can define a singleton', function() {
        IoC.define('test.oneonly', { singleton: true }, function() {
            return {
                name: 'Ted'
            };
        });
    });
    
    it('singletons only create the one instance', function() {
        var instance1 = IoC.getInstance('test.oneonly'),
            instance2 = IoC.getInstance('test.oneonly');
            
        expect(instance1 === instance2).to.be.truthy;
        expect(instance1.name).to.equal('Ted');
    });
    
    it('can define a singleton using syntactic sugar', function() {
        IoC.singleton('test2.oneonly', function() {
            return {
                name: 'Fred'
            };
        });
    });
    
    it('has two matching instances for the second defined singleton', function() {
        var instance1 = IoC.getInstance('test2.oneonly'),
            instance2 = IoC.getInstance('test2.oneonly');
            
        expect(instance1 === instance2).to.be.truthy;
        expect(instance1.name).to.equal('Fred');
    });
});