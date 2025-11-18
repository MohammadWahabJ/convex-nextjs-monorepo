# Dockerfile for web app (placed at: apps/web/Dockerfile)
# Build from root with: docker build -f apps/web/Dockerfile -t web-app .

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
ENV PNPM_HOME=/usr/local/bin

# ===== PRUNER STAGE =====
# Creates a pruned version of the monorepo containing only the web app and its dependencies
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune web --docker

# ===== INSTALLER STAGE =====
# Install dependencies for the pruned monorepo
FROM base AS installer
WORKDIR /app

# Copy pruned lockfile and package.json files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies (production + dev dependencies for building)
RUN pnpm install --frozen-lockfile

# Copy pruned source code
COPY --from=pruner /app/out/full/ .

# Copy .env for build-time variables (NEXT_PUBLIC_*)
COPY .env ./apps/web/.env

# Build the web app using turbo (handles dependency build order automatically)
RUN pnpm turbo build --filter=web

# ===== RUNNER STAGE =====
# Production image with only runtime dependencies
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from installer
COPY --from=installer /app/apps/web/next.config.mjs ./apps/web/
COPY --from=installer /app/apps/web/package.json ./apps/web/

# Copy built Next.js application
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=installer /app/apps/web/public ./apps/web/public

# Copy workspace packages if needed at runtime
COPY --from=installer /app/packages ./packages
COPY --from=installer /app/package.json ./
COPY --from=installer /app/pnpm-workspace.yaml ./
COPY --from=installer /app/pnpm-lock.yaml ./

# Install production dependencies only
WORKDIR /app
RUN pnpm install --prod --frozen-lockfile

USER nextjs
WORKDIR /app/apps/web

# Expose the port the app runs on
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["pnpm", "start"]
