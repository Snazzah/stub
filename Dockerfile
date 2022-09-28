# syntax=docker/dockerfile:1

# ---- Builder ----
FROM node:18-alpine AS builder

RUN mkdir /build
WORKDIR /build

COPY package.json .
COPY yarn.lock .
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn generate
RUN yarn build

# ---- Dependencies ----
FROM node:18-alpine AS deps

WORKDIR /deps

COPY package.json .
COPY yarn.lock .
COPY ./prisma .
RUN yarn install --frozen-lockfile --prod --ignore-optional
RUN yarn generate
RUN yarn preload-geolite

# ---- Runner ----
FROM node:18-alpine

RUN apk add dumb-init

WORKDIR /app

COPY --from=builder /build/package.json ./package.json
COPY --from=builder /build/yarn.lock ./yarn.lock
COPY --from=deps /deps/node_modules ./node_modules
COPY --chown=node:node --from=builder /build/.next ./.next
COPY --chown=node:node --from=builder /build/public ./public
COPY --from=builder /build/server ./server
COPY --from=builder /build/prisma ./prisma

USER node
ENV NODE_ENV production
EXPOSE 3000 3001
ENV PORT=3000
ENV ROUTER_PORT=3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "yarn migrate && yarn start:all"]