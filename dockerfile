FROM node:22

ENV TZ=America/Sao_Paulo
WORKDIR /app

RUN npm install -g npm@latest

# 1) Copia manifests (cache)
COPY package*.json ./
COPY src/backend/package*.json ./src/backend/

# 2) Instala deps na raiz
RUN npm ci

# 3) Instala deps do backend
WORKDIR /app/src/backend
RUN npm ci

# 4) Copia o resto do código
WORKDIR /app
COPY . .

EXPOSE 3000
CMD ["node", "src/backend/server.js"]