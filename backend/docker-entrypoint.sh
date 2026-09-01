#!/bin/sh
set -e

if [ "${NODE_ENV:-development}" = "production" ]; then
  # Production must use reviewed, versioned migrations. `db push --accept-data-loss`
  # can drop columns or tables during a deployment, so it is intentionally
  # unavailable on the production path.
  echo "Applying database migrations (prisma migrate deploy)..."
  npx prisma migrate deploy
else
  echo "Syncing development database schema (prisma db push)..."
  npx prisma db push --skip-generate --accept-data-loss
fi

exec "$@"
