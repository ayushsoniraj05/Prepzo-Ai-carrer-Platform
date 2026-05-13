# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies for FAISS and other libs
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user (Hugging Face uses UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set directory permissions for the user
WORKDIR $HOME/app

# Copy requirements and install
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the rest of the application
COPY --chown=user . .

# Create necessary directories
RUN mkdir -p data/faiss_indexes data/knowledge_base logs models

# Expose the port Hugging Face Spaces uses
EXPOSE 7860

# Command to run the application
# Use --host 0.0.0.0 and --port 7860 for Hugging Face compatibility
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
