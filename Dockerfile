FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY bot/package.json ./bot/

RUN pnpm install --filter @workspace/telegram-bot --frozen-lockfile --prod

COPY bot/ ./bot/

RUN mkdir -p bot/data

ENV NODE_ENV=production

CMD ["node", "bot/index.js"]
