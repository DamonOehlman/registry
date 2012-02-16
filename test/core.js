var IoC = require('IoC'),
    expect = require('chai').expect;

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
    
    it('can get an instance immediatedly after defining', function() {
        var def = IoC.define('test.another', function() {
                return 'Another test';
            }),
            value = def.getInstance();
            
        expect(def).to.exist;
        expect(value).to.equal('Another test');
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
    
    it('can get the existing types defined', function(done) {
        IoC.accept('pingpong', { definition: true }, function(object) {
            expect(object).to.exist;
            expect(object.creator).to.exist;
            
            done();
        });
    });
    
    it('can get the existing instances defined', function(done) {
        var expected = 3;
        
        IoC.accept('pingpong', function(object) {
            expect(object).to.exist;
            expect(typeof object.ping).to.equal('function');
            
            expected -= 1;
            if (expected <= 0) {
                done();
            }
        });
    });
    
    it('can get all the instances for a particular type', function() {
        var instances = IoC.instances('test');
        expect(instances).to.exist;
        expect(instances.length).to.equal(2);
    });
    
    it('doesn\'t find instances of a partial match', function() {
        var instances = IoC.instances('ping');
        expect(instances).to.exist;
        expect(instances.length).to.equal(0);
    });
});