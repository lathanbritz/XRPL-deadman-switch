#!/bin/bash
export NODE_ENV=production
export DEBUG=deadman*
pm2 start ./src/index.js --name deadman --time