# AI Integration Service Dockerfile
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY unified_server/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire AI_integration directory
COPY . .

# Set environment variables
ENV PYTHONPATH=/app/unified_server

RUN ls

# Create necessary directories
RUN mkdir -p /app/unified_server/data/profiles \
    && mkdir -p /app/unified_server/data/tts_results \
    && mkdir -p /app/unified_server/models

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run the unified server
CMD ["python", "-m", "uvicorn", "unified_server.main:app", "--host", "0.0.0.0", "--port", "8000"]