# Stage 1: Build dependencies and create binary with UV and PyInstaller
FROM ghcr.io/astral-sh/uv:python3.12-bookworm AS builder

WORKDIR /app

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    libvips-dev \
    libvips42 \
    pandoc \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY pyproject.toml uv.lock* ./

# Install dependencies using UV
RUN uv sync --frozen --no-dev

# Copy application code
COPY main.py ./
COPY src ./src

# Install PyInstaller
RUN uv pip install pyinstaller

# Create standalone binary
RUN uv run pyinstaller \
    --onefile \
    --name converter \
    --hidden-import=pyvips \
    --hidden-import=markdown \
    --hidden-import=pypandoc \
    --hidden-import=minio \
    --hidden-import=fastapi \
    --hidden-import=uvicorn \
    --collect-all pyvips \
    --collect-all markdown \
    --collect-all fastapi \
    --collect-all uvicorn \
    --copy-metadata pyvips \
    --copy-metadata markdown \
    --copy-metadata fastapi \
    --copy-metadata uvicorn \
    --copy-metadata pydantic \
    --copy-metadata pydantic-core \
    main.py

# Stage 2: Extract minimal runtime dependencies
FROM debian:bookworm-slim AS runtime-deps

# Install runtime libraries and extract only what's needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips42 \
    libvips-tools \
    pandoc \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create directory structure for extracted files
RUN mkdir -p /runtime/usr/lib /runtime/usr/bin /runtime/etc /runtime/lib /runtime/lib64

RUN mkdir -p /deps/lib /deps/lib64 && \
    ldd /usr/bin/pandoc | grep "=> /" | awk '{print $3}' | \
    xargs -I {} cp {} /deps/lib/ && \
    cp /lib64/ld-linux-x86-64.so.2 /deps/lib64/

RUN mkdir -p /deps/lib /deps/lib64 /deps/usr/lib && \
    ldd /usr/bin/vips | grep "=> /" | awk '{print $3}' | \
    xargs -I {} cp -L {} /deps/lib/ && \
    cp /lib64/ld-linux-x86-64.so.2 /deps/lib64/ 2>/dev/null || true

# Copy VIPS-specific libraries from /usr/lib
RUN find /usr/lib/x86_64-linux-gnu -name "libvips*" -exec cp {} /deps/usr/lib/ \;

# Copy pandoc binary and its dependencies
#RUN cp /usr/bin/pandoc /runtime/usr/bin/ && \
#    ldd /usr/bin/pandoc | grep "=> /" | awk '{print $3}' | \
#    xargs -I '{}' sh -c 'mkdir -p /runtime$(dirname {}) && cp {} /runtime{}'

# Copy libvips libraries and dependencies
#RUN find /usr/lib -name "libvips*.so*" -exec cp -P {} /runtime/usr/lib/ \; && \
#    find /usr/lib/x86_64-linux-gnu -name "libvips*.so*" -exec cp -P {} /runtime/usr/lib/ \; && \
#    for lib in /usr/lib/x86_64-linux-gnu/libvips*.so*; do \
#        if [ -f "$lib" ]; then \
#            ldd "$lib" 2>/dev/null | grep "=> /" | awk '{print $3}' | \
#            xargs -I '{}' sh -c 'mkdir -p /runtime$(dirname {}) && cp -P {} /runtime{}' || true; \
#        fi \
#    done

# Copy essential system libraries
#RUN cp -P /lib/x86_64-linux-gnu/libc.so.6 /runtime/lib/ && \
#    cp -P /lib/x86_64-linux-gnu/libm.so.6 /runtime/lib/ && \
#    cp -P /lib/x86_64-linux-gnu/libpthread.so.0 /runtime/lib/ && \
#    cp -P /lib/x86_64-linux-gnu/libdl.so.2 /runtime/lib/ && \
#    cp -P /lib/x86_64-linux-gnu/libz.so.1 /runtime/lib/ && \
#    cp -P /lib64/ld-linux-x86-64.so.2 /runtime/lib64/

# Copy CA certificates
#RUN cp -r /etc/ssl /runtime/etc/

# Stage 3: Final distroless image
FROM gcr.io/distroless/base-debian12

# Copy runtime dependencies
#COPY --from=runtime-deps /runtime /

# Copy the PyInstaller binary
COPY --from=builder /app/dist/converter /converter

COPY --from=runtime-deps \
     /lib/x86_64-linux-gnu/libz.so.* \
     /lib/x86_64-linux-gnu/
COPY --from=runtime-deps /lib/x86_64-linux-gnu/libc.so* /lib/x86_64-linux-gnu/
COPY --from=runtime-deps /lib/x86_64-linux-gnu/libm.so* /lib/x86_64-linux-gnu/
COPY --from=runtime-deps /lib/x86_64-linux-gnu/libpthread.so* /lib/x86_64-linux-gnu/
COPY --from=runtime-deps /lib/x86_64-linux-gnu/libdl.so* /lib/x86_64-linux-gnu/
COPY --from=runtime-deps /usr/bin/pandoc /usr/bin/pandoc
COPY --from=runtime-deps /deps/lib/* /lib/x86_64-linux-gnu/
COPY --from=runtime-deps /deps/lib64/* /lib64/
COPY --from=runtime-deps /usr/bin/vips /usr/bin/vips
COPY --from=runtime-deps /deps/usr/lib/* /usr/lib/x86_64-linux-gnu/
COPY --from=runtime-deps /usr/share/pandoc/data /usr/share/pandoc/data

# Set library path
#ENV LD_LIBRARY_PATH=/usr/lib:/usr/lib/x86_64-linux-gnu:/lib:/lib/x86_64-linux-gnu

EXPOSE 8000

ENTRYPOINT ["/converter"]