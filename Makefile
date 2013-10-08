NODE?=`which node`
SHELL=/bin/bash

default: test

FAIL=echo -e "\033[31m"FAIL"\033[0m"
PASS=echo -e "\033[32m"PASS"\033[0m"

test:
	@echo Using $(NODE)
	@for i in test/*.js; do \
	  echo -n "$$i: "; \
	  $(NODE) $$i 2>/dev/null > /dev/null && $(PASS) || $(FAIL); \
	done

.PHONY: test
