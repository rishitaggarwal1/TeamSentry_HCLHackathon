FROM python:3.11-slim

WORKDIR /app

# (Optional but recommended) system deps for some ML libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy code + model assets
COPY . .

EXPOSE 8000

# Run uvicorn in container (bind to 0.0.0.0)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
