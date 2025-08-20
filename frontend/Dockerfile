# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S expo -u 1001

# Change ownership of the app directory
RUN chown -R expo:nodejs /app
USER expo

# Expose ports for Expo
EXPOSE 19000 19001 19002

# Start Expo development server
CMD ["npx", "expo", "start", "--web"]
