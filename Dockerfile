# -----------------------------------------------------------------------------
# Stage 1: Build & Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Install OpenSSL & libc6-compat for Prisma binary engines
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy dependency configuration
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (dev included for build & prisma generate)
RUN npm ci

# Generate Prisma Client (from prisma/schema folder)
RUN npx prisma generate

# Copy source files & TypeScript config
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript in /dist
RUN npm run build

# Remove development dependencies to keep final image slim
RUN npm prune --omit=dev

# -----------------------------------------------------------------------------
# Stage 2: Production Runner
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

# Install OpenSSL for Prisma and dumb-init for proper signal handling
RUN apk add --no-cache openssl dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create dedicated non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy production artifacts and generated Prisma client
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/prisma ./prisma
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json

USER appuser

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
