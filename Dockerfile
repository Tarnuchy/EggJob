FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# PaaS wstrzykuje $PORT. Najpierw migracje, potem serwer.
# Uwaga: przy wielu instancjach migracje uruchamiaj jako osobny release-step,
# a nie w starcie kontenera (ryzyko równoległego DDL).
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn src.backend.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${WEB_CONCURRENCY:-2}"]
