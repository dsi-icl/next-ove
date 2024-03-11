FROM node:18.19-alpine AS build
LABEL authors="bc2918"

RUN apk add --no-cache --virtual .build-deps make gcc g++ python3

WORKDIR /usr/src/app

ENV NODE_ENV production
ENV NX_DAEMON false

COPY ../../tsconfig.base.json ./
COPY ../../tsconfig.json ./
COPY ../../nx.json ./
COPY ../../package.json ./
COPY ../../package-lock.json ./
COPY ../../tools/prisma ./apps/ove-core/prisma
COPY ../../babel.config.json ./

RUN npm ci --include=dev --no-proxy registry.npmjs.org --maxsockets 1

WORKDIR /usr/src/app/apps/ove-core
RUN npx prisma generate
WORKDIR /usr/src/app

COPY ../../apps/ove-core-ui ./apps/ove-core-ui
# reliant on type definition from ove-core
COPY ../../apps/ove-core ./apps/ove-core
COPY ../../libs/ove-server-utils ./libs/ove-server-utils
# reliant on following libraries
COPY ../../libs/ove-logging ./libs/ove-logging
COPY ../../libs/ove-types ./libs/ove-types
COPY ../../libs/ove-utils ./libs/ove-utils
COPY ../../libs/ui-base-components ./libs/ui-base-components
COPY ../../libs/ui-components ./libs/ui-components
COPY ../../libs/ui-reorderable-list ./libs/ui-reorderable-list

RUN npx nx run ove-core-ui:build

RUN apk del .build-deps

FROM nginx:1.21.6-alpine AS runtime
LABEL authors="bc2918"

COPY --from=build /usr/src/app/dist/apps/ove-core-ui/ /usr/share/nginx/html/
COPY ../../apps/ove-core-ui/nginx.docker.conf /etc/nginx/conf.d/default.conf
COPY ../../apps/ove-core-ui/env.sh /docker-entrypoint.d/env.sh

RUN chmod +x /docker-entrypoint.d/env.sh