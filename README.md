# Registry

Registry is designed to be a useful helper for managing definitions of JS modules, classes, functions, etc.  It provides the ability to define a "thing" using a string identifier and then
retrieve it at later date using [wildcard](/DamonOehlman/wildcard) matching.

<a href="http://travis-ci.org/#!/DamonOehlman/registry"><img src="https://secure.travis-ci.org/DamonOehlman/registry.png" alt="Build Status"></a>

## Why Use Registry?

Registry attempts to provide some of the benefits that you find using an [IoC](http://en.wikipedia.org/wiki/Inversion_of_control) in an OO programming environment, but does not force OO patterns into JS like many other Class Helper libraries.

When using registry you should be able to define things in much the same way you are used to.  You simply provide them a name that can be wildcard matched in a similar way to [eve](/DmitryBaranovskiy/eve) and retrieved later.  Using this technique you can either specifically target a particular thing by using a specific name or a more generalized instance using a more generalized namespace.

Primarily, Registry has been designed for use in the browser but will also work quite happily in a CommonJS environment (such as Node).

## Example Usage

At the moment, the tests contain some of the best examples of how Registry can be used, but full documentation will be completed one day...