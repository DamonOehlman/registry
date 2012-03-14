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
    this._singleton = false;
}

RegistryDefinition.prototype = {
    create: function() {
        var newObject;
        
        if (this.constructor || this.instance) {
            // create the new object or re-use the instance if it's there
            newObject = this.instance || this.constructor.apply(null, arguments);
            
            // if we have a prototype defined then apply it to the object
            if (this._prototype) {
                newObject.__proto__ = this._prototype;
            }
            
            // map the attributes across to the new object
            for (var key in this.attributes) {
                if (! newObject.hasOwnProperty(key)) {
                    newObject[key] = this.attributes[key];
                }
            }
            
            // trigger the create
            _trigger.call(newObject, 'create', this);

            // if the definition is a singleton and the instance is not yet assigned, then do that now
            if (this._singleton && (! this.instance)) {
                this.instance = newObject;
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