# 🐾 PawfectSitters - Quantum-Grade Pet Sitting Platform

## 🚀 **Latest Update: Quantum CI/CD Pipeline Active**
- ✅ Environment protection configured
- ✅ Secrets properly set up
- ✅ Production deployment ready
- 🔄 Pipeline testing in progress

A modern, full-stack pet sitting marketplace built with React Native, NestJS, and cutting-edge technologies.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Git

### One-Command Setup
```bash
# Clone the repository
git clone https://github.com/your-org/pawfectradar.git
cd pawfectradar

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Setup
```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Setup environment
cp backend/env.example backend/.env
# Edit backend/.env with your configuration

# 3. Start services
docker-compose up -d

# 4. Run database migrations
cd backend
npx prisma migrate dev
npx prisma generate
cd ..

# 5. Start development servers
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend
cd frontend && npm start
```

## 📁 Project Structure

```
pawfectradar/
├── backend/                 # NestJS API Server
│   ├── src/
│   │   ├── auth/           # Authentication & Authorization
│   │   ├── users/          # User management
│   │   ├── bookings/       # Booking system
│   │   ├── payments/       # Stripe integration
│   │   ├── reviews/        # Rating & review system
│   │   ├── notifications/  # Push notifications
│   │   ├── websocket/      # Real-time communication
│   │   └── files/          # File upload handling
│   ├── prisma/             # Database schema & migrations
│   └── Dockerfile          # Backend container
├── frontend/               # React Native App
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── components/     # Reusable components
│   │   ├── shared/         # Shared utilities
│   │   │   ├── api/        # API client & services
│   │   │   ├── context/    # React Context providers
│   │   │   └── hooks/      # Custom React hooks
│   │   └── navigation/     # Navigation setup
│   └── Dockerfile          # Frontend container
├── nocode/                 # No-code templates
│   ├── airtable-admin-dashboard.json
│   ├── stripe-webhook-flow.json
│   ├── booking-summary-email.html
│   └── bubble-workflow.json
├── deploy/                 # Deployment configurations
│   └── .github/workflows/  # CI/CD pipelines
├── monitoring/             # Monitoring setup
│   └── prometheus.yml
├── nginx/                  # Reverse proxy configuration
├── scripts/                # Setup & utility scripts
├── docker-compose.yml      # Multi-service orchestration
└── README.md              # This file
```

## 🏗️ Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Payments**: Stripe integration
- **File Storage**: Cloudinary
- **Real-time**: WebSocket with Socket.io
- **Email**: SendGrid
- **SMS**: Twilio
- **Caching**: Redis

### Frontend (React Native)
- **Framework**: React Native with Expo
- **State Management**: React Context + Custom Hooks
- **Navigation**: React Navigation
- **UI Components**: Custom design system
- **API Client**: Axios with interceptors
- **Real-time**: Socket.io client
- **File Upload**: Expo ImagePicker + FileSystem

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus + Grafana
- **CI/CD**: GitHub Actions
- **Deployment**: Multi-environment support

## 🔧 Core Features

### For Pet Owners
- ✅ User registration & profile management
- ✅ Pet profile creation & management
- ✅ Browse & search sitters
- ✅ Real-time booking system
- ✅ Secure payment processing
- ✅ Live chat with sitters
- ✅ Session tracking & updates
- ✅ Review & rating system
- ✅ Push notifications

### For Pet Sitters
- ✅ Sitter profile & verification
- ✅ Availability management
- ✅ Booking requests & confirmations
- ✅ Session management
- ✅ Payment processing
- ✅ Real-time communication
- ✅ Review system
- ✅ Earnings tracking

### Admin Features
- ✅ User management
- ✅ Booking oversight
- ✅ Payment monitoring
- ✅ Review moderation
- ✅ Analytics dashboard
- ✅ System monitoring

## 🚀 Deployment

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
See `backend/env.example` for all required environment variables.

## 📊 Monitoring & Analytics

- **Application Metrics**: Custom Prometheus metrics
- **Database Monitoring**: PostgreSQL performance tracking
- **Infrastructure**: System resource monitoring
- **Business Metrics**: Booking analytics, revenue tracking
- **Error Tracking**: Sentry integration

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Data Protection**: Encryption at rest and in transit
- **Input Validation**: Comprehensive sanitization
- **Rate Limiting**: API protection
- **CORS**: Cross-origin resource sharing
- **Security Headers**: Nginx security configuration

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm test
```

## 📱 Mobile App

### Development
```bash
cd frontend
npm start
# Scan QR code with Expo Go app
```

### Building
```bash
# iOS
expo build:ios

# Android
expo build:android
```

## 🔗 API Documentation

- **Swagger UI**: http://localhost:3001/api/docs
- **OpenAPI Spec**: http://localhost:3001/api-json

## 🛠️ Development

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement backend API endpoints
3. Add frontend components & screens
4. Update database schema if needed
5. Write tests
6. Create pull request

### Code Style
- **Backend**: ESLint + Prettier
- **Frontend**: ESLint + Prettier
- **Database**: Prisma schema conventions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the README files in each directory
- **Issues**: Create an issue on GitHub
- **Email**: support@pawfectsitters.com

## 🎯 Roadmap

### Phase 2 Features
- [ ] AI-powered sitter matching
- [ ] Video calling integration
- [ ] Pet health tracking
- [ ] Insurance integration
- [ ] Multi-language support
- [ ] Advanced analytics

### Phase 3 Features
- [ ] Pet grooming services
- [ ] Veterinary integration
- [ ] Pet supplies marketplace
- [ ] Community features
- [ ] Mobile app optimization

---

**Built with ❤️ for the pet sitting community**

For more information, visit [pawfectsitters.com](https://pawfectsitters.com)