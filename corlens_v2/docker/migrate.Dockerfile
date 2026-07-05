# One-shot container that syncs the Prisma schema into Postgres
# (`prisma db push`) before the app services start. Idempotent — safe to
# re-run on every `docker compose up`. Kept standalone (just the Prisma CLI
# + the schema) so it doesn't depend on any app build.
FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
RUN npm install -g prisma@6.1.0
COPY packages/db/prisma ./prisma
# DATABASE_URL is injected by docker-compose. --skip-generate: we only sync
# the DB schema here, the Prisma client is generated inside each app image.
CMD ["prisma", "db", "push", "--schema=prisma/schema.prisma", "--skip-generate"]
