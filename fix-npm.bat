@echo off
echo Fixing NPM Network Issues...
echo.

echo Clearing npm cache...
npm cache clean --force

echo Removing proxy settings...
npm config delete proxy
npm config delete https-proxy

echo Setting registry...
npm config set registry https://registry.npmjs.org/

echo Configuring network timeouts...
npm config set fetch-retries 5
npm config set fetch-retry-maxtimeout 120000
npm config set fetch-retry-mintimeout 20000
npm config set network-timeout 600000

echo.
echo Testing npm connectivity...
npm ping

echo.
echo NPM network configuration fixed!
echo Try running: npm install
pause

