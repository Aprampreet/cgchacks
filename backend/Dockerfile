FROM python:3.13-slim

WORKDIR /app

# ---- Install FFmpeg and system deps ----
RUN apt-get update && apt-get install -y ffmpeg libsm6 libxext6 && apt-get clean

# ---- Install Python dependencies ----
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- Copy project files ----
COPY . .

EXPOSE 8000

# ---- Run migrations and start server ----
CMD ["sh", "-c", "python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:8000"]
