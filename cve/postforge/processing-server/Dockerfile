# PostForge Processing Server
# Multi-stage build for optimized production image

FROM node:20-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create Whisper venv
RUN python3 -m venv /opt/whisper-env && \
    /opt/whisper-env/bin/pip install --upgrade pip && \
    /opt/whisper-env/bin/pip install openai-whisper

# Production stage
FROM node:20-slim

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-venv \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy Whisper from builder
COPY --from=builder /opt/whisper-env /opt/whisper-env

# Set environment
ENV PATH="/opt/whisper-env/bin:${PATH}" \
    NODE_ENV=production \
    PORT=4000 \
    UPLOAD_DIR=/data/uploads \
    CLIPS_DIR=/data/clips

WORKDIR /app

# Copy application files
COPY package*.json ./
RUN npm ci --production

COPY server.js .
COPY routes/ ./routes/
COPY services/ ./services/

# Create data directories
RUN mkdir -p /data/uploads /data/clips && \
    chmod 755 /data/uploads /data/clips

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

EXPOSE 4000

# Run as non-root user
RUN useradd -m -u 1000 postforge && \
    chown -R postforge:postforge /app /data
USER postforge

CMD ["node", "server.js"]
