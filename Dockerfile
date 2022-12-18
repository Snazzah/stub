# syntax=docker/dockerfile:1

# ---- Builder ----
FROM --platform=$BUILDPLATFORM node:18-slim AS builder

ARG GIT_REVISION
ENV GIT_REVISION=${GIT_REVISION}

RUN mkdir /build
WORKDIR /build

RUN chown root.root .
COPY .yarn/releases ./.yarn/releases
COPY .yarnrc.yml .
COPY package.json .
COPY yarn.lock .
COPY ./prisma ./prisma
RUN yarn install --immutable

COPY . .
RUN yarn generate
RUN yarn build
RUN yarn preload-geolite

# ---- Runner ----
FROM node:18-slim

RUN apt-get update && apt-get install -y openssl dumb-init

WORKDIR /app

ARG GIT_REVISION
ENV GIT_REVISION=${GIT_REVISION}

COPY --from=builder /build/package.json ./package.json
COPY --from=builder /build/yarn.lock ./yarn.lock
COPY --chown=node:node --from=builder /build/node_modules ./node_modules
COPY --chown=node:node --from=builder /build/.next ./.next
COPY --chown=node:node --from=builder /build/public ./public
COPY --chown=node:node --from=builder /build/scripts ./scripts
COPY --from=builder /build/server ./server
COPY --from=builder /build/prisma ./prisma
COPY --from=builder /build/next.config.js ./

USER node
ENV NODE_ENV production
EXPOSE 3000 3001
ENV PORT=3000
ENV ROUTER_PORT=3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "yarn migrate && yarn start:all"]
