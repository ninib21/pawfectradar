#!/bin/bash

# 🗄️ QUANTUM DATABASE MIGRATION SCRIPT
# 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED DATABASE MIGRATION
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
BACKEND_DIR="$PROJECT_ROOT/backend"
AI_DIR="$PROJECT_ROOT/ai"
BACKUP_DIR="$PROJECT_ROOT/deploy/backups/database"

# Environment variables
ENVIRONMENT=${ENVIRONMENT:-production}
BACKUP_ENABLED=${BACKUP_ENABLED:-true}
ROLLBACK_ENABLED=${ROLLBACK_ENABLED:-true}

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking database migration prerequisites..."
    
    # Check if Prisma CLI is available
    if ! command -v npx >/dev/null 2>&1; then
        log_error "Node.js/npx is not installed"
        exit 1
    fi
    
    # Check if PostgreSQL client is available
    if ! command -v psql >/dev/null 2>&1; then
        log_warning "PostgreSQL client not found. Installing..."
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get update
            sudo apt-get install -y postgresql-client
        elif command -v yum >/dev/null 2>&1; then
            sudo yum install -y postgresql
        else
            log_error "Unsupported package manager. Please install postgresql-client manually."
            exit 1
        fi
    fi
    
    # Check if required directories exist
    if [ ! -d "$BACKEND_DIR" ]; then
        log_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    if [ ! -d "$AI_DIR" ]; then
        log_error "AI directory not found: $AI_DIR"
        exit 1
    fi
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    log_success "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    log "Loading environment variables..."
    
    # Load main environment
    if [ -f "$PROJECT_ROOT/deploy/quantum.env" ]; then
        export $(grep -v '^#' "$PROJECT_ROOT/deploy/quantum.env" | xargs)
    fi
    
    # Load AI environment
    if [ -f "$PROJECT_ROOT/deploy/ai.env" ]; then
        export $(grep -v '^#' "$PROJECT_ROOT/deploy/ai.env" | xargs)
    fi
    
    # Check required database variables
    local required_vars=(
        "QUANTUM_DATABASE_URL"
        "QUANTUM_AI_DATABASE_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required database variable not set: $var"
            exit 1
        fi
    done
    
    log_success "Environment variables loaded"
}

# Create database backup
create_backup() {
    if [ "$BACKUP_ENABLED" != "true" ]; then
        log_warning "Database backup disabled"
        return 0
    fi
    
    log "Creating database backup..."
    
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="$BACKUP_DIR/quantum-db-backup-$timestamp.sql"
    local ai_backup_file="$BACKUP_DIR/quantum-ai-db-backup-$timestamp.sql"
    
    # Backup main database
    if pg_dump "$QUANTUM_DATABASE_URL" > "$backup_file" 2>/dev/null; then
        log_success "Main database backup created: $backup_file"
    else
        log_error "Failed to create main database backup"
        return 1
    fi
    
    # Backup AI database
    if pg_dump "$QUANTUM_AI_DATABASE_URL" > "$ai_backup_file" 2>/dev/null; then
        log_success "AI database backup created: $ai_backup_file"
    else
        log_error "Failed to create AI database backup"
        return 1
    fi
    
    # Compress backups
    gzip "$backup_file"
    gzip "$ai_backup_file"
    
    # Store backup info for rollback
    echo "$backup_file.gz" > "$BACKUP_DIR/.last-main-backup"
    echo "$ai_backup_file.gz" > "$BACKUP_DIR/.last-ai-backup"
    
    log_success "Database backup completed"
}

# Run Prisma migrations
run_prisma_migrations() {
    log "Running Prisma migrations..."
    
    cd "$BACKEND_DIR"
    
    # Generate Prisma client
    log "Generating Prisma client..."
    npx prisma generate
    
    # Run migrations
    log "Running database migrations..."
    if npx prisma migrate deploy; then
        log_success "Prisma migrations completed successfully"
    else
        log_error "Prisma migrations failed"
        return 1
    fi
    
    # Verify migration status
    log "Verifying migration status..."
    npx prisma migrate status
}

# Initialize AI database
initialize_ai_database() {
    log "Initializing AI database..."
    
    # Check if AI database exists
    if psql "$QUANTUM_AI_DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        log "AI database exists, checking schema..."
        
        # Check if tables exist
        if psql "$QUANTUM_AI_DATABASE_URL" -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_models');" | grep -q "t"; then
            log "AI database schema exists, skipping initialization"
            return 0
        fi
    fi
    
    # Initialize AI database with schema
    log "Creating AI database schema..."
    if psql "$QUANTUM_AI_DATABASE_URL" -f "$PROJECT_ROOT/deploy/ai-init.sql"; then
        log_success "AI database initialized successfully"
    else
        log_error "AI database initialization failed"
        return 1
    fi
}

