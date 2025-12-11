# ===========================
# STAGE 1 - BUILD
# ===========================
FROM node:22-alpine AS builder

ENV TZ=America/Sao_Paulo

WORKDIR /app

# 1) Copia só o mínimo pra instalar deps
COPY package*.json ./
RUN npm ci

# 2) Copia configs usadas no build (INCLUI TAILWIND/POSTCSS)
COPY vite.config.* ./
COPY tsconfig*.json ./
COPY tailwind.config.* ./
COPY postcss.config.* ./
COPY index.html ./

# 3) Código fonte
COPY src ./src
COPY public ./public

# 4) Build de produção
RUN npm run build

# ===========================
# STAGE 2 - RUNTIME (NGINX)
# ===========================
FROM nginx:alpine AS runner

ENV TZ=America/Sao_Paulo

# Limpa html padrão
RUN rm -rf /usr/share/nginx/html/*

# Copia o build
COPY --from=builder /app/dist /usr/share/nginx/html

# Config do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
