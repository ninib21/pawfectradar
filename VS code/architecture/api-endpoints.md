# 🔌 PawfectRadar - API Endpoints Documentation

## 📋 Overview
Complete API documentation for the PawfectRadar backend, including authentication, user management, bookings, messaging, and payments.

---

## 🔐 Authentication Endpoints

### **POST /api/auth/register**
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "userType": "owner",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "userType": "owner",
      "verificationStatus": "pending"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### **POST /api/auth/login**
Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "userType": "owner"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### **POST /api/auth/google**
Authenticate with Google OAuth.

**Request Body:**
```json
{
  "idToken": "google_id_token"
}
```

### **POST /api/auth/refresh**
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### **POST /api/auth/logout**
Logout user and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

---

## 👤 User Management Endpoints

### **GET /api/users/me**
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "userType": "owner",
    "profilePhotoUrl": "https://cloudinary.com/...",
    "bio": "Pet lover and owner",
    "location": "San Francisco, CA",
    "verificationStatus": "verified",
    "backgroundCheckStatus": "passed",
    "createdAt": "2025-01-19T01:23:00Z",
    "updatedAt": "2025-01-19T01:23:00Z"
  }
}
```

### **PUT /api/users/me**
Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "phone": "+1234567890",
  "bio": "Updated bio",
  "location": "New York, NY"
}
```

### **POST /api/users/me/photo**
Upload profile photo.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`

**Response:**
```json
{
  "success": true,
  "data": {
    "profilePhotoUrl": "https://cloudinary.com/..."
  }
}
```

### **POST /api/users/me/verify**
Submit verification documents.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`

**Response:**
```json
{
  "success": true,
  "data": {
    "verificationStatus": "pending",
    "message": "Documents submitted for review"
  }
}
```

---

## 🐕 Pet Management Endpoints

### **GET /api/pets**
Get user's pets.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Buddy",
      "species": "dog",
      "breed": "Golden Retriever",
      "age": 3,
      "weight": 65.5,
      "photoUrl": "https://cloudinary.com/...",
      "specialNeeds": "Allergic to chicken",
      "temperament": "friendly",
      "createdAt": "2025-01-19T01:23:00Z"
    }
  ]
}
```

### **POST /api/pets**
Create a new pet profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Buddy",
  "species": "dog",
  "breed": "Golden Retriever",
  "age": 3,
  "weight": 65.5,
  "specialNeeds": "Allergic to chicken",
  "temperament": "friendly"
}
```

### **GET /api/pets/:id**
Get specific pet details.

**Headers:** `Authorization: Bearer <token>`

### **PUT /api/pets/:id**
Update pet profile.

**Headers:** `Authorization: Bearer <token>`

### **DELETE /api/pets/:id**
Delete pet profile.

**Headers:** `Authorization: Bearer <token>`

### **POST /api/pets/:id/photo**
Upload pet photo.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`

---

## 🏠 Sitter Management Endpoints

### **GET /api/sitters**
Search and filter sitters.

**Query Parameters:**
- `location` - City/area
- `maxDistance` - Maximum distance in miles
- `minRate` - Minimum hourly rate
- `maxRate` - Maximum hourly rate
- `minRating` - Minimum rating
- `availableDate` - Available date (YYYY-MM-DD)
- `services` - Comma-separated services
- `verified` - Boolean for verified sitters only

**Response:**
```json
{
  "success": true,
  "data": {
    "sitters": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "fullName": "Sarah Johnson",
          "profilePhotoUrl": "https://cloudinary.com/...",
          "location": "San Francisco, CA",
          "verificationStatus": "verified"
        },
        "hourlyRate": 25.00,
        "servicesOffered": ["dog_walking", "pet_sitting"],
        "experienceYears": 5,
        "rating": 4.9,
        "totalBookings": 47,
        "responseRate": 98.5,
        "availableDate": "2025-01-20"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### **GET /api/sitters/:id**
Get detailed sitter profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "fullName": "Sarah Johnson",
      "profilePhotoUrl": "https://cloudinary.com/...",
      "bio": "Experienced pet sitter with 5 years of caring for dogs...",
      "location": "San Francisco, CA",
      "verificationStatus": "verified",
      "backgroundCheckStatus": "passed"
    },
    "hourlyRate": 25.00,
    "servicesOffered": ["dog_walking", "pet_sitting", "daycare"],
    "experienceYears": 5,
    "certifications": [
      {
        "name": "CPR Certification",
        "url": "https://cloudinary.com/..."
      }
    ],
    "availabilitySchedule": {
      "monday": ["09:00-17:00"],
      "tuesday": ["09:00-17:00"],
      "wednesday": ["09:00-17:00"],
      "thursday": ["09:00-17:00"],
      "friday": ["09:00-17:00"],
      "saturday": ["10:00-16:00"],
      "sunday": ["10:00-16:00"]
    },
    "rating": 4.9,
    "totalBookings": 47,
    "responseRate": 98.5,
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Sarah was amazing with my dog!",
        "reviewer": {
          "fullName": "Mike R.",
          "profilePhotoUrl": "https://cloudinary.com/..."
        },
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ]
  }
}
```

### **POST /api/sitters/profile**
Create or update sitter profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "hourlyRate": 25.00,
  "servicesOffered": ["dog_walking", "pet_sitting", "daycare"],
  "experienceYears": 5,
  "availabilitySchedule": {
    "monday": ["09:00-17:00"],
    "tuesday": ["09:00-17:00"],
    "wednesday": ["09:00-17:00"],
    "thursday": ["09:00-17:00"],
    "friday": ["09:00-17:00"],
    "saturday": ["10:00-16:00"],
    "sunday": ["10:00-16:00"]
  }
}
```

