var expect = require('chai').expect;

function PingPong() {
    
}

PingPong.prototype.ping = function() {
    return 'pong';
};

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
        var test = IoC.get('test');
        expect(test).to.exist;
        expect(typeof test).to.equal('string');
        expect(test).to.equal('test');
    });
    
    it('can define a module based on a prototype', function() {
        IoC.define('pingpong', PingPong.prototype);
    });
    
    it('can create a new pingpong object', function() {
        var ponger = IoC.get('pingpong');
        expect(ponger).to.exist;
        expect(typeof ponger).to.equal('object');
        expect(ponger.ping()).to.equal('pong');
    });
    
    it('can define and create a module', function() {
        var test = IoC.define('test2', function() { 
            return 'test2';
        }).create();
        
        expect(test).to.equal('test2');
    });
});