.PHONY: build deploy

build:
	npm run build

deploy: build
	cd dist && \
	git init && \
	git add -A && \
	git commit -m 'deploy' && \
	git push -f https://github.com/shishima123/vue-music-player.git master:gh-pages && \
	cd -