.PHONY: all js

all: js site

js: static/js/bundle.js

static/js/bundle.js: index.js node_modules
	npm run build

node_modules: package.json
	npm install

site:
	hugo

clean:
	rm -rf static/js/bundle.js resources
