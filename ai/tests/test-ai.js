const { PawfectAI } = require('../index');
const { TrustScoreModel } = require('../models/TrustScoreModel');
const { MatchmakingEngine } = require('../models/MatchmakingEngine');
const { SentimentAnalyzer } = require('../models/SentimentAnalyzer');
const { SmartBookingService } = require('../services/SmartBookingService');

// Mock data for testing
const mockSitterData = {
  id: 'sitter_001',
  name: 'John Doe',
  experienceYears: 3,
  totalBookings: 25,
  avgRating: 4.8,
  completionRate: 95,
  responseTime: 2,
  verificationStatus: true,
  backgroundCheck: true,
  insurance: true,
  certifications: ['Pet First Aid', 'Dog Training'],
  reviews: [
    { text: 'Excellent service! Very caring and professional.', rating: 5 },
    { text: 'Great experience, highly recommend!', rating: 5 },
    { text: 'Very reliable and trustworthy.', rating: 4 }
  ],
  bookings: [
    { startTime: '2024-01-15T09:00:00Z', endTime: '2024-01-15T17:00:00Z', status: 'completed' },
    { startTime: '2024-01-17T10:00:00Z', endTime: '2024-01-17T18:00:00Z', status: 'completed' }
  ],
  cancellationRate: 0.05,
  onTimeRate: 0.98,
  communicationScore: 4.9
};

const mockPetProfile = {
  id: 'pet_001',
  name: 'Buddy',
  breed: 'Golden Retriever',
  size: 'large',
  age: 3,
  energyLevel: 'high',
  temperament: ['friendly', 'playful', 'gentle'],
  specialNeeds: [],
  medicalConditions: [],
  trainingLevel: 'intermediate',
  socialization: 'excellent',
  separationAnxiety: false,
  aggression: false,
  houseTrained: true,
  microchipped: true,
  spayedNeutered: true,
  vaccinations: ['rabies', 'distemper', 'bordetella']
};

const mockOwnerPreferences = {
  budget: 'standard',
  location: 'downtown',
  schedule: 'flexible',
  duration: 8,
  preferredTime: 'morning',
  additionalRequirements: 'Must be good with children'
};

const mockAvailableSitters = [
  {
    id: 'sitter_001',
    name: 'John Doe',
    experience: ['dogs', 'cats', 'senior pets'],
    specializations: ['large dogs', 'high energy pets'],
    certifications: ['Pet First Aid', 'Dog Training'],
    ratings: { average: 4.8, count: 25 },
    insurance: true,
    emergencyTraining: true
  },
  {
    id: 'sitter_002',
    name: 'Jane Smith',
    experience: ['dogs', 'puppies'],
    specializations: ['puppy care', 'training'],
    certifications: ['Puppy Training'],
    ratings: { average: 4.6, count: 18 },
    insurance: true,
    emergencyTraining: false
  }
];

const mockReviews = [
  'Excellent service! Very caring and professional.',
  'Great experience, highly recommend!',
  'Very reliable and trustworthy.',
  'Good service but could be more punctual.',
  'Amazing care for my pet, will definitely book again!'
];

