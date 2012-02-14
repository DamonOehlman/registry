var IoC = (function() {
    function ControlScope(ns) {
        var scope = this;
        
        // default the ns to an empty string
        ns = ns || '';
        
        // initialise members
        this.ns = 'ioc.' + (ns ? ns + '.' : '');
        this.definitions = {};
        this.instances = {};
        
        // handle creation
        eve.on(this.ns + 'get', function() {
            return scope._create.apply(scope, Array.prototype.slice.call(arguments));
        });
    }
    
    ControlScope.prototype._create = function() {
        var targetName = eve.nt().slice((this.ns + 'get.').length),
            def = this._findDefinitions(targetName)[0],
            args = Array.prototype.slice.call(arguments),
            instances, newInstance;
            
        // if we do not have a definition return undefined
        if (! def) {
            return undefined;
        }
        else {
            instances = this.instances[def.type];
        }
        
        // ensure we have the instances array
        if (! instances) {
            instances = this.instances[def.type] = [];
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
                eve(this.ns + 'create.' + def.type, this, newInstance);
                instances[instances.length] = newInstance;
            }
        }
        
        return newInstance;
    };
    
    ControlScope.prototype._findDefinitions = function(targetName) {
        // create the regex
        var reMatchingDef = new RegExp('^' + (targetName || '').replace(/\.\*?$/, '') + '(?:$|\.)'), 
            key, matches = [];
        
        // iterate through the definitions and look for a regex match
        for (key in this.definitions) {
            if (reMatchingDef.test(key)) {
                matches[matches.length] = this.definitions[key];
            }
        }
        
        return matches;
    };
    
    ControlScope.prototype.accept = function(type, opts, callback) {
        var evtName = this.ns + 'create.' + type,
            getExisting, existing = [];
        
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
        
        // if we are looking for definitions, then find the definitions
        getExisting = typeof opts.existing == 'undefined' || opts.existing;
        if (getExisting && opts.definition) {
            existing = this._findDefinitions(type);
        }
        // otherwise, find the instances
        else if (getExisting) {
            var reTypeMatch = new RegExp('^' + type.replace(/\./g, '\\.'));
    
            for (var key in this.instances) {
                if (reTypeMatch.test(key)) {
                    existing = existing.concat(this.instances[key]);
                }
            }
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
        def = this.definitions[type] = {
            type: type,
            creator: creator,
            singleton: opts.singleton,
            
            create: function() {
                return scope.getInstance(type);
            }
        };
        
        // fire the define event
        eve(this.ns + 'define.' + type, def);
        return def;
    };
    
    ControlScope.prototype.getInstance = function(type) {
        return eve.apply(eve, [this.ns + 'get.' + type, this].concat(Array.prototype.slice.call(arguments)))[0];
    };

    
    return new ControlScope();
})();