---

## 📅 Booking Management Endpoints

### **GET /api/bookings**
Get user's bookings (as owner or sitter).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - Booking status filter
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "owner": {
          "id": "uuid",
          "fullName": "John Doe",
          "profilePhotoUrl": "https://cloudinary.com/..."
        },
        "sitter": {
          "id": "uuid",
          "fullName": "Sarah Johnson",
          "profilePhotoUrl": "https://cloudinary.com/..."
        },
        "pet": {
          "id": "uuid",
          "name": "Buddy",
          "photoUrl": "https://cloudinary.com/..."
        },
        "startDate": "2025-01-20T10:00:00Z",
        "endDate": "2025-01-20T12:00:00Z",
        "status": "confirmed",
        "totalAmount": 50.00,
        "specialInstructions": "Buddy loves to play fetch",
        "createdAt": "2025-01-19T01:23:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

### **POST /api/bookings**
Create a new booking request.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "sitterId": "uuid",
  "petId": "uuid",
  "startDate": "2025-01-20T10:00:00Z",
  "endDate": "2025-01-20T12:00:00Z",
  "specialInstructions": "Buddy loves to play fetch"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "status": "pending",
      "totalAmount": 50.00,
      "commissionAmount": 7.50
    },
    "paymentIntent": {
      "clientSecret": "pi_xxx_secret_xxx"
    }
  }
}
```

### **GET /api/bookings/:id**
Get detailed booking information.

**Headers:** `Authorization: Bearer <token>`

### **PUT /api/bookings/:id/status**
Update booking status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "confirmed"
}
```

### **POST /api/bookings/:id/cancel**
Cancel a booking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Emergency came up"
}
```

---

## 💬 Messaging Endpoints

### **GET /api/messages**
Get conversation messages.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `bookingId` - Filter by booking
- `userId` - Filter by user
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "sender": {
          "id": "uuid",
          "fullName": "John Doe",
          "profilePhotoUrl": "https://cloudinary.com/..."
        },
        "content": "Hi Sarah, can you confirm our booking for tomorrow?",
        "messageType": "text",
        "isRead": true,
        "createdAt": "2025-01-19T01:23:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "totalPages": 1
    }
  }
}
```

### **POST /api/messages**
Send a new message.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "receiverId": "uuid",
  "bookingId": "uuid",
  "content": "Hi Sarah, can you confirm our booking for tomorrow?",
  "messageType": "text"
}
```

### **POST /api/messages/:id/read**
Mark message as read.

**Headers:** `Authorization: Bearer <token>`

---

## ⭐ Review Endpoints

### **GET /api/reviews**
Get reviews for a user or booking.

**Query Parameters:**
- `userId` - User ID to get reviews for
- `bookingId` - Booking ID to get review for
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Sarah was amazing with my dog! Very professional and caring.",
        "reviewer": {
          "id": "uuid",
          "fullName": "Mike R.",
          "profilePhotoUrl": "https://cloudinary.com/..."
        },
        "booking": {
          "id": "uuid",
          "startDate": "2025-01-15T10:00:00Z",
          "endDate": "2025-01-15T12:00:00Z"
        },
        "createdAt": "2025-01-16T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### **POST /api/reviews**
Create a new review.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bookingId": "uuid",
  "rating": 5,
  "comment": "Sarah was amazing with my dog! Very professional and caring."
}
```

