# ===========================
# STAGE 1 - BUILD
# ===========================
FROM node:22-alpine AS builder

ENV TZ=America/Sao_Paulo

WORKDIR /app

# Copia e instala dependências
COPY package*.json ./
RUN npm ci

# Copia Prisma config + schema
COPY prisma.config.js ./
COPY prisma ./prisma

# Define um DATABASE_URL FAKE só para o prisma generate
# (não vai conectar em nada, é só pra satisfazer o Prisma 7)
ENV DATABASE_URL="postgres://postgres:postgres@localhost:5432/dummy_db"

# Gera o Prisma Client (src/generated/prisma)
RUN npx prisma generate

# Configs do Nest
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Código fonte
COPY src ./src

# Build da aplicação NestJS
RUN npm run build

# ===========================
# STAGE 2 - RUNTIME
# ===========================
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV TZ=America/Sao_Paulo

WORKDIR /app

# Copia package e instala só deps de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia Prisma config + schema
COPY prisma.config.js ./
COPY prisma ./prisma

# Copia o client gerado
COPY --from=builder /app/src/generated ./src/generated

# Copia o build compilado
COPY --from=builder /app/dist ./dist

# Porta padrão do Nest
EXPOSE 3000

# Em runtime o EasyPanel vai injetar a DATABASE_URL real
# Aqui rodamos as migrations e depois subimos a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
