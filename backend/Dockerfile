# --- Build stage ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# prisma.config.ts resuelve DATABASE_URL de forma estricta (falla si no esta
# seteada) aunque `generate` no necesita conectarse de verdad a una base:
# solo lee schema.prisma. El valor real llega recien en runtime via
# docker-compose (env_file), nunca queda horneado en la imagen.
RUN DATABASE_URL="postgresql://user:pass@localhost:5432/db" DIRECT_URL="postgresql://user:pass@localhost:5432/db" npx prisma generate

RUN npm run build

# --- Runtime stage ---
FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
# El cliente generado (incluye el query compiler wasm) vive en node_modules/.prisma:
# `npm ci --omit=dev` de esta etapa no lo genera, hay que copiarlo de la etapa build.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000

CMD ["node", "dist/main.js"]
