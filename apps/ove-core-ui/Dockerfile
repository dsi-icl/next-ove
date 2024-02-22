FROM node:18.0-alpine
LABEL authors="bc2918"

WORKDIR /usr/src/app
COPY ../../dist/apps/ove-core-ui/ ./

CMD ["npx", "http-server"]