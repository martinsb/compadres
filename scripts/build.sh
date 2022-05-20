#!/bin/sh

cd packages/compadres-app
yarn build
cd ../compadres-server
yarn build
mkdir -p build/public
cp -R ../compadres-app/build/* build/public
