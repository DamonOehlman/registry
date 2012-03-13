function RegistryResults() {
    
}

RegistryResults.prototype = new Array();
RegistryResults.prototype.create = function() {
    return this[0] ? this[0].create.apply(this[0], arguments) : undefined;
};

RegistryResults.prototype.current = function() {
    return this.instances()[0];
};

RegistryResults.prototype.instances = function() {
    var results = [];

    for (var ii = 0, count = this.length; ii < count; ii++) {
        if (this[ii].instance) {
            results[results.length] = this[ii].instance;
        }
    }
    
    return results;
};

// override the filter implementation (and give one to old browsers)
RegistryResults.prototype.filter = function(callback) {
    var results = new RegistryResults();
    
    for (var ii = 0, count = this.length; ii < count; ii++) {
        if (callback(this[ii])) {
            results.push(this[ii]);
        }
    }
    
    return results;
};