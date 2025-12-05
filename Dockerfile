# Dockerfile for hh-bumper with multi-stage build
ARG BUN_VERSION=1.3.3
ARG TARGETARCH
ARG BUILDPLATFORM
ARG TARGETPLATFORM

# Stage 1: Build dependencies and compile
FROM oven/bun:${BUN_VERSION}-slim AS builder

WORKDIR /app

# Copy dependency files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Compile executable for target architecture
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ] || [ "$TARGETARCH" = "arm64" ]; then \
        bun build index.ts --compile --minify --sourcemap --bytecode --outfile hh-bumper --target=bun-linux-arm64-modern; \
    else \
        bun build index.ts --compile --minify --sourcemap --bytecode --outfile hh-bumper --target=bun-linux-amd64; \
    fi

# Stage 2: Final image
FROM debian:13-slim

# Metadata
LABEL org.opencontainers.image.title="HH Bumper" \
      org.opencontainers.image.description="HeadHunter Resume Bumper" \
      org.opencontainers.image.source="https://github.com/kkrow/hh-bumper" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy compiled executable from builder stage
COPY --from=builder /app/hh-bumper /app/hh-bumper

# Copy built static files
COPY --from=builder /app/dist /app/dist

# Install required dependencies and create user
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        wget \
        ca-certificates \
        tzdata && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -g 1001 appuser && \
    useradd -u 1001 -g appuser -s /bin/bash -m appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 52888

# Default environment variables
ENV NODE_ENV=production

# Start the application
ENTRYPOINT ["/app/hh-bumper", "daemon"]
