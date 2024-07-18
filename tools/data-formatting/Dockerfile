FROM python:3.12.4-slim-bookworm
LABEL authors="Brython Caley-Davies <bc2918@ic.ac.uk>"

RUN apk add --no-cache bash
RUN apk --no-cache add --virtual build-base autoconf automake

ARG VIPS_VERSION=8.8.3
ARG VIPS_URL=https://github.com/libvips/libvips/releases/download

RUN apk update && apk upgrade

# basic packages libvips likes
# we need to figure out the dependencies we need
RUN apk add \
    libtool \
    bc \
	zlib-dev \
	expat-dev \
	jpeg-dev \
	openjpeg-dev \
	tiff-dev \
	gdk-pixbuf-dev \
	glib-dev \
	libjpeg-turbo-dev \
	libexif-dev \
	lcms2-dev \
	fftw-dev \
	giflib-dev \
	libpng-dev \
	libwebp-dev \
    libgsf-dev \
	libxml2-dev \
	orc-dev \
	poppler-dev \
	librsvg-dev \
	openexr-dev \
	sqlite-dev

RUN ./configure && make && make install

RUN wget -O- ${VIPS_URL}/v${VIPS_VERSION}/vips-${VIPS_VERSION}.tar.gz | tar xzC /tmp

WORKDIR /tmp/vips-${VIPS_VERSION}

RUN ./configure --prefix=/usr --disable-static --disable-debug && make V=0 && make install

RUN rm -rf /tmp/vips-${VIPS_VERSION}

RUN apk del build-base autoconf automake

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

CMD ["python3", "-m", "flask", "run"]
