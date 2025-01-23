# Use Node.js 20 image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy .env file
COPY .env .env

# Expose the port your API gateway listens on
EXPOSE 5000

# Command to start the service
CMD ["npm", "run", "start"]
