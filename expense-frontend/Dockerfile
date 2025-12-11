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
# STAGE 2 - RUNTIME (NGINX)
# ===========================
FROM nginx:alpine AS runner

ENV TZ=America/Sao_Paulo

# Apaga o default
RUN rm -rf /usr/share/nginx/html/*

# Copia o build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia um nginx.conf básico
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
