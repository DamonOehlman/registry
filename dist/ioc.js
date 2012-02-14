// ┌──────────────────────────────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.3.4 - JavaScript Events Library                                                │ \\
// ├──────────────────────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://dmitry.baranovskiy.com/)          │ \\
// │ Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license. │ \\
// └──────────────────────────────────────────────────────────────────────────────────────┘ \\

(function (glob) {
    var version = "0.3.4",
        has = "hasOwnProperty",
        separator = /[\.\/]/,
        wildcard = "*",
        fun = function () {},
        numsort = function (a, b) {
            return a - b;
        },
        current_event,
        stop,
        events = {n: {}},
    /*\
     * eve
     [ method ]
     **
     * Fires event with given `name`, given scope and other parameters.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated
     - scope (object) context for the event handlers
     - varargs (...) the rest of arguments will be sent to event handlers
     **
     = (object) array of returned values from the listeners
    \*/
        eve = function (name, scope) {
            var e = events,
                oldstop = stop,
                args = Array.prototype.slice.call(arguments, 2),
                listeners = eve.listeners(name),
                z = 0,
                f = false,
                l,
                indexed = [],
                queue = {},
                out = [],
                ce = current_event,
                errors = [];
            current_event = name;
            stop = 0;
            for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
                indexed.push(listeners[i].zIndex);
                if (listeners[i].zIndex < 0) {
                    queue[listeners[i].zIndex] = listeners[i];
                }
            }
            indexed.sort(numsort);
            while (indexed[z] < 0) {
                l = queue[indexed[z++]];
                out.push(l.apply(scope, args));
                if (stop) {
                    stop = oldstop;
                    return out;
                }
            }
            for (i = 0; i < ii; i++) {
                l = listeners[i];
                if ("zIndex" in l) {
                    if (l.zIndex == indexed[z]) {
                        out.push(l.apply(scope, args));
                        if (stop) {
                            break;
                        }
                        do {
                            z++;
                            l = queue[indexed[z]];
                            l && out.push(l.apply(scope, args));
                            if (stop) {
                                break;
                            }
                        } while (l)
                    } else {
                        queue[l.zIndex] = l;
                    }
                } else {
                    out.push(l.apply(scope, args));
                    if (stop) {
                        break;
                    }
                }
            }
            stop = oldstop;
            current_event = ce;
            return out.length ? out : null;
        };
    /*\
     * eve.listeners
     [ method ]
     **
     * Internal method which gives you array of all event handlers that will be triggered by the given `name`.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated
     **
     = (array) array of event handlers
    \*/
    eve.listeners = function (name) {
        var names = name.split(separator),
            e = events,
            item,
            items,
            k,
            i,
            ii,
            j,
            jj,
            nes,
            es = [e],
            out = [];
        for (i = 0, ii = names.length; i < ii; i++) {
            nes = [];
            for (j = 0, jj = es.length; j < jj; j++) {
                e = es[j].n;
                items = [e[names[i]], e[wildcard]];
                k = 2;
                while (k--) {
                    item = items[k];
                    if (item) {
                        nes.push(item);
                        out = out.concat(item.f || []);
                    }
                }
            }
            es = nes;
        }
        return out;
    };
    
    /*\
     * eve.on
     [ method ]
     **
     * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
     | eve.on("*.under.*", f);
     | eve("mouse.under.floor"); // triggers f
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment. 
     > Example:
     | eve.on("mouse", eat)(2);
     | eve.on("mouse", scream);
     | eve.on("mouse", catch)(1);
     * This will ensure that `catch` function will be called before `eat`.
     * If you want to put your handler before non-indexed handlers, specify a negative value.
     * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
    \*/
    eve.on = function (name, f) {
        var names = name.split(separator),
            e = events;
        for (var i = 0, ii = names.length; i < ii; i++) {
            e = e.n;
            !e[names[i]] && (e[names[i]] = {n: {}});
            e = e[names[i]];
        }
        e.f = e.f || [];
        for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
            return fun;
        }
        e.f.push(f);
        return function (zIndex) {
            if (+zIndex == +zIndex) {
                f.zIndex = +zIndex;
            }
        };
    };
    /*\
     * eve.stop
     [ method ]
     **
     * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
    \*/
    eve.stop = function () {
        stop = 1;
    };
    /*\
     * eve.nt
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     > Arguments
     **
     - subname (string) #optional subname of the event
     **
     = (string) name of the event, if `subname` is not specified
     * or
     = (boolean) `true`, if current event’s name contains `subname`
    \*/
    eve.nt = function (subname) {
        if (subname) {
            return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(current_event);
        }
        return current_event;
    };
    /*\
     * eve.unbind
     [ method ]
     **
     * Removes given function from the list of event listeners assigned to given name.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
    \*/
    eve.unbind = function (name, f) {
        var names = name.split(separator),
            e,
            key,
            splice,
            i, ii, j, jj,
            cur = [events];
        for (i = 0, ii = names.length; i < ii; i++) {
            for (j = 0; j < cur.length; j += splice.length - 2) {
                splice = [j, 1];
                e = cur[j].n;
                if (names[i] != wildcard) {
                    if (e[names[i]]) {
                        splice.push(e[names[i]]);
                    }
                } else {
                    for (key in e) if (e[has](key)) {
                        splice.push(e[key]);
                    }
                }
                cur.splice.apply(cur, splice);
            }
        }
        for (i = 0, ii = cur.length; i < ii; i++) {
            e = cur[i];
            while (e.n) {
                if (f) {
                    if (e.f) {
                        for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
                            e.f.splice(j, 1);
                            break;
                        }
                        !e.f.length && delete e.f;
                    }
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        var funcs = e.n[key].f;
                        for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
                            funcs.splice(j, 1);
                            break;
                        }
                        !funcs.length && delete e.n[key].f;
                    }
                } else {
                    delete e.f;
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        delete e.n[key].f;
                    }
                }
                e = e.n;
            }
        }
    };
    /*\
     * eve.once
     [ method ]
     **
     * Binds given event handler with a given name to only run once then unbind itself.
     | eve.once("login", f);
     | eve("login"); // triggers f
     | eve("login"); // no listeners
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) same return function as @eve.on
    \*/
    eve.once = function (name, f) {
        var f2 = function () {
            var res = f.apply(this, arguments);
            eve.unbind(name, f2);
            return res;
        };
        return eve.on(name, f2);
    };
    /*\
     * eve.version
     [ property (string) ]
     **
     * Current version of the library.
    \*/
    eve.version = version;
    eve.toString = function () {
        return "You are running Eve " + version;
    };
    (typeof module != "undefined" && module.exports) ? (module.exports = eve) : (typeof define != "undefined" ? (define("eve", [], function() { return eve; })) : (glob.eve = eve));
})(this);



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
            
            getInstance: function() {
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
