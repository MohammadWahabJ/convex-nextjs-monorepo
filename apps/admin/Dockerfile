# Dockerfile for admin app (placed at: apps/admin/Dockerfile)
# Build from root with: docker build -f apps/admin/Dockerfile -t admin-app .

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
ENV PNPM_HOME=/usr/local/bin

# ===== PRUNER STAGE =====
# Creates a pruned version of the monorepo containing only the admin app and its dependencies
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune admin --docker

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

# Copy .env.admin for build-time variables (NEXT_PUBLIC_*)
COPY .env.admin ./apps/admin/.env

# Build the admin app using turbo (handles dependency build order automatically)
RUN pnpm turbo build --filter=admin

# ===== RUNNER STAGE =====
# Production image with only runtime dependencies
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from installer
COPY --from=installer /app/apps/admin/next.config.ts ./apps/admin/
COPY --from=installer /app/apps/admin/package.json ./apps/admin/

# Copy built Next.js application
COPY --from=installer --chown=nextjs:nodejs /app/apps/admin/.next ./apps/admin/.next
COPY --from=installer /app/apps/admin/public ./apps/admin/public

# Copy workspace packages if needed at runtime
COPY --from=installer /app/packages ./packages
COPY --from=installer /app/package.json ./
COPY --from=installer /app/pnpm-workspace.yaml ./
COPY --from=installer /app/pnpm-lock.yaml ./

# Install production dependencies only
WORKDIR /app
RUN pnpm install --prod --frozen-lockfile

# Copy TypeScript from installer stage (needed at runtime for next.config.ts)
COPY --from=installer /app/node_modules/typescript ./node_modules/typescript

#hi there, checking

USER nextjs
WORKDIR /app/apps/admin

# Expose the port the app runs on
EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

CMD ["pnpm", "start"]
