function ControlScope(ns) {
    var scope = this;
    
    // default the ns to an empty string
    ns = ns || '';
    
    // initialise members
    this._ns = 'ioc.' + (ns ? ns + '.' : '');
    this._definitions = {};
    this._instances = {};
    
    // handle creation
    eve.on(this._ns + 'get', function() {
        return scope._create.apply(scope, Array.prototype.slice.call(arguments));
    });
}

ControlScope.prototype._create = function(type, allowCreate) {
    var scope = this,
        targetName = eve.nt().slice((this._ns + 'get.').length),
        args = Array.prototype.slice.call(arguments),
        allInstances = [];
       
    // for each of the definitions matching the targetName, attempt to create 
    // and required objects
    _.each(this._findDefinitions(targetName), function(def) {
        var instances = scope._instances[def.type],
            requireCreate;
        
        // ensure we have the instances array
        if (! instances) {
            instances = scope._instances[def.type] = [];
        }
        
        // do we need to (and are we allowed to create a new instance)
        requireCreate = def && def.creator && (
            (def.singleton && instances.length === 0) ||
            allowCreate
        );
        
        if (requireCreate) {
            if (typeof def.creator == 'function') {
                newInstance = def.creator.apply(null, args);
            }
            else if (typeof def.creator.constructor == 'function') {
                newInstance = new def.creator.constructor;
            }

            if (newInstance) {
                eve(this._ns + 'create.' + def.type, this, newInstance);
                instances[instances.length] = newInstance;
            }
        }
        
        // add these instances to the all instances
        allInstances = allInstances.concat(instances);
    });
        
    return allInstances;
};

ControlScope.prototype._findDefinitions = function(targetName) {
    // create the regex
    var reMatchingDef = new RegExp('^' + (targetName || '').replace(/\.\*?$/, '') + '(?:$|\.)'), 
        key, matches = [];
    
    // iterate through the definitions and look for a regex match
    for (key in this._definitions) {
        if (reMatchingDef.test(key)) {
            matches[matches.length] = this._definitions[key];
        }
    }
    
    return matches;
};

ControlScope.prototype._findInstances = function(targetName) {
    var reTypeMatch = new RegExp('^' + targetName.replace(/\./g, '\\.')),
        existing = [];

    for (var key in this._instances) {
        if (reTypeMatch.test(key)) {
            existing = existing.concat(this._instances[key]);
        }
    }
    
    return existing;
};

ControlScope.prototype.accept = function(type, opts, callback) {
    var evtName, getExisting, existing = [];
    
    if (typeof opts == 'function') {
        callback = opts;
        opts = {};
    }
    
    // ensure we have opts
    opts = opts || {};
    
    // if we have no callback, return
    if (! callback) {
        return {};
    }
    
    // initialise the event name
    evtName = this._ns + (opts.definition ? 'define.' : 'create.') + type;
    
    // if we are looking for definitions, then find the definitions
    getExisting = typeof opts.existing == 'undefined' || opts.existing;
    if (getExisting && opts.definition) {
        existing = this._findDefinitions(type);
    }
    // otherwise, find the instances
    else if (getExisting) {
        existing = this._findInstances(type);
    }
    
    // fire the callback for existing instances / definitions
    for (var ii = 0, count = existing.length; ii < count; ii++) {
        callback(existing[ii]);
    }
    
    // when new instances are created 
    eve.on(evtName, callback);

    return {
        stop: function() {
            eve.unbind(evtName, callback);
        }
    };
};

ControlScope.prototype.define = function(type, opts, creator) {
    var scope = this, def;
    
    // handle the normal case where options are omitted
    if (arguments.length <= 2) {
        creator = opts;
        opts = {};
    }
    
    // ensure we have options
    opts = opts || {};
    
    // define the constructors
    def = this._definitions[type] = {
        type: type,
        creator: creator,
        singleton: opts.singleton,
        
        getInstance: function() {
            return scope.getInstance(type);
        }
    };
    
    // fire the define event
    eve(this._ns + 'define.' + type, def);
    return def;
};

ControlScope.prototype.getInstance = function(type) {
    return this.instances(type, true)[0];
};

ControlScope.prototype.instances = function(type, allowCreate) {
    // find the instances for the ping ping classes
    return _.flatten(eve.apply(
        eve, 
        [this._ns + 'get.' + type, this].concat(Array.prototype.slice.call(arguments))
    ));
};

ControlScope.prototype.singleton = function(type, opts, creator) {
    // handle the normal case where options are omitted
    if (arguments.length <= 2) {
        creator = opts;
        opts = {};
    }

    // initialise opts
    opts = opts || {};
    opts.singleton = true;
    
    // define a singleton
    this.define(type, opts, creator);
};