function RegistryResults() {
    this.items = [];
}

RegistryResults.prototype.create = function() {
    return this.items[0] ? this.items[0].create.apply(this.items[0], arguments) : undefined;
};

RegistryResults.prototype.current = function() {
    return this.instances()[0];
};

RegistryResults.prototype.instances = function() {
    var results = [];

    for (var ii = 0, count = this.items.length; ii < count; ii++) {
        if (this.items[ii].instance) {
            results[results.length] = this.items[ii].instance;
        }
    }
    
    return results;
};

RegistryResults.prototype.filter = function(callback) {
    var results = new RegistryResults();
    
    for (var ii = 0, count = this.items.length; ii < count; ii++) {
        if (callback(this.items[ii])) {
            results.items.push(this.items[ii]);
        }
    }
    
    return results;
};