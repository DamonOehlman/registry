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