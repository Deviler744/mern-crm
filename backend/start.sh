#!/usr/bin/env bash
set -e

# Start script for production Docker/Render/Heroku
export NODE_ENV=${NODE_ENV:-production}

cd "$(dirname "$0")"
node server.js
