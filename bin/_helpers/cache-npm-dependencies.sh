# Cache npm dependencies
cd src
npm install
# Cache chimp deps by running it without any tests
./node_modules/.bin/chimp --path=features
