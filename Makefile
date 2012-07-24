SHELL := /bin/bash

build:
	@interleave build src/*.js --wrap
	@bake dist/glob/registry.js --output test/browser/lib

test:
	@mocha --reporter spec

.PHONY: test