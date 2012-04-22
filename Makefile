SHELL := /bin/bash

build:
	@interleave src --package
	@bake pkg/oldschool/registry.js --output test/browser/lib

test:
	@mocha --reporter spec

.PHONY: test