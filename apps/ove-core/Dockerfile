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

COPY ../../apps/ove-core ./apps/ove-core
COPY ../../apps/ove-core-ui ./apps/ove-core-ui

# reliant on following libraries
COPY ../../cli ./cli
COPY ../../libs/ove-server-utils ./libs/ove-server-utils
COPY ../../libs/ove-logging ./libs/ove-logging
COPY ../../libs/ove-utils ./libs/ove-utils
COPY ../../libs/ove-types ./libs/ove-types
COPY ../../libs/ui-base-components ./libs/ui-base-components
COPY ../../libs/ui-components ./libs/ui-components
COPY ../../libs/ui-reorderable-list ./libs/ui-reorderable-list

RUN npm exec nx run ove-core:build
RUN npm exec nx run ove-core-ui:build

RUN apk del .build-deps

FROM node:iron-alpine AS runtime
LABEL org.opencontainers.image.authors="Brython Caley-Davies<ove@imperial.ac.uk>"

EXPOSE 8080
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY ../../apps/ove-core-ui/env.sh ./
RUN chmod +x ./env.sh

COPY --from=build /usr/src/app/dist/apps/ove-core-ui/ ./ui
COPY --from=build /usr/src/app/dist/apps/ove-core/ ./

CMD ["/bin/sh", "-c", "./env.sh;node main.js"]