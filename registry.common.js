var wildcard = require('wildcard'),
    matchme = require('matchme');
    
// registry 0.2.0
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
        
        // initialise the prototype
        this._prototype = {};
        
        // deal with the various different constructor values appropriately
        if (typeof constructor == 'function') {
            this.constructor = constructor;
            
            // add the prototype associated with the constructor to the current prototype
            this._prototype.__proto__ = constructor.prototype;
        }
        else {
            this.instance = constructor;
        }
        
        // copy attribute values across to the prototype
        if (attributes) {
            for (var key in attributes) {
                this._prototype[key] = attributes[key];
            }
        }
        
        // mark this as not being a singleton instance (until told otherwise)
        this._singleton = false;
    }
    
    RegistryDefinition.prototype = {
        create: function() {
            var newObject = this.instance;
            
            // if the object has not already been created, then create the new instance
            if ((! newObject) && this.constructor) {
                // create the new object or re-use the instance if it's there
                newObject = this.instance || this.constructor.apply(null, arguments);
                
                // if the new object has successfully been created, and is of type object
                // then assign the prototype
                if (typeof newObject == 'object') {
                    // copy any methods from the object prototype into this prototype
                    if (newObject.__proto__ !== this._prototype) {
                        for (var key in newObject.__proto__) {
                            this._prototype[key] = newObject.__proto__[key];
                        }
                    }
                    
                    // retarget the new object prototype
                    newObject.__proto__ = this._prototype;
                }
                
                // if we have the new object, then trigger the create event
                if (typeof newObject != 'undefined') {
                    // trigger the create
                    _trigger.call(newObject, 'create', this);
    
                    // if the definition is a singleton and the instance is not yet assigned, then do that now
                    if (this._singleton && (! this.instance)) {
                        this.instance = newObject;
                    }
                }
            } 
    
            return newObject;
        },
        
        extend: function(proto) {
            for (var key in proto) {
                // if none of the descendant prototypes have implemented this member, then copy
                // it across to the new prototype
                if (! this._prototype[key]) {
                    this._prototype[key] = proto[key];
                }
            }
            
            return this;
        },
        
        matches: function(test) {
            return matchme(this._prototype, test);
        },
        
        prototype: function(proto) {
            // add the base prototype to the new prototype to satisfy instance of calls
            this._prototype.__proto__ = proto;
            
            return this;
        },
        
        singleton: function() {
            this._singleton = true;
            return this;
        }
    };

    function RegistryResults() {
        
    }
    
    RegistryResults.prototype = new Array();
    RegistryResults.prototype.create = function() {
        return this[0] ? this[0].create.apply(this[0], arguments) : undefined;
    };
    
    RegistryResults.prototype.current = function() {
        return this.instances()[0];
    };
    
    RegistryResults.prototype.instances = function() {
        var results = [];
    
        for (var ii = 0, count = this.length; ii < count; ii++) {
            if (this[ii].instance) {
                results[results.length] = this[ii].instance;
            }
        }
        
        return results;
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
                return item.matches(test);
            });
        }
        
        return results;
    }
    
    function _define(namespace, constructor, attributes) {
        if (definitions[namespace]) {
            throw new Error('Unable to define "' + namespace + '", it already exists');
        }
        
        // create the definition and return the instance
        var definition = definitions[namespace] = new RegistryDefinition(namespace, constructor, attributes);
        
        // trigger the define event (use setTimeout to allow other assignments to complete)
        setTimeout(function() {
            // trigger the event
            _trigger.call(definition, 'define', definition);
        }, 0);
        
        // return the definition
        return definition;
    }
    
    function _fn(namespace, handler) {
        // create the definition
        var definition = _define(namespace);
        
        // set the instance of the definition to the handler
        definition.instance = handler;
        
        // return the definition
        return definition;
    }
    
    function _module() {
        var definition = _define.apply(null, arguments);
        
        // set the definition as a singleton
        definition.singleton();
        
        // return the new definition
        return definition;
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
        
        var def = _define(namespace, function() {
            var instance = constructor ? new constructor() : {};
            
            // if we have been supplied arguments, then call the constructor again
            // with the arguments supplied
            if (instance && arguments.length > 0) {
                constructor.apply(instance, arguments);
            }
            
            // return the new instance
            return instance;
        });
        
        return prototype ? def.prototype(prototype) : def;
    }
    
    function _undef(namespace) {
        delete _defitions[namespace];
    }
    
    registry.define = _define;
    registry.find = registry;
    registry.fn = _fn;
    registry.scaffold = _scaffold;
    registry.module = _module;
    registry.undef = _undef;
    
    // event handling
    registry.bind = _bind;
    registry.unbind = _unbind;
    
    (typeof module != "undefined" && module.exports) ? (module.exports = registry) : (typeof define != "undefined" ? (define("registry", [], function() { return registry; })) : (glob.registry = registry));
})(this);
