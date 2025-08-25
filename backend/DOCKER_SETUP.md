# 🐳 Docker Setup Guide for PawfectRadar Backend

## 📋 Prerequisites

### Windows Installation
1. **Download Docker Desktop**: Visit [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
2. **System Requirements**:
   - Windows 10/11 Pro, Enterprise, or Education (64-bit)
   - WSL 2 feature enabled
   - Virtualization enabled in BIOS
3. **Installation Steps**:
   ```powershell
   # Download and run Docker Desktop installer
   # Follow the installation wizard
   # Restart your computer when prompted
   ```

### macOS Installation
1. **Download Docker Desktop**: Visit [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
2. **System Requirements**:
   - macOS 10.15 or newer
   - Apple Silicon (M1/M2) or Intel chip
3. **Installation Steps**:
   ```bash
   # Download and run Docker Desktop installer
   # Drag Docker to Applications folder
   # Start Docker Desktop
   ```

### Linux Installation (Ubuntu)
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

## 🔧 Verification

After installation, verify Docker is working:

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Run hello-world container
docker run hello-world
```

## 🚀 Quick Start

### 1. Start Development Environment
```bash
# Navigate to backend directory
cd backend

# Start all services
docker-compose up -d

# Check running containers
docker-compose ps
```

### 2. Database Setup
```bash
# Run database migrations
docker-compose exec backend npm run db:migrate

# Seed database with test data
docker-compose exec backend npm run db:seed

# Or run the production setup
docker-compose exec backend node scripts/setup-production-db.js
```

### 3. Run Tests
```bash
# Run all tests
docker-compose exec backend npm test

# Run tests with coverage
docker-compose exec backend npm run test:cov

# Run integration tests
docker-compose exec backend npm run test:e2e
```

## 📊 Services Overview

The Docker Compose setup includes:

- **PostgreSQL**: Main database
- **Redis**: Caching and sessions
- **Backend**: NestJS API server
- **Monitoring**: Prometheus and Grafana (optional)

## 🔍 Troubleshooting

### Common Issues

1. **Docker not starting**:
   ```bash
   # Windows: Check WSL 2 is enabled
   wsl --set-default-version 2
   
   # macOS: Check virtualization
   sysctl -a | grep machdep.cpu.features | grep VMX
   ```

2. **Port conflicts**:
   ```bash
   # Check what's using port 3001
   netstat -ano | findstr :3001  # Windows
   lsof -i :3001                 # macOS/Linux
   ```

3. **Database connection issues**:
   ```bash
   # Check database logs
   docker-compose logs db
   
   # Restart database
   docker-compose restart db
   ```

4. **Permission issues (Linux)**:
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   
   # Log out and back in, or run:
   newgrp docker
   ```

### Reset Environment
```bash
# Stop all containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build -d
```

## 📝 Environment Variables

Copy the example environment file:
```bash
cp env.example .env
cp env.production.example .env.production
```

Edit the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/pawfectradar"
JWT_SECRET="your-secret-key"
# ... other variables
```

## 🎯 Next Steps

After Docker is installed and working:

1. **Start the development environment**
2. **Set up the database**
3. **Run the tests**
4. **Configure environment variables**
5. **Deploy to production**

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/deployment/docker)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
