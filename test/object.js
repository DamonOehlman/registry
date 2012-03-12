var IoC = require('IoC'),
    expect = require('chai').expect;

describe('existing object tests', function() {
    it('can define a singleton', function() {
        IoC.define('config', {
            test: true
        });
    });
    
    it('singletons only create the one instance', function() {
        var config1 = IoC.getInstance('config'),
            config2 = IoC.getInstance('config');
            
        expect(config1 === config2).to.be.truthy;
        expect(config1.test).to.be.ok;
    });
});