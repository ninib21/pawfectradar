# 🚀 Quick Setup Guide - Optional Enhancements

## ⚡ **Step 1: Configure Notifications (5 minutes)**

### Slack Setup
```bash
# 1. Create Slack App
# Go to: https://api.slack.com/apps
# Create New App → From scratch
# Name: "PawfectSitters Alerts"

# 2. Enable Webhooks
# Features → Incoming Webhooks → Activate
# Add to workspace → Channel: #pawfectsitters-alerts

# 3. Update AlertManager
nano monitoring/alertmanager.yml
# Replace: YOUR_SLACK_WEBHOOK with your actual webhook URL
```

### PagerDuty Setup
```bash
# 1. Create PagerDuty Service
# Go to: https://app.pagerduty.com/
# Services → New Service → Prometheus Integration

# 2. Update AlertManager
nano monitoring/alertmanager.yml
# Replace: YOUR_PAGERDUTY_KEY with your integration key
```

### Test Notifications
```bash
# Test Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🚨 Test alert from PawfectSitters!"}' \
  YOUR_SLACK_WEBHOOK_URL

# Test PagerDuty
curl -X POST -H 'Content-type: application/json' \
  --data '{"routing_key":"YOUR_KEY","event_action":"trigger","payload":{"summary":"Test alert","severity":"warning"}}' \
  https://events.pagerduty.com/v2/enqueue
```

---

## 📊 **Step 2: Customize Dashboards (10 minutes)**

### Import Team Dashboard
1. **Open Grafana**: http://localhost:3000 (admin/admin)
2. **Import Dashboard**:
   - Click "+" → "Import"
   - Upload: `monitoring/grafana-dashboards/team-dashboard.json`
   - Select Prometheus as data source
   - Click "Import"

### Create Custom Panels
```javascript
// Example: Custom Revenue Panel
{
  "title": "Revenue by Region",
  "type": "piechart",
  "targets": [
    {
      "expr": "sum(revenue_total) by (region)",
      "legendFormat": "{{region}}"
    }
  ]
}

// Example: User Engagement Panel
{
  "title": "User Activity",
  "type": "graph",
  "targets": [
    {
      "expr": "rate(user_login_total[5m])",
      "legendFormat": "Logins/sec"
    },
    {
      "expr": "rate(user_registration_total[5m])",
      "legendFormat": "Registrations/sec"
    }
  ]
}
```

### Set Up Team Views
```bash
# Create role-based dashboards
mkdir -p monitoring/grafana-dashboards/roles

# Operations Team Dashboard
cp monitoring/grafana-dashboards/team-dashboard.json \
   monitoring/grafana-dashboards/roles/operations-dashboard.json

# Finance Team Dashboard
cp monitoring/grafana-dashboards/business-metrics.json \
   monitoring/grafana-dashboards/roles/finance-dashboard.json

# Support Team Dashboard
cp monitoring/grafana-dashboards/team-dashboard.json \
   monitoring/grafana-dashboards/roles/support-dashboard.json
```

---

## 📈 **Step 3: Set Up Business Metrics (15 minutes)**

### 1. Install Prometheus Client (2 minutes)
```bash
cd backend
npm install prom-client
```

### 2. Integrate Business Metrics (5 minutes)
```typescript
// In your booking service
import { BusinessMetricsService } from '../metrics/business-metrics.service';

@Injectable()
export class BookingsService {
  constructor(private businessMetrics: BusinessMetricsService) {}

  async createBooking(bookingData: any) {
    const startTime = Date.now();
    
    // Create booking logic...
    const booking = await this.bookingRepository.create(bookingData);
    
    // Record metrics
    const duration = (Date.now() - startTime) / 1000;
    this.businessMetrics.recordBookingCreation(
      booking.status,
      booking.type,
      booking.durationCategory,
      duration
    );
    
    return booking;
  }
}
```

