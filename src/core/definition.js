function RegistryDefinition(namespace, constructor, attributes) {
    var key;
    
    // initialise members
    this.namespace = namespace;
    
    // initialise the attributes
    this.attributes = attributes || {};
    
    // initialise the prototype
    this._prototype = {};
    
    // deal with the various different constructor values appropriately
    if (typeof constructor == 'function') {
        var emptyPrototype = true;
        
        // update the constructor
        this.constructor = constructor;

        // check for prototype keys
        for (key in constructor.prototype) {
            emptyPrototype = false;
            break;
        }
        
        // add the prototype associated with the constructor to the current prototype
        if (! emptyPrototype) {
            this._prototype = constructor.prototype;
        }
    }
    else {
        this.instance = constructor;
    }
    
    // mark this as not being a singleton instance (until told otherwise)
    this._singleton = false;
}

RegistryDefinition.prototype = {
    create: function() {
        var newObject = this.instance, key;
        
        // if the object has not already been created, then create the new instance
        if ((! newObject) && this.constructor) {
            // create the new object or re-use the instance if it's there
            newObject = this.instance || this.constructor.apply(null, arguments);
            
            // update the attribute values on the new instance
            for (key in this.attributes) {
                if (typeof newObject[key] == 'undefined') {
                    newObject[key] = this.attributes[key];
                }
            }
            
            // if the new object has successfully been created, and is of type object
            // then assign the prototype
            if (typeof newObject == 'object') {
                var proto = Object.getPrototypeOf(newObject);
                
                // copy any methods from the object prototype into this prototype
                for (key in this._prototype) {
                    if (typeof proto[key] == 'undefined') {
                        proto[key] = this._prototype[key];
                    }
                }
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
            if (typeof this._prototype[key] == 'undefined') {
                this._prototype[key] = proto[key];
            }
        }
        
        return this;
    },
    
    matches: function(test) {
        if (typeof matchme == 'undefined') {
            throw new Error('matchme library required for matches functionality');
        }

        return matchme(this.attributes, test) || matchme(this._prototype, test);
    },
    
    singleton: function() {
        this._singleton = true;
        return this;
    }
};