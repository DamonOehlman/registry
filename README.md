# Experimental namespaced IoC container

This is a simple project designed to provide something conceptually similar to IoC found in other languages.  It's definitely not the same, given that other implementations of IoC perform method signature matching and other techniques not well suited to JS.

This implementation instead uses __purpose-based namespacing__ when defining "classes".  What I mean by this is that something should be given a namespace relative to it's purpose rather than it's ownership (as is common in other languages).

For instance, consider the following (contrived) definitions:

```
IoC.define('vehicle.humvee[+offroad, topspeed=105]', function() {
    return {
        drive: function(from, to) {
        }
    }
});

IoC.define('vehicle.porsche[topspeed=240]', function() {
    return {
        drive: function(from, to) {
        }
    }
});
```



