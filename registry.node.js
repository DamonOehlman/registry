var wildcard = require('wildcard'),
    matchme = require('matchme');
    
// registry 0.1.0
// ────────────────────────────────────────────────────────────────────────────────────────
// Experimental namespaced IoC container
// ────────────────────────────────────────────────────────────────────────────────────────

(function(glob) {
    var definitions = {};
        
    var _listeners = {},
        reEventType = /^(\w+)\:(.*)$/;
        
    function _parseEventPattern(pattern) {
        // extract the event type from the pattern
        var match = reEventType.exec(pattern),
            details = {
                type: 'default',
                pattern: pattern
            };
        
        // if we have a match, then appropriately map the pattern 
        if (match) {
            details.type = match[1];
            details.pattern = match[2];
        }
        
        return details;
    }
    
    function _bind(pattern, handler) {
        var evt = _parseEventPattern(pattern);
        
        // create the array if required
        if (! _listeners[evt.type]) {
            _listeners[evt.type] = [];
        }
        
        _listeners[evt.type].push({ matcher: wildcard(evt.pattern), handler: handler });
    }
    
    function _trigger(eventType, def) {
        var listeners = _listeners[eventType] || [];
        
        for (var ii = 0, count = listeners.length; ii < count; ii++) {
            if (listeners[ii].matcher.match(def.namespace)) {
                listeners[ii].handler.call(this, def);
            }
        }
    }
    
    function _unbind(pattern, handler) {
        var evt = _parseEventPattern(pattern),
            listeners = _listeners[evt.type] || [];
            
        // iterate through the listeners and splice out the matching handler
        for (var ii = listeners.length; ii--; ) {
            var matcher = listeners[ii].matcher;
            
            if (matcher && matcher.match(evt.pattern) && listeners[ii].handler === handler) {
                listeners.splice(ii, 1);
            }
        } 
    }

    function RegistryDefinition(namespace, constructor, attributes) {
        
        // initialise members
        this.namespace = namespace;
        this.attributes = attributes || {};
        
        // deal with the various different constructor values appropriately
        if (typeof constructor == 'function') {
            this.constructor = constructor;
        }
        else {
            this.instance = constructor;
        }
        
        // mark this as not being a singleton instance (until told otherwise)
        this.singleton = false;
    }
    
    RegistryDefinition.prototype = {
        create: function() {
            var newObject;
            
            if (this.constructor || this.instance) {
                // create the new object or re-use the instance if it's there
                newObject = this.instance || this.constructor.apply(null, arguments);
                
                // map the attributes across to the new object
                for (var key in this.attributes) {
                    if (! newObject.hasOwnProperty(key)) {
                        newObject[key] = this.attributes[key];
                    }
                }
                
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
    
    // override the filter implementation (and give one to old browsers)
    RegistryResults.prototype.filter = function(callback) {
        var results = new RegistryResults();
        
        for (var ii = 0, count = this.length; ii < count; ii++) {
            if (callback(this[ii])) {
                results.push(this[ii]);
            }
        }
        
        return results;
    };

    
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
    
    function _define(namespace, constructor, attributes) {
        if (definitions[namespace]) {
            throw new Error('Unable to define "' + namespace + '", it already exists');
        }
        
        // create the definition and return the instance
        return definitions[namespace] = new RegistryDefinition(namespace, constructor, attributes);
    }
    
    // ## registry.scaffold
    // The scaffold function is used to define a prototype rather than a module pattern style 
    // constructor function.  Internally the registry creates a define call and creates an 
    // anonymous function that creates a new instance of the prototype via the constructor 
    // and ensures that the prototype has be assigned to the object
    function _scaffold(namespace, constructor, prototype) {
        // if the constructor is not a function, then remap the arguments
        if (typeof constructor != 'function') {
            prototype = constructor;
            constructor = null;
        }
        
        return _define(namespace, function() {
            var result = constructor ? new constructor() : {};

            // assign the prototype to the object
            if (prototype) {
                result.__proto__ = prototype;
            }

            // return the result
            return result;
        });
    }
    
    // ## registry.singleton
    // This is a version of `registry.define` that marks the definition as a singleton instance.
    // What this means is that once an instance of the object is created, that instance is cached
    // in the definition and return for future create calls.
    function _singleton() {
        // pass through the function arguments to the define call
        var definition = _define.apply(null, arguments);
        
        // mark the definition as a singleton instance
        definition.singleton = true;
        
        // return the definition
        return definition;
    }
    
    function _undef(namespace) {
        delete _defitions[namespace];
    }
    
    registry.define = _define;
    registry.find = registry;
    registry.scaffold = _scaffold;
    registry.singleton = _singleton;
    registry.undef = _undef;
    
    // event handling
    registry.bind = _bind;
    registry.unbind = _unbind;
    
    (typeof module != "undefined" && module.exports) ? (module.exports = registry) : (typeof define != "undefined" ? (define("registry", [], function() { return registry; })) : (glob.registry = registry));
})(this);
