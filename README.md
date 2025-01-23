# Backend Services

A microservices-based backend system consisting of an API Gateway, User Service, and Blog Service.

## Prerequisites

- Node.js (version 16 or higher)
- Docker
- Docker Compose
- MongoDB

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Docker
- Jest for testing

## Services Architecture

- API Gateway (Port: 5000)
- User Service (Port: 5001)
- Blog Service (Port: 5002)

## Local Development Setup

### Using Docker Compose

1. Create `.env` files for each service (see Environment Variables section)

2. Start all services using Docker Compose:

```bash
docker-compose up --build
```

This will start all three services and create a network between them.

### Manual Setup (Without Docker)

1. Install dependencies in each service directory:

```bash
cd api-gateway && npm install
cd ../user-service && npm install
cd ../blog-service && npm install
```

2. Start each service:

```bash
# Terminal 1 - API Gateway
cd api-gateway && npm start

# Terminal 2 - User Service
cd user-service && npm start

# Terminal 3 - Blog Service
cd blog-service && npm start
```

## Environment Variables

Each service requires its own `.env` file:

### API Gateway (.env)

```env
PORT=5000
USER_SERVICE_URL=http://user-service:5001/api/users
BLOG_SERVICE_URL=http://blog-service:5002/api/blogs

```

### User Service (.env)

```env
MONGO_URI=mongodb+srv://ahmadyaqoob89:NXr4srDANgEg1w5g@efc.054mo.mongodb.net/users
JWT_SECRET=b1a7f43b8a2c4d3c4a3e5e5c2e6f12b7458f4b59e1cd6789f1427b4e0f8c6a1a
PORT=5001
```

### Blog Service (.env)

```env
MONGO_URI=mongodb+srv://ahmadyaqoob89:NXr4srDANgEg1w5g@efc.054mo.mongodb.net/blogs
PORT=5002
USER_SERVICE_URL=http://user-service:5001/api/users

```

## Testing

### User Service Tests

```bash
cd user-service
npm test
```

### Blog Service Tests

```bash
cd blog-service
npm test
```

### API Gateway Endpoints (Port 5000)

- Authentication routes
- User routes proxy
- Blog routes proxy

## Docker Compose Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build
```
