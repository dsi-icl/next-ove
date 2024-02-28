FROM node:18.0-alpine
LABEL authors="bc2918"

WORKDIR /usr/src/app

ENV NODE_ENV production
COPY ../../dist/apps/ove-core/package.json ./
COPY ../../dist/apps/ove-core/package-lock.json ./
COPY ../../apps/ove-core/prisma/ ./

RUN npm install --omit=dev
RUN npx prisma generate

COPY ../../dist/apps/ove-core/ ./

EXPOSE 3333

CMD ["node", "main.js"]