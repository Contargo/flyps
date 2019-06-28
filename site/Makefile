.PHONY: all js

all: js site

js: node_modules
	npm run build

node_modules: package.json
	npm install

site:
	hugo

clean:
	rm -rf static/js/bundle.js resources
