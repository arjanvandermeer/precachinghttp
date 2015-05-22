#!/bin/sh

cd ..
mocha --require blanket -R html-cov tests/testCacheStore.js tests/testLinkedEventList.js > tests/coverage.html || open tests/coverage.html
