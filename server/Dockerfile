FROM python:3.12-slim

WORKDIR /app

# Copia só o requirements primeiro pra aproveitar o cache do Docker: se o
# código mudar mas as dependências não, o "pip install" não roda de novo.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 5001

CMD ["python", "app.py"]
