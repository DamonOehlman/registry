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