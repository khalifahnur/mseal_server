FROM node:18-alpine

# Install Redis
RUN apk add --no-cache redis

# Set working directory
WORKDIR /app/server

# Copy package files first for better Docker caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Copy the rest of the application files
COPY . .

# Important: Copy template files before build if needed
# (But you don't need to separately copy ./src, since you already copied ".")

# Build TypeScript files
RUN npm run build

# Copy template files into the dist folder
RUN mkdir -p dist/service/staff/template dist/service/user/template && \
    cp -r src/service/staff/template/* dist/service/staff/template/

# Expose necessary ports
EXPOSE 3000 3002 9092 2181 6379

# Start Redis server and then Node.js app
CMD redis-server --daemonize yes && node dist/index.js

