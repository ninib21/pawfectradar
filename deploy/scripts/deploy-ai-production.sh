#!/bin/bash

# 🧠 QUANTUM AI PRODUCTION DEPLOYMENT SCRIPT
# 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED DEPLOYMENT
# 📈 QUANTUM-INFINITE SCALABILITY
# 🚀 QUANTUM-OPTIMIZED PERFORMANCE

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AI_DIR="$PROJECT_ROOT/ai"
DEPLOY_DIR="$PROJECT_ROOT/deploy"
LOG_FILE="/tmp/ai-deployment-$(date +%Y%m%d-%H%M%S).log"

# Environment variables
ENVIRONMENT=${ENVIRONMENT:-production}
AI_VERSION=${AI_VERSION:-$(date +%Y%m%d-%H%M%S)}
ROLLBACK_VERSION=${ROLLBACK_VERSION:-}

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1" | tee -a "$LOG_FILE"
}

# Error handling
cleanup() {
    log_warning "Deployment failed. Starting rollback..."
    if [ -n "$ROLLBACK_VERSION" ]; then
        rollback_deployment
    else
        log_error "No rollback version available. Manual intervention required."
        exit 1
    fi
}

trap cleanup ERR

# Check prerequisites
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running or not accessible"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose >/dev/null 2>&1; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if required files exist
    if [ ! -f "$DEPLOY_DIR/docker-compose.ai.yml" ]; then
        log_error "AI Docker Compose file not found: $DEPLOY_DIR/docker-compose.ai.yml"
        exit 1
    fi
    
    if [ ! -f "$DEPLOY_DIR/ai.env" ]; then
        log_error "AI environment file not found: $DEPLOY_DIR/ai.env"
        exit 1
    fi
    
    # Check if AI directory exists
    if [ ! -d "$AI_DIR" ]; then
        log_error "AI directory not found: $AI_DIR"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Validate environment configuration
