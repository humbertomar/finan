# ===========================
# STAGE 1 - BUILD
# ===========================
FROM node:22-alpine AS builder

ENV TZ=America/Sao_Paulo

WORKDIR /app

# Dependências
COPY package*.json ./
RUN npm ci

# Prisma config + schema
COPY prisma.config.ts ./
COPY prisma ./prisma

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

COPY package*.json ./
RUN npm ci --omit=dev

# Prisma (schema, config e client gerado)
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

# Código compilado
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
