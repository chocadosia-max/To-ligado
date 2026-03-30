FROM node:20-slim

# O Plano C (Baileys) não precisa de Chrome/Chromium.
# Mantemos apenas o básico para o Node voar.

ENV NODE_ENV=production
WORKDIR /app

# Instala apenas as dependências do Back-end
COPY package*.json ./
RUN npm install --omit=dev

# Copia o código (e ignora a pasta frontend para não pesar o build do Railway)
COPY . .

# Garante a pasta de autenticação
RUN mkdir -p /app/auth_baileys

EXPOSE 3000

CMD ["node", "src/index.js"]
