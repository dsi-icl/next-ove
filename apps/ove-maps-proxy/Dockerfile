FROM node:iron-alpine AS build
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

RUN apk add --no-cache --virtual .build-deps openssl

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NX_DAEMON=false

RUN npm install -g pnpm

COPY ../../nx.json ./
COPY ../../dist/apps/ove-maps-proxy/package.json ./
COPY ../../dist/apps/ove-maps-proxy/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
RUN pnpm add -D zod@3.22.3 nx@20.3.2 @nx/esbuild@20.3.2 esbuild@0.24.2 \
    tsconfig-paths@4.2.0 typescript@5.9.0-dev.20250618

COPY ../../package.json ./
COPY ../../tsconfig.base.json ./

COPY ../../apps/ove-maps-proxy ./apps/ove-maps-proxy

RUN pnpx nx run ove-maps-proxy:build:production

RUN apk del .build-deps

FROM node:iron-alpine AS runtime
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"
EXPOSE 8080

RUN apk add openssl

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=8080
ENV CACHE_DIR=/usr/src/app/cache

COPY --from=build /usr/src/app/dist/apps/ove-maps-proxy/main.cjs ./main.cjs

CMD ["node", "main.cjs"]