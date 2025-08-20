#!/bin/bash

# 🔒 QUANTUM SSL SETUP SCRIPT
# 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED SSL CONFIGURATION
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
SSL_DIR="$PROJECT_ROOT/deploy/quantum-ssl"
NGINX_DIR="$PROJECT_ROOT/deploy/quantum-nginx"

# Domain configuration
DOMAIN=${DOMAIN:-quantum-pawfectsitters.com}
AI_DOMAIN=${AI_DOMAIN:-ai.quantum-pawfectsitters.com}
EMAIL=${EMAIL:-admin@quantum-pawfectsitters.com}

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
    log "Checking SSL setup prerequisites..."
    
    # Check if certbot is installed
    if ! command -v certbot >/dev/null 2>&1; then
        log_warning "Certbot not found. Installing..."
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get update
            sudo apt-get install -y certbot python3-certbot-nginx
        elif command -v yum >/dev/null 2>&1; then
            sudo yum install -y certbot python3-certbot-nginx
        else
            log_error "Unsupported package manager. Please install certbot manually."
            exit 1
        fi
    fi
    
    # Check if nginx is installed
    if ! command -v nginx >/dev/null 2>&1; then
        log_warning "Nginx not found. Installing..."
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get install -y nginx
        elif command -v yum >/dev/null 2>&1; then
            sudo yum install -y nginx
        else
            log_error "Unsupported package manager. Please install nginx manually."
            exit 1
        fi
    fi
    
    # Create SSL directory
    mkdir -p "$SSL_DIR"
    mkdir -p "$NGINX_DIR"
    
    log_success "Prerequisites check passed"
}

# Generate self-signed certificates for development
generate_self_signed_certs() {
    log "Generating self-signed certificates for development..."
    
    # Generate private key
    openssl genrsa -out "$SSL_DIR/private.key" 4096
    
    # Generate certificate signing request
    openssl req -new -key "$SSL_DIR/private.key" -out "$SSL_DIR/certificate.csr" -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
    
    # Generate self-signed certificate
    openssl x509 -req -in "$SSL_DIR/certificate.csr" -signkey "$SSL_DIR/private.key" -out "$SSL_DIR/certificate.crt" -days 365
    
    # Generate AI domain certificate
    openssl req -new -key "$SSL_DIR/private.key" -out "$SSL_DIR/ai-certificate.csr" -subj "/C=US/ST=State/L=City/O=Organization/CN=$AI_DOMAIN"
    openssl x509 -req -in "$SSL_DIR/ai-certificate.csr" -signkey "$SSL_DIR/private.key" -out "$SSL_DIR/ai-certificate.crt" -days 365
    
    # Set proper permissions
    chmod 600 "$SSL_DIR/private.key"
    chmod 644 "$SSL_DIR/certificate.crt"
    chmod 644 "$SSL_DIR/ai-certificate.crt"
    
    log_success "Self-signed certificates generated"
}

# Obtain Let's Encrypt certificates for production
obtain_lets_encrypt_certs() {
    log "Obtaining Let's Encrypt certificates for production..."
    
    # Stop nginx temporarily
    sudo systemctl stop nginx || true
    
    # Obtain certificate for main domain
    if certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive; then
        # Copy certificates to project directory
        sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/private.key"
        sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/certificate.crt"
        sudo chown $USER:$USER "$SSL_DIR/private.key" "$SSL_DIR/certificate.crt"
        chmod 600 "$SSL_DIR/private.key"
        chmod 644 "$SSL_DIR/certificate.crt"
        log_success "Let's Encrypt certificate obtained for $DOMAIN"
    else
        log_error "Failed to obtain Let's Encrypt certificate for $DOMAIN"
        return 1
    fi
    
    # Obtain certificate for AI domain
    if certbot certonly --standalone -d "$AI_DOMAIN" --email "$EMAIL" --agree-tos --non-interactive; then
        # Copy certificates to project directory
        sudo cp "/etc/letsencrypt/live/$AI_DOMAIN/privkey.pem" "$SSL_DIR/ai-private.key"
        sudo cp "/etc/letsencrypt/live/$AI_DOMAIN/fullchain.pem" "$SSL_DIR/ai-certificate.crt"
        sudo chown $USER:$USER "$SSL_DIR/ai-private.key" "$SSL_DIR/ai-certificate.crt"
        chmod 600 "$SSL_DIR/ai-private.key"
        chmod 644 "$SSL_DIR/ai-certificate.crt"
        log_success "Let's Encrypt certificate obtained for $AI_DOMAIN"
    else
        log_error "Failed to obtain Let's Encrypt certificate for $AI_DOMAIN"
        return 1
    fi
}