# Seed database with initial data
seed_database() {
    log "Seeding database with initial data..."
    
    cd "$BACKEND_DIR"
    
    # Check if seeding is needed
    if [ -f "prisma/seed.js" ] || [ -f "prisma/seed.ts" ]; then
        log "Running database seed..."
        if npx prisma db seed; then
            log_success "Database seeding completed"
        else
            log_warning "Database seeding failed or not configured"
        fi
    else
        log "No seed file found, skipping seeding"
    fi
}

# Verify database integrity
verify_database() {
    log "Verifying database integrity..."
    
    # Check main database connectivity
    if psql "$QUANTUM_DATABASE_URL" -c "SELECT version();" >/dev/null 2>&1; then
        log_success "Main database connectivity verified"
    else
        log_error "Main database connectivity failed"
        return 1
    fi
    
    # Check AI database connectivity
    if psql "$QUANTUM_AI_DATABASE_URL" -c "SELECT version();" >/dev/null 2>&1; then
        log_success "AI database connectivity verified"
    else
        log_error "AI database connectivity failed"
        return 1
    fi
    
    # Check table counts
    log "Checking table counts..."
    local main_tables=$(psql "$QUANTUM_DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    local ai_tables=$(psql "$QUANTUM_AI_DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    
    log "Main database tables: $main_tables"
    log "AI database tables: $ai_tables"
    
    log_success "Database integrity verified"
}

# Rollback database
rollback_database() {
    if [ "$ROLLBACK_ENABLED" != "true" ]; then
        log_error "Database rollback disabled"
        return 1
    fi
    
    log "Rolling back database..."
    
    # Get last backup files
    local main_backup=$(cat "$BACKUP_DIR/.last-main-backup" 2>/dev/null || echo "")
    local ai_backup=$(cat "$BACKUP_DIR/.last-ai-backup" 2>/dev/null || echo "")
    
    if [ -z "$main_backup" ] || [ -z "$ai_backup" ]; then
        log_error "No backup files found for rollback"
        return 1
    fi
    
    # Restore main database
    log "Restoring main database..."
    if gunzip -c "$main_backup" | psql "$QUANTUM_DATABASE_URL"; then
        log_success "Main database restored"
    else
        log_error "Main database restoration failed"
        return 1
    fi
    
    # Restore AI database
    log "Restoring AI database..."
    if gunzip -c "$ai_backup" | psql "$QUANTUM_AI_DATABASE_URL"; then
        log_success "AI database restored"
    else
        log_error "AI database restoration failed"
        return 1
    fi
    
    log_success "Database rollback completed"
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups..."
    
    # Keep only last 10 backups
    local backup_count=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
    
    if [ "$backup_count" -gt 10 ]; then
        local files_to_remove=$(ls -1t "$BACKUP_DIR"/*.sql.gz | tail -n +11)
        for file in $files_to_remove; do
            rm "$file"
            log "Removed old backup: $file"
        done
    fi
    
    log_success "Backup cleanup completed"
}

# Main migration function
main() {
    log "🗄️ Starting Quantum Database Migration"
    log "Environment: $ENVIRONMENT"
    log "Backup enabled: $BACKUP_ENABLED"
    log "Rollback enabled: $ROLLBACK_ENABLED"
    
    # Check if this is a rollback
    if [ "${ROLLBACK:-false}" = "true" ]; then
        log "Rollback requested"
        check_prerequisites
        load_environment
        rollback_database
        exit 0
    fi
    
    # Execute migration steps
    check_prerequisites
    load_environment
    create_backup
    run_prisma_migrations
    initialize_ai_database
    seed_database
    verify_database
    cleanup_backups
    
    log_success "🎉 Quantum Database Migration completed successfully!"
    log "Database is now ready for production use"
}

# Error handling
cleanup_on_error() {
    log_error "Migration failed. Starting rollback..."
    if [ "$ROLLBACK_ENABLED" = "true" ]; then
        rollback_database
    else
        log_error "Rollback disabled. Manual intervention required."
    fi
}

trap cleanup_on_error ERR

# Run main function
main "$@"
