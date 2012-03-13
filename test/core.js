var registry = require('../registry.node'),
    expect = require('expect.js');

function PingPong() {
    if (!(this instanceof PingPong)) return new PingPong();
}

PingPong.prototype.ping = function() {
    return 'pong';
};

describe('core tests', function() {
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
        var instance = registry('test.core').create();
        
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
        checkPonger(registry('pingpong.type1').create());
    });
    
    it('can create a new pingpong object by looking for the generic implementation', function() {
        checkPonger(registry('pingpong').create());
    });
    
    it('can create a new pingpong object using the general implementation (with wildcards)', function() {
        checkPonger(registry('pingpong.*').create());
    });
    
    /*
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
    */
});