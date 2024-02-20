FROM node:18.0-alpine
LABEL authors="bc2918"

WORKDIR /usr/src/app

COPY ../../package.json ./

RUN npm install --legacy-peer-deps --omit=dev

COPY dist/apps/ove-core/ ./

EXPOSE 3333

CMD ["node", "main.js"]