validate_environment() {
    log "Validating environment configuration..."
    
    # Load environment variables
    if [ -f "$DEPLOY_DIR/ai.env" ]; then
        export $(grep -v '^#' "$DEPLOY_DIR/ai.env" | xargs)
    fi
    
    # Check required environment variables
    local required_vars=(
        "OPENAI_API_KEY"
        "QUANTUM_AI_DB_PASSWORD"
        "QUANTUM_AI_REDIS_PASSWORD"
        "AI_API_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required environment variable not set: $var"
            exit 1
        fi
    done
    
    log_success "Environment validation passed"
}

# Backup current deployment
backup_current_deployment() {
    log "Creating backup of current deployment..."
    
    # Create backup directory
    local backup_dir="$DEPLOY_DIR/backups/ai-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup Docker images
    if docker images | grep -q "quantum-ai-service"; then
        docker save quantum-ai-service:latest -o "$backup_dir/quantum-ai-service.tar"
    fi
    
    # Backup volumes
    if docker volume ls | grep -q "ai-models"; then
        docker run --rm -v ai-models:/data -v "$backup_dir:/backup" alpine tar czf /backup/ai-models.tar.gz -C /data .
    fi
    
    # Backup configuration
    cp "$DEPLOY_DIR/docker-compose.ai.yml" "$backup_dir/"
    cp "$DEPLOY_DIR/ai.env" "$backup_dir/"
    
    # Store backup version for rollback
    ROLLBACK_VERSION="$(basename "$backup_dir")"
    echo "$ROLLBACK_VERSION" > "$DEPLOY_DIR/.ai-rollback-version"
    
    log_success "Backup created: $backup_dir"
}

# Build AI services
build_ai_services() {
    log "Building AI services..."
    
    cd "$AI_DIR"
    
    # Build AI service
    log "Building quantum-ai-service..."
    docker build -f Dockerfile.ai -t quantum-ai-service:$AI_VERSION .
    docker tag quantum-ai-service:$AI_VERSION quantum-ai-service:latest
    
    # Build AI worker
    log "Building quantum-ai-worker..."
    docker build -f Dockerfile.ai -t quantum-ai-worker:$AI_VERSION --target worker .
    docker tag quantum-ai-worker:$AI_VERSION quantum-ai-worker:latest
    
    # Build AI trainer
    log "Building quantum-ai-trainer..."
    docker build -f Dockerfile.ai -t quantum-ai-trainer:$AI_VERSION --target trainer .
    docker tag quantum-ai-trainer:$AI_VERSION quantum-ai-trainer:latest
    
    log_success "AI services built successfully"
}

# Deploy AI services
deploy_ai_services() {
    log "Deploying AI services..."
    
    cd "$DEPLOY_DIR"
    
    # Stop existing services
    log "Stopping existing AI services..."
    docker-compose -f docker-compose.ai.yml down --timeout 30 || true
    
    # Start new services
    log "Starting new AI services..."
    docker-compose -f docker-compose.ai.yml up -d --force-recreate
    
    # Wait for services to be ready
    log "Waiting for AI services to be ready..."
    sleep 30
    
    log_success "AI services deployed successfully"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt/$max_attempts"
        
        # Check AI service health
        if curl -f http://localhost:3001/health >/dev/null 2>&1; then
            log_success "AI service health check passed"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "Health check failed after $max_attempts attempts"
            return 1
        fi
        
        log_warning "Health check failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
}

# Performance test
performance_test() {
    log "Running performance tests..."
    
    # Test AI service performance
    local response_time=$(curl -w "%{time_total}" -o /dev/null -s http://localhost:3001/health)
    
    if (( $(echo "$response_time < 2.0" | bc -l) )); then
        log_success "Performance test passed (response time: ${response_time}s)"
    else
        log_warning "Performance test warning (response time: ${response_time}s)"
    fi
}

# Rollback deployment
rollback_deployment() {
    log "Rolling back to version: $ROLLBACK_VERSION"
    
    cd "$DEPLOY_DIR"
    
    # Stop current services
    docker-compose -f docker-compose.ai.yml down --timeout 30 || true
    
    # Restore backup
    local backup_dir="$DEPLOY_DIR/backups/$ROLLBACK_VERSION"
    if [ -d "$backup_dir" ]; then
        # Restore Docker images
        if [ -f "$backup_dir/quantum-ai-service.tar" ]; then
            docker load -i "$backup_dir/quantum-ai-service.tar"
        fi
        
        # Restore volumes
        if [ -f "$backup_dir/ai-models.tar.gz" ]; then
            docker run --rm -v ai-models:/data -v "$backup_dir:/backup" alpine tar xzf /backup/ai-models.tar.gz -C /data
        fi
        
        # Restore configuration
        cp "$backup_dir/docker-compose.ai.yml" .
        cp "$backup_dir/ai.env" .
        
        # Start services
        docker-compose -f docker-compose.ai.yml up -d
        
        log_success "Rollback completed successfully"
    else
        log_error "Backup directory not found: $backup_dir"
        exit 1
    fi
}

# Main deployment function
main() {
    log "🚀 Starting Quantum AI Production Deployment"
    log "Environment: $ENVIRONMENT"
    log "AI Version: $AI_VERSION"
    log "Log file: $LOG_FILE"
    
    # Check if this is a rollback
    if [ -n "${ROLLBACK_VERSION:-}" ]; then
        log "Rollback requested to version: $ROLLBACK_VERSION"
        rollback_deployment
        exit 0
    fi
    
    # Execute deployment steps
    check_prerequisites
    validate_environment
    backup_current_deployment
    build_ai_services
    deploy_ai_services
    health_check
    performance_test
    
    log_success "🎉 Quantum AI Production Deployment completed successfully!"
    log "AI Services are now running on:"
    log "  - AI Service: http://localhost:3001"
    log "  - AI Load Balancer: http://localhost:3002"
    log "  - AI Monitoring: http://localhost:9091"
}

# Run main function
main "$@"
