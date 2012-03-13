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
    
    registry.define = _define;
    registry.find = registry;
    registry.singleton = _singleton;
    registry.undef = _undef;
    
    // event handling
    registry.bind = _bind;
    registry.unbind = _unbind;
    
    //@export registry
})(this);