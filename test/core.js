var expect = require('chai').expect;

function PingPong() {
    
}

PingPong.prototype.ping = function() {
    return 'pong';
};

function checkPonger(ponger) {
    expect(ponger).to.exist;
    expect(typeof ponger).to.equal('object');
    expect(ponger.ping()).to.equal('pong');
}

describe('core tests', function() {
    it('can find the IoC global object', function() {
        expect(IoC).to.exist;
    });
    
    it('can define a new module with a simple function constructor', function() {
        IoC.define('test', function() {
            return 'test';
        });
    });
    
    it('can create a new test module', function() {
        var test = IoC.getInstance('test');
        expect(test).to.exist;
        expect(typeof test).to.equal('string');
        expect(test).to.equal('test');
    });
    
    it('can define a module based on a prototype', function() {
        IoC.define('pingpong.type1', PingPong.prototype);
    });
    
    it('can create a new pingpong object', function() {
        checkPonger(IoC.getInstance('pingpong.type1'));
    });
    
    it('can create a new pingpong object by looking for the generic implementation', function() {
        checkPonger(IoC.getInstance('pingpong'));
    });
    
    it('can create a new pingpong object using the general implementation (with wildcards)', function() {
        checkPonger(IoC.getInstance('pingpong.*'));
    });
    
    it('can define and create a module', function() {
        var test = IoC.define('test2', function() { 
            return 'test2';
        }).create();
        
        expect(test).to.equal('test2');
    });
});