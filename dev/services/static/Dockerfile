FROM node:hydrogen
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"
WORKDIR /usr/src/app
COPY public .
EXPOSE 8080
CMD ["npx", "http-server"]