### 3. Add Revenue Tracking (3 minutes)
```typescript
// In your payment service
async processPayment(paymentData: any) {
  const startTime = Date.now();
  
  // Process payment...
  const payment = await this.paymentRepository.create(paymentData);
  
  // Record revenue metrics
  this.businessMetrics.recordRevenue(
    payment.amount,
    payment.method,
    payment.bookingType,
    payment.region
  );
  
  // Record payment processing metrics
  const duration = (Date.now() - startTime) / 1000;
  this.businessMetrics.recordPaymentProcessing(
    payment.method,
    payment.status,
    this.getAmountRange(payment.amount),
    duration
  );
  
  return payment;
}
```

### 4. Track User Engagement (3 minutes)
```typescript
// In your auth service
async login(credentials: any) {
  // Login logic...
  const user = await this.userRepository.findByEmail(credentials.email);
  
  // Record login metrics
  this.businessMetrics.recordUserLogin(
    user.role,
    credentials.loginMethod || 'email'
  );
  
  return user;
}

async register(userData: any) {
  // Registration logic...
  const user = await this.userRepository.create(userData);
  
  // Record registration metrics
  this.businessMetrics.recordUserRegistration(
    user.role,
    userData.source || 'direct',
    user.verificationStatus
  );
  
  return user;
}
```

### 5. Monitor Customer Satisfaction (2 minutes)
```typescript
// In your review service
async submitReview(reviewData: any) {
  // Submit review logic...
  const review = await this.reviewRepository.create(reviewData);
  
  // Record review metrics
  this.businessMetrics.recordReviewRating(
    review.bookingType,
    review.sitterExperience,
    review.rating
  );
  
  this.businessMetrics.recordReviewSubmission(
    this.getRatingCategory(review.rating),
    review.bookingType
  );
  
  return review;
}
```

---

## 🎯 **Quick Test Commands**

### Test Business Metrics
```bash
# Check if metrics are being collected
curl http://localhost:3001/metrics | grep -E "(revenue_total|booking_created_total|user_registration_total)"

# Test specific metrics
curl -G http://localhost:9090/api/v1/query --data-urlencode 'query=revenue_total'

# Check dashboard data
curl -G http://localhost:9090/api/v1/query --data-urlencode 'query=rate(booking_created_total[5m])'
```

### Test Alerts
```bash
# Trigger a test alert
curl -X POST http://localhost:9093/api/v1/alerts \
  -H 'Content-Type: application/json' \
  -d '[
    {
      "labels": {
        "alertname": "TestAlert",
        "severity": "warning"
      },
      "annotations": {
        "summary": "Test alert",
        "description": "This is a test alert"
      }
    }
  ]'
```

---

## ✅ **Verification Checklist**

### Notifications
- [ ] Slack webhook configured and tested
- [ ] PagerDuty integration working
- [ ] Email notifications configured
- [ ] Alert routing rules set up

### Dashboards
- [ ] Team dashboard imported
- [ ] Custom panels created
- [ ] Role-based views configured
- [ ] Data sources connected

### Business Metrics
- [ ] Prometheus client installed
- [ ] Business metrics service integrated
- [ ] Revenue tracking implemented
- [ ] User engagement metrics active
- [ ] Customer satisfaction tracking working

### Monitoring
- [ ] All services showing in Grafana
- [ ] Alerts firing correctly
- [ ] Metrics being collected
- [ ] Dashboards updating in real-time

---

## 🚀 **Next Steps After Setup**

1. **Customize Alert Thresholds**: Adjust alert rules based on your business needs
2. **Create Custom Dashboards**: Build dashboards for specific use cases
3. **Set Up Automated Reports**: Configure scheduled reports via Grafana
4. **Implement SLOs**: Define Service Level Objectives and track them
5. **Scale Monitoring**: Add more metrics as your business grows

**🎉 You now have enterprise-grade monitoring for your PawfectSitters platform!**
