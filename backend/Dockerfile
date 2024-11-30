FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy poetry files first
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

# Copy the rest of the application
COPY . .

# Set PYTHONPATH to include src directory
ENV PYTHONPATH=/app/src

# Run the application from src directory
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]