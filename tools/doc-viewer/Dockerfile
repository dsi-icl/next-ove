FROM node:hydrogen
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"
WORKDIR /usr/src/app
RUN npm install -g express glob
COPY ./tools/doc-viewer .
COPY ./docs ./public
COPY ./tools/doc-viewer/.env.production /usr/src/app/.env
COPY ./package.json .
EXPOSE 8080
CMD ["node", "server.js"]