describe('Pawfect AI Tests', () => {
  let pawfectAI;

  beforeAll(async () => {
    // Set up test environment
    process.env.OPENAI_API_KEY = 'test_key';
    process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
    
    pawfectAI = new PawfectAI();
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Cleanup
    if (pawfectAI) {
      // Cleanup any resources
    }
  });

  describe('Trust Score Model', () => {
    test('should calculate trust score for sitter', async () => {
      const trustScore = await pawfectAI.calculateTrustScore('sitter_001', mockSitterData);
      
      expect(trustScore).toBeDefined();
      expect(trustScore.score).toBeGreaterThanOrEqual(0);
      expect(trustScore.score).toBeLessThanOrEqual(1);
      expect(trustScore.confidence).toBeGreaterThanOrEqual(0);
      expect(trustScore.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(trustScore.factors)).toBe(true);
      expect(trustScore.lastUpdated).toBeDefined();
    });

    test('should handle missing sitter data gracefully', async () => {
      const trustScore = await pawfectAI.calculateTrustScore('sitter_002', {});
      
      expect(trustScore).toBeDefined();
      expect(trustScore.score).toBeGreaterThanOrEqual(0);
      expect(trustScore.score).toBeLessThanOrEqual(1);
    });
  });

  describe('Matchmaking Engine', () => {
    test('should get recommendations for pet', async () => {
      const recommendations = await pawfectAI.getRecommendations(
        mockPetProfile,
        mockOwnerPreferences,
        mockAvailableSitters,
        5
      );
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeLessThanOrEqual(5);
      
      if (recommendations.length > 0) {
        const firstRec = recommendations[0];
        expect(firstRec.sitter).toBeDefined();
        expect(firstRec.matchScore).toBeGreaterThanOrEqual(0);
        expect(firstRec.matchScore).toBeLessThanOrEqual(1);
        expect(firstRec.confidence).toBeDefined();
        expect(Array.isArray(firstRec.reasons)).toBe(true);
      }
    });

    test('should handle empty sitter list', async () => {
      const recommendations = await pawfectAI.getRecommendations(
        mockPetProfile,
        mockOwnerPreferences,
        [],
        5
      );
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBe(0);
    });
  });

  describe('Sentiment Analyzer', () => {
    test('should analyze single review', async () => {
      const analysis = await pawfectAI.analyzeReview(mockReviews[0]);
      
      expect(analysis).toBeDefined();
      expect(analysis.text).toBe(mockReviews[0]);
      expect(['positive', 'negative', 'neutral']).toContain(analysis.sentiment);
      expect(analysis.score).toBeGreaterThanOrEqual(0);
      expect(analysis.score).toBeLessThanOrEqual(1);
      expect(analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
      expect(analysis.themes).toBeDefined();
      expect(analysis.emotions).toBeDefined();
      expect(Array.isArray(analysis.keywords)).toBe(true);
      expect(Array.isArray(analysis.insights)).toBe(true);
    });

    test('should analyze batch reviews', async () => {
      const analysis = await pawfectAI.analyzeBatchReviews(mockReviews);
      
      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis.reviews)).toBe(true);
      expect(analysis.reviews.length).toBe(mockReviews.length);
      expect(analysis.aggregate).toBeDefined();
      expect(analysis.totalReviews).toBe(mockReviews.length);
      expect(analysis.timestamp).toBeDefined();
      
      // Check aggregate stats
      expect(analysis.aggregate.averageSentiment).toBeGreaterThanOrEqual(0);
      expect(analysis.aggregate.averageSentiment).toBeLessThanOrEqual(1);
      expect(analysis.aggregate.sentimentDistribution).toBeDefined();
      expect(analysis.aggregate.commonThemes).toBeDefined();
      expect(analysis.aggregate.commonEmotions).toBeDefined();
    });

    test('should handle empty review', async () => {
      const analysis = await pawfectAI.analyzeReview('');
      
      expect(analysis).toBeDefined();
      expect(analysis.sentiment).toBe('neutral');
      expect(analysis.score).toBe(0.5);
    });
  });

  describe('Smart Booking Service', () => {
    test('should get time suggestions', async () => {
      const suggestions = await pawfectAI.getTimeSuggestions(
        'pet_001',
        'sitter_001',
        mockOwnerPreferences,
        7
      );
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions.suggestions)).toBe(true);
      expect(suggestions.confidence).toBeGreaterThanOrEqual(0);
      expect(suggestions.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(suggestions.factors)).toBe(true);
      expect(suggestions.timestamp).toBeDefined();
      
      if (suggestions.suggestions.length > 0) {
        const firstSuggestion = suggestions.suggestions[0];
        expect(firstSuggestion.date).toBeDefined();
        expect(firstSuggestion.startTime).toBeDefined();
        expect(firstSuggestion.endTime).toBeDefined();
        expect(firstSuggestion.duration).toBeGreaterThan(0);
        expect(firstSuggestion.score).toBeGreaterThanOrEqual(0);
        expect(firstSuggestion.score).toBeLessThanOrEqual(1);
        expect(firstSuggestion.reasoning).toBeDefined();
        expect(firstSuggestion.rank).toBeDefined();
        expect(firstSuggestion.confidence).toBeDefined();
      }
    });
  });

  describe('Combined AI Analysis', () => {
    test('should analyze sitter profile comprehensively', async () => {
      const analysis = await pawfectAI.analyzeSitterProfile(
        'sitter_001',
        mockSitterData,
        mockReviews
      );
      
      expect(analysis).toBeDefined();
      expect(analysis.sitterId).toBe('sitter_001');
      expect(analysis.timestamp).toBeDefined();
      expect(analysis.trustScore).toBeDefined();
      expect(analysis.sentimentAnalysis).toBeDefined();
      expect(Array.isArray(analysis.insights)).toBe(true);
      expect(Array.isArray(analysis.overallInsights)).toBe(true);
    });

    test('should get enhanced recommendations', async () => {
      const recommendations = await pawfectAI.getEnhancedRecommendations(
        mockPetProfile,
        mockOwnerPreferences,
        mockAvailableSitters,
        5
      );
      
      expect(recommendations).toBeDefined();
      expect(recommendations.petId).toBe('pet_001');
      expect(recommendations.timestamp).toBeDefined();
      expect(Array.isArray(recommendations.recommendations)).toBe(true);
      expect(Array.isArray(recommendations.timeSuggestions)).toBe(true);
      expect(Array.isArray(recommendations.insights)).toBe(true);
    });
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const health = await pawfectAI.healthCheck();
      
      expect(health).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
      expect(health.timestamp).toBeDefined();
      expect(health.services).toBeDefined();
      expect(health.models).toBeDefined();
    });
  });

  describe('Performance Metrics', () => {
    test('should return performance metrics', async () => {
      const metrics = await pawfectAI.getPerformanceMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.timestamp).toBeDefined();
      expect(metrics.requests).toBeDefined();
      expect(metrics.averageResponseTime).toBeDefined();
      expect(metrics.accuracy).toBeDefined();
      
      // Check specific metrics
      expect(metrics.requests.trustScore).toBeGreaterThanOrEqual(0);
      expect(metrics.requests.recommendations).toBeGreaterThanOrEqual(0);
      expect(metrics.requests.sentimentAnalysis).toBeGreaterThanOrEqual(0);
      expect(metrics.requests.timeSuggestions).toBeGreaterThanOrEqual(0);
      
      expect(metrics.averageResponseTime.trustScore).toBeGreaterThan(0);
      expect(metrics.averageResponseTime.recommendations).toBeGreaterThan(0);
      expect(metrics.averageResponseTime.sentimentAnalysis).toBeGreaterThan(0);
      expect(metrics.averageResponseTime.timeSuggestions).toBeGreaterThan(0);
      
      expect(metrics.accuracy.trustScore).toBeGreaterThan(0);
      expect(metrics.accuracy.trustScore).toBeLessThanOrEqual(1);
      expect(metrics.accuracy.recommendations).toBeGreaterThan(0);
      expect(metrics.accuracy.recommendations).toBeLessThanOrEqual(1);
      expect(metrics.accuracy.sentimentAnalysis).toBeGreaterThan(0);
      expect(metrics.accuracy.sentimentAnalysis).toBeLessThanOrEqual(1);
      expect(metrics.accuracy.timeSuggestions).toBeGreaterThan(0);
      expect(metrics.accuracy.timeSuggestions).toBeLessThanOrEqual(1);
    });
  });

  describe('Configuration', () => {
    test('should update configuration', async () => {
      const config = {
        logLevel: 'debug',
        openaiApiKey: 'new_test_key'
      };
      
      const result = await pawfectAI.updateConfiguration(config);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Configuration updated');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid sitter data gracefully', async () => {
      const trustScore = await pawfectAI.calculateTrustScore('invalid_sitter', null);
      
      expect(trustScore).toBeDefined();
      expect(trustScore.score).toBeGreaterThanOrEqual(0);
      expect(trustScore.score).toBeLessThanOrEqual(1);
    });

    test('should handle invalid pet profile gracefully', async () => {
      const recommendations = await pawfectAI.getRecommendations(
        null,
        mockOwnerPreferences,
        mockAvailableSitters,
        5
      );
      
      expect(Array.isArray(recommendations)).toBe(true);
    });

    test('should handle invalid review text gracefully', async () => {
      const analysis = await pawfectAI.analyzeReview(null);
      
      expect(analysis).toBeDefined();
      expect(analysis.sentiment).toBe('neutral');
      expect(analysis.score).toBe(0.5);
    });
  });

  describe('Model Training', () => {
    test('should train trust score model', async () => {
      const trainingData = [
        {
          features: [0.8, 0.9, 0.95, 0.9, 0.85, 0.8, 0.3, 0.25, 0.9, 0.33, 0.4, 1, 1, 1, 0.8],
          trustScore: 1
        },
        {
          features: [0.3, 0.4, 0.6, 0.5, 0.4, 0.3, 0.1, 0.1, 0.5, 0.1, 0.2, 0, 0, 0, 0.4],
          trustScore: 0
        }
      ];
      
      await expect(pawfectAI.trainTrustModel(trainingData)).resolves.not.toThrow();
    });

    test('should train matchmaking models', async () => {
      const trainingData = {
        collaborative: [
          { ownerId: 1, sitterId: 1, rating: 5 },
          { ownerId: 1, sitterId: 2, rating: 3 }
        ],
        content: [
          { petTraits: [0.5, 0.6, 0.7], sitterTraits: [0.8, 0.9, 0.7], compatibility: 0.8 },
          { petTraits: [0.3, 0.4, 0.5], sitterTraits: [0.6, 0.7, 0.5], compatibility: 0.6 }
        ]
      };
      
      await expect(pawfectAI.trainMatchmakingModels(trainingData)).resolves.not.toThrow();
    });

    test('should train booking models', async () => {
      const trainingData = {
        timeSeries: [
          {
            timeSeriesFeatures: Array(24).fill().map(() => Array(7).fill(0.5)),
            timeSeriesLabels: Array(24).fill(0.7)
          }
        ],
        patterns: [
          {
            patternFeatures: Array(20).fill(0.5),
            success: true
          }
        ]
      };
      
      await expect(pawfectAI.trainBookingModels(trainingData)).resolves.not.toThrow();
    });
  });
});

