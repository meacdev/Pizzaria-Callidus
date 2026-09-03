FROM node:22-alpine

WORKDIR /app

# Copia só os arquivos de manifesto primeiro pra aproveitar o cache do
# Docker: se o código mudar mas as dependências não, o "npm install" não
# roda de novo.
COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
