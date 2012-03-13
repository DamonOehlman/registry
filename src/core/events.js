var _listeners = {},
    reEventType = /^(\w+)\:(.*)$/;
    
function _parseEventPattern(pattern) {
    // extract the event type from the pattern
    var match = reEventType.exec(pattern),
        details = {
            type: 'default',
            pattern: pattern
        };
    
    // if we have a match, then appropriately map the pattern 
    if (match) {
        details.type = match[1];
        details.pattern = match[2];
    }
    
    return details;
}

function _bind(pattern, handler) {
    var evt = _parseEventPattern(pattern);
    
    // create the array if required
    if (! _listeners[evt.type]) {
        _listeners[evt.type] = [];
    }
    
    _listeners[evt.type].push({ matcher: wildcard(evt.pattern), handler: handler });
}

function _trigger(eventType, def) {
    var listeners = _listeners[eventType] || [];
    
    for (var ii = 0, count = listeners.length; ii < count; ii++) {
        if (listeners[ii].matcher.match(def.namespace)) {
            listeners[ii].handler.call(this, def);
        }
    }
}

function _unbind(pattern, handler) {
    var evt = _parseEventPattern(pattern),
        listeners = _listeners[evt.type] || [];
        
    // iterate through the listeners and splice out the matching handler
    for (var ii = listeners.length; ii--; ) {
        var matcher = listeners[ii].matcher;
        
        if (matcher && matcher.match(evt.pattern) && listeners[ii].handler === handler) {
            listeners.splice(ii, 1);
        }
    } 
}