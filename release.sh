#! /bin/bash

rm -rf dist
yarn js:build
yarn html:build
