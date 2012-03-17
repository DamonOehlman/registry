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
        var newObject;
        
        if (this.constructor || this.instance) {
            // create the new object or re-use the instance if it's there
            newObject = this.instance || this.constructor.apply(null, arguments);
            
            // if the new object has successfully been created, and is of type object
            // then assign the prototype
            if (typeof newObject == 'object') {
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
        if (! this._prototype) {
            return this.prototype(proto);
        }
        else {
            for (var key in proto) {
                // if none of the descendant prototypes have implemented this member, then copy
                // it across to the new prototype
                if (! this._prototype[key]) {
                    this._prototype[key] = proto[key];
                }
            }
            
            return this;
        }
    },
    
    matches: function(test) {
        return matchme(this._prototype, test);
    },
    
    prototype: function(proto) {
        // create a new instance of the prototype
        this._prototype = {};
        
        // add the base prototype to the new prototype to satisfy instance of calls
        this._prototype.__proto__ = proto;
        
        return this;
    },
    
    singleton: function() {
        this._singleton = true;
        return this;
    }
};