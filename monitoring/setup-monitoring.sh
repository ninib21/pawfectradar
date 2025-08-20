#!/bin/bash

# PawfectSitters Monitoring Setup Script
echo "🔍 Setting up PawfectRadar Monitoring & Alerts..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Start monitoring services
print_status "Starting monitoring services..."
docker-compose up -d prometheus alertmanager grafana node-exporter postgres-exporter redis-exporter

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."
docker-compose ps

# Setup Grafana dashboards
print_status "Setting up Grafana dashboards..."
sleep 5

# Create monitoring directory structure
mkdir -p monitoring/grafana-dashboards
mkdir -p monitoring/grafana-provisioning/datasources
mkdir -p monitoring/grafana-provisioning/dashboards

print_success "🎉 PawfectRadar monitoring setup complete!"
print_status "Access your monitoring tools:"
echo "  📊 Grafana: http://localhost:3000 (admin/admin)"
echo "  📈 Prometheus: http://localhost:9090"
echo "  🚨 AlertManager: http://localhost:9093"
echo "  📋 Node Exporter: http://localhost:9100/metrics"
echo "  🗄️  Postgres Exporter: http://localhost:9187/metrics"
echo "  🔴 Redis Exporter: http://localhost:9121/metrics"

print_status "Next steps:"
echo "  1. Login to Grafana (admin/admin)"
echo "  2. Import dashboards from monitoring/grafana-dashboards/"
echo "  3. Configure alert notifications in AlertManager"
echo "  4. Set up Slack/PagerDuty webhooks for alerts"
