FROM node:iron-slim
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

WORKDIR /usr/src/app

COPY ./apps/ove-docs/package.json .
RUN npm install

COPY ./apps/ove-docs .
COPY ./docs ./public
COPY ./apps/ove-docs/.env.production /usr/src/app/.env

EXPOSE 8080
CMD ["node", "main.ts"]