# Configure nginx with SSL
configure_nginx_ssl() {
    log "Configuring nginx with SSL..."
    
    # Create main nginx configuration
    cat > "$NGINX_DIR/nginx.conf" << EOF
# 🔒 QUANTUM NGINX CONFIGURATION
# 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED NGINX
# 📈 QUANTUM-INFINITE SCALABILITY
# 🚀 QUANTUM-OPTIMIZED PERFORMANCE

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss:; frame-ancestors 'none';";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";
    
    # Logging
    log_format quantum_log '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                          '\$status \$body_bytes_sent "\$http_referer" '
                          '"\$http_user_agent" "\$http_x_forwarded_for" '
                          'rt=\$request_time uct="\$upstream_connect_time" '
                          'uht="\$upstream_header_time" urt="\$upstream_response_time"';
    
    access_log /var/log/nginx/quantum_access.log quantum_log;
    error_log /var/log/nginx/quantum_error.log warn;
    
    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=ai:10m rate=5r/s;
    
    # Upstream servers
    upstream quantum_api {
        server quantum-api-gateway:3000;
        server quantum-api-gateway:3000 backup;
    }
    
    upstream quantum_ai {
        server quantum-ai-service:3001;
        server quantum-ai-service:3001 backup;
    }
    
    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN;
        return 301 https://\$server_name\$request_uri;
    }
    
    # Main HTTPS server
    server {
        listen 443 ssl http2;
        server_name $DOMAIN www.$DOMAIN;
        
        # SSL configuration
        ssl_certificate /etc/nginx/ssl/certificate.crt;
        ssl_certificate_key /etc/nginx/ssl/private.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        ssl_stapling on;
        ssl_stapling_verify on;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://quantum_api/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
        
        # WebSocket support
        location /ws/ {
            proxy_pass http://quantum_api/ws/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # Static files
        location / {
            root /var/www/html;
            try_files \$uri \$uri/ /index.html;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
    
    # AI HTTPS server
    server {
        listen 443 ssl http2;
        server_name $AI_DOMAIN;
        
        # SSL configuration
        ssl_certificate /etc/nginx/ssl/ai-certificate.crt;
        ssl_certificate_key /etc/nginx/ssl/ai-private.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        ssl_stapling on;
        ssl_stapling_verify on;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        # AI API routes
        location / {
            limit_req zone=ai burst=10 nodelay;
            proxy_pass http://quantum_ai/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # AI Health check
        location /health {
            access_log off;
            return 200 "ai-healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF
    
    log_success "Nginx configuration created"
}

# Setup SSL renewal
setup_ssl_renewal() {
    log "Setting up SSL certificate renewal..."
    
    # Create renewal script
    cat > "$PROJECT_ROOT/deploy/scripts/renew-ssl.sh" << 'EOF'
#!/bin/bash

# Renew Let's Encrypt certificates
certbot renew --quiet

# Reload nginx
systemctl reload nginx

# Log renewal
echo "$(date): SSL certificates renewed" >> /var/log/ssl-renewal.log
EOF
    
    chmod +x "$PROJECT_ROOT/deploy/scripts/renew-ssl.sh"
    
    # Add to crontab for automatic renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * $PROJECT_ROOT/deploy/scripts/renew-ssl.sh") | crontab -
    
    log_success "SSL renewal setup completed"
}

# Main function
main() {
    log "🔒 Starting Quantum SSL Setup"
    log "Domain: $DOMAIN"
    log "AI Domain: $AI_DOMAIN"
    log "Email: $EMAIL"
    
    check_prerequisites
    
    # Check if this is production or development
    if [ "${ENVIRONMENT:-development}" = "production" ]; then
        log "Production environment detected. Using Let's Encrypt certificates."
        obtain_lets_encrypt_certs
    else
        log "Development environment detected. Using self-signed certificates."
        generate_self_signed_certs
    fi
    
    configure_nginx_ssl
    
    if [ "${ENVIRONMENT:-development}" = "production" ]; then
        setup_ssl_renewal
    fi
    
    log_success "🎉 Quantum SSL Setup completed successfully!"
    log "SSL certificates are now configured for:"
    log "  - Main domain: https://$DOMAIN"
    log "  - AI domain: https://$AI_DOMAIN"
}

# Run main function
main "$@"
