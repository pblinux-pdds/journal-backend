# Use official Node.js LTS image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Copy the rest of the application code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose the application port (default NestJS port)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]