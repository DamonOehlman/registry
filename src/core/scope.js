function ControlScope(ns) {
    var scope = this;
    
    // default the ns to an empty string
    ns = ns || '';
    
    // initialise members
    this.ns = ns ? ns + '.' : '';
    this.definitions = {};
    this.instances = {};
    
    // handle creation
    eve.on(this.ns + 'get', function() {
        return scope._create.apply(scope, Array.prototype.slice.call(arguments));
    });
}

ControlScope.prototype._create = function() {
    var targetName = eve.nt().slice((this.ns + 'get.').length),
        def = this.definitions[targetName],
        instances = this.instances[targetName],
        args = Array.prototype.slice.call(arguments),
        newInstance;
    
    // ensure we have the instances array
    if (! instances) {
        instances = this.instances[targetName] = [];
    }
    
    // if we have the def, then check whether the type is a singleton instance
    if (def && def.singleton && instances.length > 0) {
        return instances[0];
    }
    else if (def && def.creator) {
        if (typeof def.creator == 'function') {
            newInstance = def.creator.apply(null, args);
        }
        else if (typeof def.creator.constructor == 'function') {
            newInstance = new def.creator.constructor;
        }
        
        if (newInstance) {
            eve(this.ns + 'create.' + targetName, this, newInstance);
            instances[instances.length] = newInstance;
        }
    }
    
    return newInstance;
};

ControlScope.prototype.define = function(type, creator, opts) {
    // ensure we have options
    opts = opts || {};
    
    // define the constructors
    this.definitions[type] = {
        creator: creator,
        singleton: opts.singleton
    };
};

ControlScope.prototype.get = function(type) {
    return eve.apply(eve, [this.ns + 'get.' + type, this].concat(Array.prototype.slice.call(arguments)))[0];
};