function RegistryResults() {
    this.items = [];
}

RegistryResults.prototype = {
    create: function() {
        return this.items[0] ? this.items[0].create.apply(this.items[0], arguments) : undefined;
    },

    current: function() {
        return this.instances()[0];
    },

    having: function(matchText, opts) {
        var results = this;

        // ensure we have options
        opts = opts || {};

        // if we have been passed a matchme test string, then filter the results
        if (typeof matchText != 'undefined') {
            results = results.filter(function(item) {
                return item.matches(matchText);
            });
        }

        // find valid instances
        // NOTE: if the newInstance option is provided, then we won't return an existing instance
        var instantiated = results.filter(function(item) {
            return (! opts.newInstance) && item.instance;
        });

        // if we have a valid instance, then return it otherwise create a new instance
        if (instantiated.length > 0) {
            return instantiated.items[0].instance;
        }
        else {
            return results.create.apply(results, opts.args || []);
        }
    },

    instances: function() {
        var results = [];

        for (var ii = 0, count = this.items.length; ii < count; ii++) {
            if (this.items[ii].instance) {
                results[results.length] = this.items[ii].instance;
            }
        }

        return results;
    },

    // IE <= 8 compat
    filter: function(callback) {
        var results = new RegistryResults();
        
        for (var ii = 0, count = this.items.length; ii < count; ii++) {
            if (callback(this.items[ii])) {
                results.items.push(this.items[ii]);
            }
        }
        
        return results;
    }
};