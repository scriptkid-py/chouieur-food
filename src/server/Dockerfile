# =============================================================================
# DOCKERFILE FOR CHOUIEUR EXPRESS BACKEND
# =============================================================================
# 
# This Dockerfile creates a production-ready container for the Express backend.
# It's optimized for local testing and can be used for containerized deployment.
# 
# USAGE:
# ======
# Build: docker build -t chouieur-express-backend .
# Run:   docker run -p 5000:5000 --env-file .env chouieur-express-backend
# 
# ENVIRONMENT VARIABLES:
# =====================
# MONGO_URI: MongoDB connection string (required)
# PORT: Server port (default: 5000)
# NODE_ENV: Environment (development/production)
# CLIENT_URL: Frontend URL for CORS
#

# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
