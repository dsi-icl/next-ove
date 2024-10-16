FROM node:iron-slim
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"
WORKDIR /usr/src/app
RUN npm install -g express glob
COPY ./apps/ove-docs .
COPY ./docs ./public
COPY ./apps/ove-docs/.env.production /usr/src/app/.env
COPY ./package.json .
EXPOSE 8080
CMD ["node", "server.js"]