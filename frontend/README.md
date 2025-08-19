# 🐕 PawfectSitters Frontend - Quantum Security Edition

A military-grade React Native mobile application with quantum security features, real-time updates, and comprehensive state management.

## 🔐 Quantum Security Features

- **Post-Quantum Cryptography**: Military-grade encryption using quantum-resistant algorithms
- **Zero-Knowledge Analytics**: Privacy-preserving analytics with quantum hashing
- **Real-Time Security Monitoring**: Continuous threat detection and response
- **Biometric Authentication**: Quantum-enhanced biometric security
- **Secure File Uploads**: End-to-end encrypted file handling

## 🏗️ Architecture Overview

```
frontend/
├── src/
│   ├── shared/
│   │   ├── api/                 # API services and clients
│   │   │   ├── apiClient.ts     # Quantum API client with Axios
│   │   │   ├── websocketService.ts # Real-time WebSocket service
│   │   │   └── fileUploadService.ts # Secure file upload service
│   │   ├── context/             # React Context providers
│   │   │   ├── AuthContext.tsx  # Authentication state management
│   │   │   └── BookingContext.tsx # Booking state with real-time updates
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── useAPI.ts        # API operation hooks with loading states
│   │   └── index.ts             # Central export file
│   ├── services/                # Business logic services
│   │   └── QuantumAnalyticsService.tsx # Quantum analytics tracking
│   ├── screens/                 # UI screens
│   └── App.tsx                  # Main application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- React Native development environment

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📡 API Integration

### Quantum API Client

The `QuantumAPIClient` provides a comprehensive interface for all backend operations:

```typescript
import { quantumAPI } from './shared/api/apiClient';

// Authentication
const login = await quantumAPI.login(email, password);
const user = await quantumAPI.getCurrentUser();

// Bookings
const bookings = await quantumAPI.getBookings();
const newBooking = await quantumAPI.createBooking(bookingData);

// File uploads
const uploadResult = await quantumAPI.uploadFile(formData, 'image');
```

### Real-Time WebSocket Service

The `QuantumWebSocketService` handles real-time updates:

```typescript
import { quantumWebSocket } from './shared/api/websocketService';

// Connect to WebSocket
await quantumWebSocket.connect();

// Subscribe to booking updates
quantumWebSocket.subscribeToBooking(bookingId);

// Listen for real-time events
quantumWebSocket.on('booking_update', (booking) => {
  console.log('Booking updated:', booking);
});
```

## 🔐 State Management

### Authentication Context

```typescript
import { useAuth } from './shared/context/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();

// Login
await login(email, password);

// Check authentication status
if (isAuthenticated) {
  // User is logged in
}
```

### Booking Context

```typescript
import { useBooking } from './shared/context/BookingContext';

const { 
  bookings, 
  createBooking, 
  updateBooking, 
  cancelBooking 
} = useBooking();

// Create a new booking
const newBooking = await createBooking(bookingData);

// Real-time updates are automatically handled
```

## 🔧 Custom Hooks

### API Hooks

```typescript
import { useLogin, useGetBookings, useCreateBooking } from './shared/hooks/useAPI';

// Login hook with loading state
const { execute: login, isLoading, error } = useLogin();

// Data fetching hook
const { data: bookings, fetch, refresh } = useDataFetch(quantumAPI.getBookings);

// Optimistic updates
const { update, isUpdating } = useOptimisticUpdate(quantumAPI.updateBooking);
```

### Real-Time Data Hook

```typescript
import { useRealTimeData } from './shared/hooks/useAPI';

const { data, updateData } = useRealTimeData([], 'booking_update');
```

## 📁 File Upload System

### Secure File Upload Service

```typescript
import { quantumFileUpload } from './shared/api/fileUploadService';

// Pick and upload image
const result = await quantumFileUpload.pickImage();
if (!result.canceled) {
  const uploadResult = await quantumFileUpload.uploadImage(
    result.assets[0].uri, 
    'avatar'
  );
}

// Upload document
const docResult = await quantumFileUpload.uploadDocument(
  documentUri, 
  'verification'
);
```

## 🔄 Real-Time Features

### WebSocket Integration

The application automatically handles:

- **Real-time booking updates**
- **Live messaging**
- **Session status changes**
- **Payment confirmations**
- **Location tracking**
- **Notification delivery**

### Automatic Reconnection

The WebSocket service includes:

- Automatic reconnection with exponential backoff
- Heartbeat monitoring
- Message queuing during disconnections
- Connection state management

## 📊 Analytics & Monitoring

### Quantum Analytics Service

```typescript
import { useQuantumAnalytics } from './services/QuantumAnalyticsService';

const { trackEvent, trackScreen, trackUserAction } = useQuantumAnalytics();

// Track user actions
trackUserAction('booking_created', 'booking', 'success');

// Track screen views
trackScreen('owner_dashboard');

// Track custom events
trackEvent('payment_completed', 'payment', 'success', 100);
```

## 🔒 Security Features

### Token Management

- Automatic token refresh
- Secure token storage using Expo SecureStore
- Token validation and cleanup
- Automatic logout on token expiration

### Error Handling

- Comprehensive error handling with user-friendly messages
- Automatic retry mechanisms
- Error tracking and analytics
- Graceful degradation

### Data Validation

- Input sanitization
- File type validation
- Size limits enforcement
- Quantum hash verification

## 🌐 Environment Configuration

Create a `.env` file in the frontend directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_WEBSOCKET_URL=ws://localhost:3001/ws
EXPO_PUBLIC_ANALYTICS_ENABLED=true
EXPO_PUBLIC_QUANTUM_SECURITY_LEVEL=military-grade
```

## 📱 Platform Support

- **iOS**: Full support with native optimizations
- **Android**: Full support with Material Design
- **Web**: Progressive Web App capabilities
- **Expo**: Managed workflow support

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 📦 Build & Deployment

```bash
# Build for production
npm run build

# Build for specific platform
npm run build:ios
npm run build:android

# Deploy to Expo
expo publish
```

## 🔧 Development Tools

### Code Quality

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Husky**: Git hooks for quality checks

### Debugging

- **React Native Debugger**: Advanced debugging
- **Flipper**: Performance monitoring
- **Expo DevTools**: Development utilities

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

### Booking Endpoints

- `GET /bookings` - Get user bookings
- `POST /bookings` - Create new booking
- `PUT /bookings/:id` - Update booking
- `PATCH /bookings/:id/cancel` - Cancel booking

### File Upload Endpoints

- `POST /files/upload` - Upload file
- `DELETE /files/:id` - Delete file
- `GET /files/:id` - Get file info

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Backend Repository](../backend)
- [API Documentation](../backend/docs)
- [Deployment Guide](../deploy)
- [Architecture Overview](../architecture)

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**Built with ❤️ and 🔐 Quantum Security**
