# ===========================
# STAGE 1 - BUILD
# ===========================
FROM node:22-alpine AS builder

ENV TZ=America/Sao_Paulo

WORKDIR /app

COPY package*.json ./

RUN npm ci

# Copia arquivos de config básicos do Vite
COPY vite.config.* ./
COPY tsconfig*.json ./
COPY index.html ./

# Copia fontes do front
COPY src ./src
COPY public ./public

# Build de produção
RUN npm run build

# ===========================
# STAGE 2 - RUNTIME
# ===========================
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV TZ=America/Sao_Paulo

WORKDIR /app

# Usa um servidor estático simples
RUN npm install -g serve

# Copia o build estático
COPY --from=builder /app/dist ./dist

# Porta onde o serve vai rodar
EXPOSE 4173

# Sobe o front em modo estático
CMD ["serve", "-s", "dist", "-l", "4173", "--single"]
