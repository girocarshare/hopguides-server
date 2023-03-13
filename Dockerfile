FROM node:18.15 as builder
WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm ci --production

FROM gcr.io/distroless/nodejs18-debian11
WORKDIR /usr/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 8080
CMD ["dist/server.js"]