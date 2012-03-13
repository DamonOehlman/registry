function RegistryResults() {
    
}

RegistryResults.prototype = new Array();
RegistryResults.prototype.create = function() {
    return this[0] ? this[0].create.apply(this[0], arguments) : undefined;
};

if (! RegistryResults.prototype.filter) {
    RegistryResults.prototype.filter = function(callback) {
        var results = new RegistryResult();
        
        for (var ii = 0, count = this.length; ii < count; ii++) {
            if (callback(this[ii])) {
                results.push(this[ii]);
            }
        }
        
        return results;
    };
}