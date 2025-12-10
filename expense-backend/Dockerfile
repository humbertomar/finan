# ===========================
# STAGE 1 - BUILD
# ===========================
FROM node:22-alpine AS builder

# Ajuste de timezone opcional
ENV TZ=America/Sao_Paulo

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Se tiver pnpm/yarn é só adaptar o comando aqui
RUN npm ci

# Copia configs do Prisma
COPY prisma.config.ts ./
COPY prisma ./prisma

# Copia configs de build do Nest
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copia código fonte
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

# Copia package.json e lock pra instalar só deps de runtime
COPY package*.json ./

# Instala apenas dependências necessárias em produção
RUN npm ci --omit=dev

# Copia Prisma (schema + config)
COPY prisma.config.ts ./
COPY prisma ./prisma

# Copia build gerado no estágio anterior
COPY --from=builder /app/dist ./dist

# Porta padrão do Nest (ajusta no EasyPanel se usar outra)
EXPOSE 3000

# Ao subir o container:
# - roda as migrations em produção
# - inicia a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