// Integration tests
describe('AI Integration Tests', () => {
  let pawfectAI;

  beforeAll(async () => {
    process.env.OPENAI_API_KEY = 'test_key';
    process.env.LOG_LEVEL = 'error';
    
    pawfectAI = new PawfectAI();
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  test('should perform end-to-end recommendation flow', async () => {
    // 1. Analyze sitter profile
    const sitterAnalysis = await pawfectAI.analyzeSitterProfile(
      'sitter_001',
      mockSitterData,
      mockReviews
    );
    expect(sitterAnalysis).toBeDefined();

    // 2. Get recommendations
    const recommendations = await pawfectAI.getRecommendations(
      mockPetProfile,
      mockOwnerPreferences,
      mockAvailableSitters,
      3
    );
    expect(recommendations.length).toBeGreaterThan(0);

    // 3. Get time suggestions for top recommendation
    const topSitter = recommendations[0];
    const timeSuggestions = await pawfectAI.getTimeSuggestions(
      mockPetProfile.id,
      topSitter.sitter.id,
      mockOwnerPreferences,
      3
    );
    expect(timeSuggestions.suggestions.length).toBeGreaterThan(0);

    // 4. Analyze review sentiment
    const sentimentAnalysis = await pawfectAI.analyzeReview(mockReviews[0]);
    expect(sentimentAnalysis.sentiment).toBeDefined();
  });

  test('should handle concurrent requests', async () => {
    const promises = [
      pawfectAI.calculateTrustScore('sitter_001', mockSitterData),
      pawfectAI.analyzeReview(mockReviews[0]),
      pawfectAI.getRecommendations(mockPetProfile, mockOwnerPreferences, mockAvailableSitters, 2),
      pawfectAI.getTimeSuggestions('pet_001', 'sitter_001', mockOwnerPreferences, 3)
    ];

    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(4);
    expect(results[0]).toBeDefined(); // Trust score
    expect(results[1]).toBeDefined(); // Sentiment analysis
    expect(results[2]).toBeDefined(); // Recommendations
    expect(results[3]).toBeDefined(); // Time suggestions
  });
});
