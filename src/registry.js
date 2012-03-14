//@header
(function(glob) {
    var definitions = {};
        
    //= core/events
    //= core/definition
    //= core/results
    
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
    registry.scaffold = _scaffold;
    registry.undef = _undef;
    
    // event handling
    registry.bind = _bind;
    registry.unbind = _unbind;
    
    //@export registry
})(this);