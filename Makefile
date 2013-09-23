NODE?=`which node`
SHELL=/bin/bash

default: test

FAIL=echo FAIL
PASS=echo PASS

test:
	@echo Using $(NODE)
	@for i in test/*.js; do \
	  echo -n "$$i: "; \
	  $(NODE) $$i 2>/dev/null > /dev/null && $(PASS) || $(FAIL); \
	done

.PHONY: test
