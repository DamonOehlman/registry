var registry = require('../registry.common'),
    expect = require('expect.js');

describe('notification (define) tests', function() {
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
            registry.unbind('define:test', handleDefine);
            done();
        }
        
        registry.bind('define:test', handleDefine);
        
        registry.define('test.definition', function() {
            return {
                test: true
            };
        });
    });
});