FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# System deps required by some python packages (tensorflow, psycopg2, etc.)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libgomp1 \
       libpq-dev \
       curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first to leverage Docker cache
COPY requirements-api.txt /app/requirements-api.txt
RUN pip install --upgrade pip setuptools wheel \
    && pip install -r /app/requirements-api.txt

# Copy application code and model files
COPY . /app

# Environment variables for the application (can be overridden at runtime)
ENV MODEL_PATH=/app/food_predict_feature/best_model_food100.keras
ENV CLASS_NAMES_PATH=/app/food_predict_feature/class_names.json

EXPOSE 8000

# Run the FastAPI app with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
