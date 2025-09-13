#!/bin/bash

# Install dependencies
npm install

# Build the project
npm run build

# Ensure proper MIME types for JavaScript modules
echo '{"routes":[{"src":"/(.+\\.(js|jsx|ts|tsx))$","headers":{"Content-Type":"application/javascript"},"continue":true},{"src":"/(.+\\.css)$","headers":{"Content-Type":"text/css"},"continue":true},{"src":"/(.*)","dest":"/index.html"}]}' > ./dist/vercel.json