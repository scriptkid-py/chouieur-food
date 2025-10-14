# =============================================================================
# DOCKERFILE FOR CHOUIEUR EXPRESS FRONTEND
# =============================================================================
# 
# This Dockerfile creates a production-ready container for the Next.js frontend.
# It uses multi-stage build for optimization and smaller final image size.
# 
# USAGE:
# ======
# Build: docker build -t chouieur-express-frontend .
# Run:   docker run -p 3000:3000 --env-file .env.local chouieur-express-frontend
# 
# ENVIRONMENT VARIABLES:
# =====================
# NEXT_PUBLIC_API_URL: Backend API URL (required)
# NODE_ENV: Environment (production)
#

# =============================================================================
# STAGE 1: BUILD STAGE
# =============================================================================

FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# =============================================================================
# STAGE 2: PRODUCTION STAGE
# =============================================================================

FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set port environment variable
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]
