// registry 0.0.0
// ────────────────────────────────────────────────────────────────────────────────────────
// Experimental namespaced IoC container
// ────────────────────────────────────────────────────────────────────────────────────────

(function(glob) {
    var definitions = {},
        _listeners = {};
        
    function RegistryDefinition(namespace, attributes, constructor) {
        // remap args if required
        if (typeof attributes == 'function') {
            constructor = attributes;
            attributes = {};
        }
        
        // initialise members
        this.namespace = namespace;
        this.attributes = attributes || {};
        this.constructor = constructor;
        
        // mark this as not being a singleton instance (until told otherwise)
        this.singleton = false;
    }
    
    RegistryDefinition.prototype = {
        create: function() {
            var newObject;
            
            if (this.constructor || this.instance) {
                // create the new object or re-use the instance if it's there
                newObject = this.instance || this.constructor.apply(null, arguments);
                
                // trigger the create
                _trigger.call(newObject, 'create', this);
    
                // if the definition is a singleton and the instance is not yet assigned, then do that now
                if (this.singleton && (! this.instance)) {
                    this.instance = newObject;
                }
            } 
    
            return newObject;
        }
    };

    function RegistryResults() {
        
    }
    
    RegistryResults.prototype = new Array();
    RegistryResults.prototype.create = function() {
        return this[0] ? this[0].create.apply(this[0], arguments) : undefined;
    };
    
    if (! RegistryResults.prototype.filter) {
        RegistryResults.prototype.filter = function(callback) {
            var results = new RegistryResult();
            
            for (var ii = 0, count = this.length; ii < count; ii++) {
                if (callback(this[ii])) {
                    results.push(this[ii]);
                }
            }
            
            return results;
        };
    }

    
    function registry(namespace, test) {
        var matcher = wildcard(namespace),
            results = new RegistryResults();
        
        for (var key in definitions) {
            if (matcher.match(key)) {
                results.push(definitions[key]);
            }
        }
        
        // if we have been passed a matchme test string, then filter the results
        if (typeof test != 'undefined') {
            results = results.filter(function(item) {
                return matchme(item.attributes, test);
            });
        }
        
        return results;
    }
    
    function _define(namespace, attributes, constructor) {
        if (definitions[namespace]) {
            throw new Error('Unable to define "' + namespace + '", it already exists');
        }
        
        // create the definition and return the instance
        return definitions[namespace] = new RegistryDefinition(namespace, attributes, constructor);
    }
    
    function _listenFor(eventType) {
        if (! _listeners[eventType]) {
            _listeners[eventType] = [];
        }
        
        return function(pattern, handler) {
            _listeners[eventType].push({ matcher: wildcard(pattern), handler: handler });
        };
    }
    
    function _singleton() {
        // pass through the function arguments to the define call
        var definition = _define.apply(null, arguments);
        
        // mark the definition as a singleton instance
        definition.singleton = true;
        
        // return the definition
        return definition;
    }
    
    function _trigger(eventType, def) {
        var listeners = _listeners[eventType] || [];
        
        for (var ii = 0, count = listeners.length; ii < count; ii++) {
            if (listeners[ii].matcher.match(def.namespace)) {
                listeners[ii].handler.call(this, def);
            }
        }
    }
    
    function _undef(namespace) {
        delete _defitions[namespace];
    }
    
    registry.on = {
        create: _listenFor('create')
    };
    
    registry.define = _define;
    registry.find = registry;
    registry.singleton = _singleton;
    registry.undef = _undef;
    
    (typeof module != "undefined" && module.exports) ? (module.exports = registry) : (typeof define != "undefined" ? (define("registry", [], function() { return registry; })) : (glob.registry = registry));
})(this);