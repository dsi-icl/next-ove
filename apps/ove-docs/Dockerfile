FROM node:iron-alpine AS build
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NX_DAEMON=false

RUN npm install -g pnpm

COPY ../../nx.json ./
COPY ../../dist/apps/ove-docs/package.json ./
COPY ../../dist/apps/ove-docs/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
RUN pnpm add -D zod@3.22.3 nx@20.3.2 @nx/esbuild@20.3.2 esbuild@0.24.2  \
    tsconfig-paths@4.2.0 typescript@5.9.0-dev.20250618

COPY ../../cli ./cli
COPY ../../package.json ./
COPY ../../tsconfig.base.json ./

COPY ../../apps/ove-docs ./apps/ove-docs
COPY ../../libs/ove-logging ./libs/ove-logging
COPY ../../libs/ove-server-utils ./libs/ove-server-utils
COPY ../../libs/ove-utils ./libs/ove-utils
COPY ../../libs/ove-types ./libs/ove-types

RUN pnpx nx run ove-docs:build:production

FROM node:iron-alpine AS runtime
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

EXPOSE 8080
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=build /usr/src/app/dist/apps/ove-docs/main.cjs ./main.cjs
COPY --from=build /usr/src/app/dist/apps/ove-docs/assets ./assets
COPY --from=build /usr/src/app/dist/apps/ove-docs/public ./public
COPY ./docs/* ./public
COPY ./apps/ove-docs/.env.production /usr/src/app/.env

CMD ["node", "main.cjs"]