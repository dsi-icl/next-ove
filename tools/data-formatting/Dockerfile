FROM python:3.12.4-slim
LABEL authors="Brython Caley-Davies <bc2918@ic.ac.uk>"

RUN apt-get update && apt-get install -y \
        pkg-config \
        wget \
        build-essential \
        ninja-build \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

RUN pip3 install meson

RUN apt-get install -y --no-install-recommends \
    glib-2.0-dev \
    libexpat-dev \
    librsvg2-dev \
    libpng-dev \
    libspng-dev \
    libjpeg-dev \
    libexif-dev \
    liblcms2-dev \
    liborc-dev \
    libtiff5-dev \
    libexif-dev \
    libwebp-dev \
    libheif-dev \
    libpoppler-glib-dev \
    libfftw3-dev \
    libopenjp2-7-dev \
    libimagequant-dev \
    libpango1.0-dev \
    libcgif-dev \
    libarchive-dev \
    libjxl-dev \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

ARG VIPS_VERSION=8.15.2
ARG VIPS_URL=https://github.com/libvips/libvips/releases/download

WORKDIR /usr/local/src

RUN wget ${VIPS_URL}/v${VIPS_VERSION}/vips-${VIPS_VERSION}.tar.xz

RUN apt-get install -y --no-install-recommends \
    bc \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

RUN tar xf vips-${VIPS_VERSION}.tar.xz \
    && cd vips-${VIPS_VERSION} \
    && rm -rf build \
    && meson build --libdir lib -Dintrospection=disabled --buildtype release \
    && cd build \
    && ninja \
    && ninja test \
    && ninja install

ENV LD_LIBRARY_PATH=/usr/local/lib
ENV PKG_CONFIG_PATH=/usr/local/lib/pkgconfig

RUN pip install pyvips

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . .

CMD ["python3", "-m", "flask", "run"]
