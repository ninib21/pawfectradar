# 🔔 Quick Notification Setup Guide

## Slack Setup (2 minutes)

1. **Create Slack App:**
   - Go to https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Name: "PawfectSitters Alerts"
   - Workspace: Select your workspace

2. **Enable Incoming Webhooks:**
   - Go to "Features" → "Incoming Webhooks"
   - Toggle "Activate Incoming Webhooks"
   - Click "Add New Webhook to Workspace"
   - Channel: `#pawfectsitters-alerts`
   - Copy the webhook URL

3. **Update AlertManager:**
   ```bash
   # Edit monitoring/alertmanager.yml
   # Replace YOUR_SLACK_WEBHOOK with your actual webhook URL
   ```

## PagerDuty Setup (2 minutes)

1. **Create PagerDuty Service:**
   - Go to https://app.pagerduty.com/
   - Services → "New Service"
   - Name: "PawfectSitters Production"
   - Escalation Policy: Create or select existing
   - Integration Type: "Prometheus"

2. **Get Integration Key:**
   - Copy the integration key
   - Update `monitoring/alertmanager.yml`

## Email Setup (1 minute)

1. **Configure SMTP:**
   ```yaml
   # In monitoring/alertmanager.yml
   email_configs:
     - to: 'admin@pawfectsitters.com'
       from: 'alerts@pawfectsitters.com'
       smarthost: 'smtp.gmail.com:587'
       auth_username: 'your-email@gmail.com'
       auth_password: 'your-app-password'
   ```

## Test Notifications

```bash
# Test Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test alert from PawfectSitters!"}' \
  YOUR_SLACK_WEBHOOK_URL

# Test PagerDuty
curl -X POST -H 'Content-type: application/json' \
  --data '{"routing_key":"YOUR_PAGERDUTY_KEY","event_action":"trigger","payload":{"summary":"Test alert","severity":"warning"}}' \
  https://events.pagerduty.com/v2/enqueue
```
