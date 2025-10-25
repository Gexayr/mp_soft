# Dockerfile for React Frontend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 3000 for Vite dev server
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "start"]
#docker-compose exec frontend npm install redux-thunk@2.4.1 --legacy-peer-deps
