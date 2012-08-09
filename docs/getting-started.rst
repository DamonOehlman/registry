Getting Started
===============

Registry can be a little hard to get your head around at first, so let's start with a simple example.  In the example below we will create a `welcomer` module which exposes a single method `sayHello` which writes a greeting on the console.

.. literalinclude:: ../examples/define-module.js
	:language: javascript
	:lines: 3-

In the example above, we use the `registry.module` function to define a module which will be invoked as an `IIFE`_ which is equivalent to calling `registry.define` passing an IIFE yourself.  Shown below is an example of the welcomer definition using the basic define functionality.  It looks a little messy, which is why the module helper was introduced.

.. literalinclude:: ../examples/define-module-altsyntax.js
	:language: javascript
	:lines: 3-

Wildcard Power
--------------

While the examples above show how you can use registry in a simple way, they really don't demonstrate why you would use registry.  For this, we will create a slightly more complicated welcomer example.

In this example we will create two variants of a welcomer, both which provide a `sayHello` method:

.. literalinclude:: ../examples/define-module-variants.js
	:language: javascript
	:lines: 3-

As you can see, when we ask registry for an instance of a welcomer we don't ask it for a specific type of welcomer, but rather we let it decide which one will be supplied.  In this case, the `welcomer.polite` instance is returned and used as it was the first declared.  If you explicitly wanted to invoke the rude welcomer, you simply need to specify `welcomer.rude` in the registry call.

**NOTE:** As with `eve`_ the wildcard matching implementation (provided by the `wildcard`_ module) allows the request text of `welcomer` to match both `welcomer.polite` and `welcomer.rude` by inferring a pattern of `welcomer.*`.

.. include:: links.txt