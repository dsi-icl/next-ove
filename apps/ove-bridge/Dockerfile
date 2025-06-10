FROM node:iron-alpine AS build
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

RUN apk add --no-cache --virtual .build-deps make gcc g++ python3

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NX_DAEMON=false

COPY ../../tsconfig.base.json ./
COPY ../../tsconfig.json ./
COPY ../../nx.json ./
COPY ../../package.json ./
COPY ../../package-lock.json ./
COPY ../../tools/db ./tools/db
COPY ../../babel.config.json ./

RUN npm ci --include=dev --no-proxy registry.npmjs.org

COPY ../../apps/ove-bridge ./apps/ove-bridge

# reliant on following libraries
COPY ../../cli ./cli
COPY ../../libs/ove-server-utils ./libs/ove-server-utils
COPY ../../libs/ove-logging ./libs/ove-logging
COPY ../../libs/ove-utils ./libs/ove-utils
COPY ../../libs/ove-types ./libs/ove-types

RUN npm exec nx run ove-bridge:build

RUN apk del .build-deps

FROM node:iron-alpine AS runtime
LABEL org.opencontainers.image.authors="Brython Caley-Davies<ove@imperial.ac.uk>"

EXPOSE 8080
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=build /usr/src/app/dist/apps/ove-bridge/ ./

CMD ["/bin/sh", "-c", "./env.sh;node main.js"]