---

## 💳 Payment Endpoints

### **POST /api/payments/create-intent**
Create payment intent for booking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bookingId": "uuid",
  "amount": 50.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx"
  }
}
```

### **POST /api/payments/confirm**
Confirm payment after successful processing.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "bookingId": "uuid"
}
```

### **POST /api/payments/refund**
Request refund for booking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bookingId": "uuid",
  "reason": "Service not as expected"
}
```

---

## 📤 File Upload Endpoints

### **POST /api/upload/image**
Upload image file.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`

**Form Data:**
- `file` - Image file
- `type` - "profile", "pet", "session"

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/...",
    "publicId": "pawfectradar/xxx"
  }
}
```

### **POST /api/upload/document**
Upload document file.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`

**Form Data:**
- `file` - Document file
- `type` - "verification", "certification"

---

## 📱 Notification Endpoints

### **GET /api/notifications**
Get user notifications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `unreadOnly` - Boolean for unread only

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "booking_confirmed",
        "title": "Booking Confirmed",
        "message": "Your booking with Sarah Johnson has been confirmed",
        "data": {
          "bookingId": "uuid"
        },
        "isRead": false,
        "createdAt": "2025-01-19T01:23:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

### **POST /api/notifications/:id/read**
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

### **POST /api/notifications/read-all**
Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

---

## 📊 Session Tracking Endpoints

### **POST /api/session-logs**
Create session log entry.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bookingId": "uuid",
  "logType": "start",
  "locationLat": 37.7749,
  "locationLng": -122.4194,
  "notes": "Starting the walk with Buddy"
}
```

### **GET /api/session-logs/:bookingId**
Get session logs for a booking.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "logType": "start",
      "locationLat": 37.7749,
      "locationLng": -122.4194,
      "photos": ["https://cloudinary.com/..."],
      "notes": "Starting the walk with Buddy",
      "createdAt": "2025-01-20T10:00:00Z"
    },
    {
      "id": "uuid",
      "logType": "checkpoint",
      "locationLat": 37.7750,
      "locationLng": -122.4195,
      "photos": ["https://cloudinary.com/..."],
      "notes": "Buddy is having a great time at the park",
      "createdAt": "2025-01-20T10:30:00Z"
    }
  ]
}
```

---

## 🔌 WebSocket Events

### **Connection Events**
```typescript
// Connect to WebSocket
socket.emit('user:connect', { userId: 'uuid' });

// Disconnect
socket.emit('user:disconnect', { userId: 'uuid' });
```

### **Messaging Events**
```typescript
// Send message
socket.emit('message:send', {
  receiverId: 'uuid',
  bookingId: 'uuid',
  content: 'Hello!',
  messageType: 'text'
});

// Receive message
socket.on('message:received', (message) => {
  console.log('New message:', message);
});

// Typing indicator
socket.emit('message:typing', {
  receiverId: 'uuid',
  isTyping: true
});

socket.on('message:typing', (data) => {
  console.log('User typing:', data);
});
```

### **Booking Events**
```typescript
// Booking status update
socket.on('booking:status_update', (booking) => {
  console.log('Booking updated:', booking);
});

// New booking request
socket.on('booking:new_request', (booking) => {
  console.log('New booking request:', booking);
});
```

### **Session Events**
```typescript
// Session start
socket.emit('session:start', {
  bookingId: 'uuid',
  location: { lat: 37.7749, lng: -122.4194 }
});

// Session update
socket.emit('session:update', {
  bookingId: 'uuid',
  location: { lat: 37.7750, lng: -122.4195 },
  photos: ['https://cloudinary.com/...']
});

// Session end
socket.emit('session:end', {
  bookingId: 'uuid',
  location: { lat: 37.7749, lng: -122.4194 }
});
```

### **Notification Events**
```typescript
// New notification
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
});
```

---

## 🚨 Error Responses

### **Standard Error Format**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "email": ["Email must be a valid email address"]
    }
  }
}
```

### **Common Error Codes**
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `CONFLICT` - Resource conflict
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

---

## 📈 Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **API endpoints**: 100 requests per minute per user
- **File uploads**: 10 requests per minute per user
- **WebSocket connections**: 5 connections per user

---

**🔌 API Documentation Status: COMPLETE**
**📅 Generated:** 2025-01-19 01:24:00 UTC
**🤖 Generated by:** SoftwareArchitectBot
