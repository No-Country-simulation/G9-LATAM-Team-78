FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar algunas librerías
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar el archivo de requerimientos e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código, incluyendo los modelos .joblib
COPY . .

# Exponer el puerto
EXPOSE 8000

# Ejecutar FastAPI usando uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
