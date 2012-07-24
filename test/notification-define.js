describe('notification (define) tests', function() {
    var registry = require('../dist/commonjs/registry'),
        expect = require('expect.js');

    function dummyFn() {
    }
    
    it('can register a define listener', function() {
        registry.bind('define:test', dummyFn);
    });
    
    it('can unbind a define listener', function() {
        registry.unbind('define:test', dummyFn);
    });
    
    it('can receive an update when a new definition is created', function(done) {
        
        function handleDefine(def) {
            // ensure that the extends call has been appled before
            // the event has been triggered
            expect(def._prototype).to.be.ok();
            expect(def._prototype.hasValidPrototype).to.be.ok();
           
            registry.unbind('define:test', handleDefine);
            done();
        }
        
        registry.bind('define:test.definition', handleDefine);
        
        registry.define('test.definition', function() {
            return {
                test: true
            };
        })
        .extend({
            hasValidPrototype: true
        });
    });
});