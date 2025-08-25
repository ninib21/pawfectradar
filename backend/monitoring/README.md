# 🔍 PawfectRadar Monitoring & Alerts

Complete monitoring and alerting system for the PawfectRadar platform.

## 🚀 Quick Start

### Start Monitoring Services
```bash
# Start all monitoring services
./monitoring/setup-monitoring.sh

# Or manually
docker-compose up -d prometheus alertmanager grafana node-exporter postgres-exporter redis-exporter
```

### Access Monitoring Tools
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **AlertManager**: http://localhost:9093
- **Node Exporter**: http://localhost:9100/metrics
- **Postgres Exporter**: http://localhost:9187/metrics
- **Redis Exporter**: http://localhost:9121/metrics

## 📊 Monitoring Components

### 1. **Prometheus** - Metrics Collection
- Collects metrics from all services
- Stores time-series data
- Evaluates alerting rules
- Provides query language (PromQL)

### 2. **Grafana** - Visualization & Dashboards
- **Overview Dashboard**: System health, performance metrics
- **Business Metrics**: Revenue, bookings, user growth
- **Infrastructure**: CPU, memory, disk, network
- **Application**: API performance, error rates

### 3. **AlertManager** - Alert Management
- Routes alerts to appropriate channels
- Groups and deduplicates alerts
- Supports multiple notification channels
- Provides alert silencing and inhibition

### 4. **Exporters** - Metrics Collection
- **Node Exporter**: System metrics (CPU, memory, disk)
- **Postgres Exporter**: Database performance metrics
- **Redis Exporter**: Cache performance metrics

## 🚨 Alerting Rules

### Backend Alerts
- **High CPU Usage**: >80% for 5 minutes
- **High Memory Usage**: >85% for 5 minutes
- **High Error Rate**: >5% for 2 minutes
- **Service Down**: Backend unavailable for 1 minute
- **High Response Time**: 95th percentile >2s

### Database Alerts
- **Connection Issues**: >100 active connections
- **Slow Queries**: Average duration >30s
- **Disk Space Low**: <10% remaining

### Business Alerts
- **Payment Processing Issues**: >0.1 errors/sec
- **Booking System Issues**: >0.05 errors/sec
- **User Registration Issues**: >0.1 errors/sec

### Infrastructure Alerts
- **Disk Space Low**: <15% remaining
- **High Load Average**: >5
- **Network Issues**: Packet drops detected

## 📈 Dashboards

### 1. **PawfectRadar Overview**
- Service health status
- Request rate and response times
- Error rates and system resources
- Active bookings and user counts

### 2. **Business Metrics**
- Revenue tracking (30-day view)
- User growth and registration rates
- Booking completion rates
- Customer satisfaction scores
- Top performing sitters

### 3. **Infrastructure**
- System resource utilization
- Database performance metrics
- Redis cache performance
- Network and disk I/O

## 🔧 Configuration

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'pawfectradar-backend'
    static_configs:
      - targets: ['backend:3001']
```

### AlertManager Configuration
```yaml
# monitoring/alertmanager.yml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR_WEBHOOK'

route:
  receiver: 'slack-notifications'
  routes:
    - match:
        severity: critical
      receiver: 'pager-duty-critical'
```

### Grafana Dashboards
- **Overview**: `monitoring/grafana-dashboards/pawfectradar-overview.json`
- **Business**: `monitoring/grafana-dashboards/business-metrics.json`

## 📱 Notification Channels

### Slack Integration
1. Create Slack app and webhook
2. Update `alertmanager.yml` with webhook URL
3. Configure channel: `#pawfectradar-alerts`

### PagerDuty Integration
1. Create PagerDuty service
2. Get integration key
3. Update `alertmanager.yml` with routing key

### Email Notifications
1. Configure SMTP settings in `alertmanager.yml`
2. Set up email templates
3. Test email delivery

## 🛠️ Customization

### Adding Custom Metrics
```typescript
// In your NestJS application
import { Counter, Histogram } from 'prom-client';

const bookingCounter = new Counter({
  name: 'bookings_created_total',
  help: 'Total number of bookings created',
  labelNames: ['status', 'user_type']
});

const responseTimeHistogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status']
});
```

### Creating Custom Alerts
```yaml
# Add to monitoring/alerts.yml
- alert: CustomAlert
  expr: your_metric > threshold
  for: 5m
  labels:
    severity: warning
    service: your-service
  annotations:
    summary: "Custom alert summary"
    description: "Custom alert description"
```

### Adding Custom Dashboards
1. Create dashboard JSON file
2. Place in `monitoring/grafana-dashboards/`
3. Import via Grafana UI or provisioning

## 🔍 Troubleshooting

### Common Issues

#### Prometheus Not Scraping
```bash
# Check targets
curl http://localhost:9090/api/v1/targets

# Check configuration
docker-compose exec prometheus promtool check config /etc/prometheus/prometheus.yml
```

#### Alerts Not Firing
```bash
# Check alert rules
curl http://localhost:9090/api/v1/rules

# Check alertmanager
curl http://localhost:9093/api/v1/status
```

#### Grafana Dashboards Not Loading
```bash
# Check datasources
curl http://localhost:3000/api/datasources

# Check provisioning
docker-compose logs grafana
```

### Debug Commands
```bash
# View all metrics
curl http://localhost:3001/metrics

# Test PromQL query
curl -G http://localhost:9090/api/v1/query --data-urlencode 'query=up'

# Check alert status
curl http://localhost:9093/api/v1/alerts
```

## 📚 Best Practices

### 1. **Alert Design**
- Use meaningful alert names
- Include actionable descriptions
- Set appropriate thresholds
- Group related alerts

### 2. **Dashboard Design**
- Keep dashboards focused
- Use consistent naming
- Include time ranges
- Add documentation

### 3. **Performance**
- Limit metric cardinality
- Use appropriate scrape intervals
- Monitor Prometheus resource usage
- Set up retention policies

### 4. **Security**
- Use authentication for Grafana
- Secure Prometheus endpoints
- Encrypt sensitive configuration
- Regular security updates

## 🚀 Production Deployment

### Environment Variables
```bash
# Required for production
PROMETHEUS_RETENTION_TIME=30d
GRAFANA_ADMIN_PASSWORD=secure_password
ALERTMANAGER_SLACK_WEBHOOK=your_webhook_url
```

### Scaling Considerations
- Use Prometheus federation for multiple instances
- Set up Grafana clustering
- Implement alert deduplication
- Use external storage for Prometheus

### Backup Strategy
- Backup Prometheus data
- Export Grafana dashboards
- Backup AlertManager configuration
- Document custom metrics

---

**Need help?** Check the logs or create an issue in the repository.
