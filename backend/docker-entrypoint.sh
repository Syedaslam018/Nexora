#!/bin/sh
set -e

# No versioned migration files exist in this repo yet (prisma/migrations/
# is empty — generating them requires `prisma migrate dev` against a live
# Postgres instance, which this project has never had access to; see
# docs/PROGRESS.md's Phase 2 notes). `db push` syncs the schema directly
# without needing migration files, which is what makes `docker compose up`
# work out of the box right now. Once real migrations exist, switch this
# to `npx prisma migrate deploy` — the proper, versioned way to apply
# schema changes in production — and this comment should go with it.
echo "Syncing database schema (prisma db push)..."
npx prisma db push --skip-generate --accept-data-loss

exec "$@"
