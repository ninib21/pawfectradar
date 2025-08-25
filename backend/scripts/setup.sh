#!/bin/bash

# PawfectSitters Project Setup Script
# This script sets up the entire project environment

set -e

echo "🐾 Setting up PawfectRadar Project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Setup environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        print_success "Created backend/.env from template"
    else
        print_warning "backend/.env already exists"
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_WS_URL=ws://localhost:3001
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
EOF
        print_success "Created frontend/.env"
    else
        print_warning "frontend/.env already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencies installed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Start database services
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run database migrations
    cd backend
    npx prisma migrate dev --name init
    npx prisma generate
    cd ..
    
    print_success "Database setup complete"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    docker-compose build
    print_success "Docker images built"
}

# Start all services
start_services() {
    print_status "Starting all services..."
    docker-compose up -d
    
    print_success "All services started"
    print_status "Services are running on:"
    echo "  - Backend API: http://localhost:3001"
    echo "  - Frontend: http://localhost:19000"
    echo "  - Grafana: http://localhost:3000 (admin/admin)"
    echo "  - Prometheus: http://localhost:9090"
}

# Setup development environment
setup_dev() {
    print_status "Setting up development environment..."
    
    # Install development tools
    npm install -g @nestjs/cli expo-cli
    
    print_success "Development environment setup complete"
}

# Main setup function
main() {
    print_status "Starting PawfectRadar project setup..."
    
    # Check prerequisites
    check_docker
    check_node
    
    # Setup environment
    setup_env_files
    
    # Install dependencies
    install_dependencies
    
    # Setup database
    setup_database
    
    # Build images
    build_images
    
    # Setup development environment
    setup_dev
    
    # Start services
    start_services
    
    print_success "🎉 PawfectSitters project setup complete!"
    print_status "Next steps:"
    echo "  1. Update environment variables in backend/.env and frontend/.env"
    echo "  2. Configure your Stripe, Cloudinary, and other service keys"
    echo "  3. Run 'docker-compose logs -f' to monitor services"
    echo "  4. Visit http://localhost:19000 to access the app"
    echo "  5. Check the README.md files for detailed documentation"
}

# Run main function
main "$@"
