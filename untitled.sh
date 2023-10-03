#!/bin/bash

WARNINGS=`cat .eslint/index.html | sed -rn "/<meta .*name=.totalWarnings./ s/.*content=.([0-9-]+).*/\1/p"`
ERRORS=`cat .eslint/index.html | sed -rn "/<meta .*name=.totalErrors./ s/.*content=.([0-9-]+).*/\1/p"`
echo $WARNINGS
echo $ERRORS