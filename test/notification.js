var registry = require('../registry.node'),
    expect = require('expect.js');

describe('notification (accept) tests', function() {
    before(function() {
        registry.define('test.evented', function() {
            return {
                message: 'hello'
            };
        });
    });
    
    it('can receive an update when a new instance is created', function(done) {
        registry.on.create('test', function(def) {
            // check that we have an instance to the newly created object
            expect(this).to.be.ok();
            expect(this.message).to.equal('hello');
            
            // check that we have the definition of the object 
            expect(def).to.be.ok();
            expect(def.namespace).to.equal('test.evented');
            
            done();
        });
        
        registry('test.evented').create();
    });
});