FROM node:18.15 as builder
WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm ci --production

FROM node:18.15-alpine
WORKDIR /usr/app

RUN apk add --no-cache ffmpeg poppler-data poppler-utils

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 8080
CMD ["node", "dist/server.js"]