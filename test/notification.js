describe('notification (create) tests', function() {
    var registry = require('../dist/commonjs/registry'),
        expect = require('expect.js');

    before(function() {
        registry.define('test.evented', function() {
            return {
                message: 'hello'
            };
        });
    });
    
    function dummyFn() {
    }
    
    it('can register a create listeners', function() {
        registry.bind('create:test', dummyFn);
    });
    
    it('can unbind a listener', function() {
        registry.unbind('create:test', dummyFn);
    });
    
    it('can receive an update when a new instance is created', function(done) {
        
        function handleCreate(def) {
            // check that we have an instance to the newly created object
            expect(this).to.be.ok();
            expect(this.message).to.equal('hello');
            
            // check that we have the definition of the object
            expect(def).to.be.ok();
            expect(def.namespace).to.equal('test.evented');
            
            registry.unbind('create:test', handleCreate);
            done();
        }
        
        registry.bind('create:test', handleCreate);
        
        registry('test.evented');
    });
});