.PHONY = start install clear test

all: install

start: 
	npm run dev

install: 
	npm install
	npx ts-jest config:init

test:
	npx jest
	
clear:
	rm -rf node_modules jest.config.ts package-lock.json
