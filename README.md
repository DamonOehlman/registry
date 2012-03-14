# Experimental namespaced IoC container

This is a simple project designed to provide something conceptually similar to IoC found in other languages.  It's definitely not the same, given that other implementations of IoC perform method signature matching and other techniques not well suited to JS.

<a href="http://travis-ci.org/#!/DamonOehlman/registry"><img src="https://secure.travis-ci.org/DamonOehlman/registry.png" alt="Build Status"></a>

This implementation instead uses __purpose-based namespacing__ when defining "classes".  What I mean by this is that something should be given a namespace relative to it's purpose rather than it's ownership (as is common in other languages).

## Examples



For the moment, see the tests but I'll write something more helpful soon.