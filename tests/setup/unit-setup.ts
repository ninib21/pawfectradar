// 🧪 Unit Test Setup Configuration
// 🔒 QUANTUM TESTING: Enhanced test environment setup

import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.QUANTUM_DATABASE_URL = 'postgresql://test:test@localhost:5432/pawfectsitters_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.QUANTUM_ENCRYPTION_KEY = 'test-encryption-key-32-chars-long';
process.env.STRIPE_SECRET_KEY = 'sk_test_test_key';
process.env.CLOUDINARY_URL = 'cloudinary://test:test@test';
process.env.OPENAI_API_KEY = 'sk-test-openai-key';

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Global test timeout
jest.setTimeout(10000);

// Mock fetch for API tests
global.fetch = jest.fn();

// Mock WebSocket for real-time tests
const WebSocketMock = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
})) as any;
(WebSocketMock as any).CONNECTING = 0;
(WebSocketMock as any).OPEN = 1;
(WebSocketMock as any).CLOSING = 2;
(WebSocketMock as any).CLOSED = 3;
global.WebSocket = WebSocketMock;

// Mock crypto for quantum security tests
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      generateKey: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
    },
  },
});

// Mock localStorage for browser tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock matchMedia for responsive tests (only in browser environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Notification API
const NotificationMock = jest.fn().mockImplementation(() => ({
  requestPermission: jest.fn().mockResolvedValue('granted'),
  permission: 'granted',
})) as any;
(NotificationMock as any).permission = 'granted';
(NotificationMock as any).requestPermission = jest.fn().mockResolvedValue('granted');
global.Notification = NotificationMock;

// Mock navigator.credentials for biometric tests (only in browser environment)
if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'credentials', {
    value: {
      create: jest.fn().mockResolvedValue({ id: 'mock-credential-id' }),
      get: jest.fn().mockResolvedValue({ id: 'mock-credential-id' }),
    },
    writable: true,
  });
}

// Mock geolocation (only in browser environment)
if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: jest.fn().mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
            accuracy: 10,
          },
        });
      }),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    },
    writable: true,
  });
}

// Mock media devices for video calling tests (only in browser environment)
if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: () => [{
          stop: jest.fn(),
          getSettings: () => ({ width: 1280, height: 720 }),
        }],
      }),
      enumerateDevices: jest.fn().mockResolvedValue([
        { deviceId: '1', kind: 'videoinput', label: 'Camera' },
        { deviceId: '2', kind: 'audioinput', label: 'Microphone' },
      ]),
    },
    writable: true,
  });
}

// Mock RTCPeerConnection for WebRTC tests
const RTCPeerConnectionMock = jest.fn().mockImplementation(() => ({
  addTrack: jest.fn(),
  removeTrack: jest.fn(),
  createOffer: jest.fn().mockResolvedValue({ sdp: 'mock-sdp' }),
  createAnswer: jest.fn().mockResolvedValue({ sdp: 'mock-sdp' }),
  setLocalDescription: jest.fn().mockResolvedValue(undefined),
  setRemoteDescription: jest.fn().mockResolvedValue(undefined),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
  getStats: jest.fn().mockResolvedValue(new Map()),
})) as any;
(RTCPeerConnectionMock as any).generateCertificate = jest.fn().mockResolvedValue({} as any);
global.RTCPeerConnection = RTCPeerConnectionMock;

// Mock MediaRecorder for recording tests
const MediaRecorderMock = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  state: 'inactive',
})) as any;
(MediaRecorderMock as any).isTypeSupported = jest.fn().mockReturnValue(true);
global.MediaRecorder = MediaRecorderMock;

// Mock FileReader for file upload tests
const FileReaderMock = jest.fn().mockImplementation(() => ({
  readAsDataURL: jest.fn(),
  readAsText: jest.fn(),
  readAsArrayBuffer: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  result: 'mock-result',
})) as any;
(FileReaderMock as any).EMPTY = 0;
(FileReaderMock as any).LOADING = 1;
(FileReaderMock as any).DONE = 2;
global.FileReader = FileReaderMock;

// Mock FormData
global.FormData = jest.fn().mockImplementation(() => ({
  append: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
  entries: jest.fn(),
  keys: jest.fn(),
  values: jest.fn(),
}));

// Mock URLSearchParams
global.URLSearchParams = jest.fn().mockImplementation(() => ({
  append: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
  toString: jest.fn().mockReturnValue('mock-params'),
}));

// Mock AbortController
global.AbortController = jest.fn().mockImplementation(() => ({
  signal: { aborted: false },
  abort: jest.fn(),
}));

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn().mockReturnValue(1234567890),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn().mockReturnValue([]),
  },
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn().mockImplementation(callback => {
  setTimeout(callback, 16);
  return 1;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = jest.fn();

// Mock setTimeout and setInterval for timer tests
jest.useFakeTimers();

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Reset all mocks after all tests
afterAll(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

console.log('🧪 Unit test setup completed successfully!');
