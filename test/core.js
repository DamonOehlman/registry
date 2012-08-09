function PingPong() {
    if (!(this instanceof PingPong)) return new PingPong();
}

PingPong.prototype.ping = function() {
    return 'pong';
};

describe('core tests', function() {
    var registry = require('../dist/commonjs/registry'),
        expect = require('expect.js');

    function checkPonger(ponger) {
        expect(ponger).to.be.ok();
        expect(typeof ponger).to.equal('object');
        expect(ponger.ping()).to.equal('pong');
    }

    it('can find the registry global object', function() {
        expect(registry).to.be.ok();
    });
    
    it('can define a new module with a simple function constructor', function() {
        registry.define('test.core', function() {
            return 'test';
        });
    });
    
    it('can create a new instance from the test definition', function() {
        var instance = registry('test.core');

        expect(instance).to.be.ok();
        expect(typeof instance).to.equal('string');
        expect(instance).to.equal('test');
    });
    
    it('can get an instance immediatedly after defining', function() {
        var def = registry.define('test.another', function() {
                return 'Another test';
            }),
            value = def.create();
            
        expect(def).to.be.ok();
        expect(value).to.equal('Another test');
    });
    
    it('can define a module based on a prototype', function() {
        registry.define('pingpong.type1', PingPong);
    });
    
    it('can create a new pingpong object', function() {
        checkPonger(registry('pingpong.type1'));
    });
    
    it('can create a new pingpong object by looking for the generic implementation', function() {
        checkPonger(registry('pingpong'));
    });
    
    it('can create a new pingpong object using the general implementation (with wildcards)', function() {
        checkPonger(registry('pingpong.*'));
    });
});