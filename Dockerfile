# Dockerfile for hh-bumper with multi-stage build
ARG BUN_VERSION=1.3.3

# Stage 1: Build dependencies and compile (need to upgrade to distroless later when 1.3-distroless release)
FROM oven/bun:${BUN_VERSION}-alpine AS builder

WORKDIR /build

# Copy dependency files first for better layer caching
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile --backend=hardlink

# Copy source code (only what's needed for build)
COPY tsconfig.json orval.config.ts ./
COPY index.ts ./
COPY src/ ./src/

# Compile executable for target architecture
RUN bun build index.ts --production --bytecode --outdir dist

# Metadata
LABEL org.opencontainers.image.title="HH Bumper" \
      org.opencontainers.image.description="HeadHunter Resume Bumper" \
      org.opencontainers.image.source="https://github.com/kkrow/hh-bumper" \
      org.opencontainers.image.licenses="MIT"

FROM oven/bun:canary-distroless
WORKDIR /app

# Move compiled executable to /app with executable permissions
COPY --from=builder /build/dist /app

# Expose port
EXPOSE 52888

# Explicitly set stop signal for graceful shutdown
STOPSIGNAL SIGTERM

# Start the application
ENTRYPOINT ["bun", "run", "index.js", "daemon"]
