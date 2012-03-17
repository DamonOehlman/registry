# Registry

It's a bucket. A Javascript bucket.  A big Javascript bucket for defining your modules, classes, configuration objects, etc.  While we could throw around different acronyms like IoC, AOP and the like, nothing quite fits exactly how registry works.  But they do give you a feel for the concepts and inspiration behind the project.

## The Importance of Namespaces

Registry uses namespaces to pragmatically define the purpose of a class, module or function.  Items are stored in the registry under a namespace and can be accessed either directly by the namespace, or by [wildcard](https://github.com/DamonOehlman/wildcard) matches.

Consider the following example:

```js
// define a (pretend) loader that can read from a local files 
registry.define('loader.file', function() {
    return {
        load: function(target) {
        }
    };
});

// create a new loader instance (using a wildcard )
var loader = registry('loader').create();
```