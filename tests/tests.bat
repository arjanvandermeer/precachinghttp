@echo off
cd ..
mocha tests/testCacheStore.js tests/testLinkedEventList.js
cd tests