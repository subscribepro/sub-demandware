FROM node:15-alpine

RUN apk --no-cache --update add python2 build-base

ADD cartridges cartridges
ADD storefront-reference-architecture storefront-reference-architecture
ADD test test
ADD package.json package.json
ADD package-lock.json package-lock.json
ADD webpack.config.js webpack.config.js

RUN npm install

ADD dw.json dw.json

ENTRYPOINT [ "npm", "run" ]
CMD [ "compile:js" ]
