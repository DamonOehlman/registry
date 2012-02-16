var IoC = (function() {
    var reAttributes = /^(.*)\[(.*)\]$/,
        reAttr = /^(\+)?(\w+)\=?(.*)$/;
    
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
    
    ControlScope.prototype._create = function(type, query, allowCreate) {
        var scope = this,
            targetName = eve.nt().slice((this._ns + 'get.').length),
            args = Array.prototype.slice.call(arguments),
            allInstances = [];
           
        // for each of the definitions matching the targetName, attempt to create 
        // and required objects
        _.each(this._find(this._definitions, targetName, query), function(def) {
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
    
    ControlScope.prototype._extractAttributes = function(type, creator, attributes) {
        // strip attributes from the type definition
        if (reAttributes.test(type)) {
            type = RegExp.$1;
            _.each(RegExp.$2.split(/[\,\s]\s*/), function(attribute) {
                var match = reAttr.exec(attribute);
                if (match) {
                    attributes[match[2]] = parseFloat(match[3]) || match[3] || true;
                }
            });
        }
        
        // if the creator is defined and has a contructor, then we have a prototype
        // let's map simple types on the prototype to attributes
        if (creator && creator.constructor) {
            for (var key in creator) {
                if (typeof creator[key] != 'function') {
                    attributes[key] = creator[key];
                }
            }
        }
        
        return type;
    };
    
    ControlScope.prototype._find = function(collection, targetName, query) {
        // create the regex
        var reMatchingDef = new RegExp('^' + (targetName || '').replace(/\.\*?$/, '') + '(?:$|\\.)'), 
            key, matches = [];
        
        // iterate through the definitions and look for a regex match
        for (key in collection) {
            if (reMatchingDef.test(key)) {
                matches[matches.length] = collection[key];
            }
        }
    
        // if we are working with the definitions collection and we have a query, then filter the results
        if (collection === this._definitions && query) {
            matches = _.filter(matches, function(match) {
                // TODO: filter based on query
                return true;
            });
        }
        
        return matches;
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
            existing = this._find(this._definitions, type);
        }
        // otherwise, find the instances
        else if (getExisting) {
            existing = _.flatten(this._find(this._instances, type));
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
        var scope = this, def,
            attributes = {};
        
        // handle the normal case where options are omitted
        if (arguments.length <= 2) {
            creator = opts;
            opts = {};
        }
        
        // ensure we have options
        opts = opts || {};
    
        // extract the attributes
        type = this._extractAttributes(type, creator, attributes);
        
        // define the constructors
        def = this._definitions[type] = {
            type: type,
            attributes: attributes,
            singleton: opts.singleton,
    
            creator: creator,
            
            getInstance: function() {
                return scope.getInstance(type);
            }
        };
        
        // fire the define event
        eve(this._ns + 'define.' + type, def);
        return def;
    };
    
    ControlScope.prototype.getInstance = function(type, query) {
        return this.instances(type, query, true)[0];
    };
    
    ControlScope.prototype.instances = function(type, query, allowCreate) {
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

    
    return new ControlScope();
})();