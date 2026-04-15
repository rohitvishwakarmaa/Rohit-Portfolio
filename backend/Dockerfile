# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.11-slim

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

# Set the working directory to /app
WORKDIR /app

# Copy requirements.txt and install the dependencies.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the local code to the container image.
COPY . ./

# Install gunicorn for production grade ASGI serving
RUN pip install gunicorn uvicorn[standard]

# Run the web service on container startup.
# Using Uvicorn workers via Gunicorn for better concurrency in production.
# --forwarded-allow-ips="*" ensures the Rate Limiter receives the actual client IP behind Render's proxy.
CMD exec gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:${PORT:-8000} --workers 4 --forwarded-allow-ips="*"
