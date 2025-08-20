import React from 'react';
import { render } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { TrustScoreDisplay } from '../components/AI/TrustScoreDisplay';
import { SmartBookingSuggestions } from '../components/AI/SmartBookingSuggestions';
import { AIIntegrationService } from '../services/AIIntegrationService';
import { EnhancedBookingProvider, useEnhancedBooking } from '../shared/context/EnhancedBookingContext';

// Mock the AI service
jest.mock('../services/AIIntegrationService');

// Mock the quantum API
jest.mock('../shared/api/apiClient', () => ({
  quantumAPI: {
    trackEvent: jest.fn(),
    getAuthToken: jest.fn(() => 'mock-token'),
  },
}));

// Mock the WebSocket service
jest.mock('../shared/api/websocketService', () => ({
  quantumWebSocket: {
    on: jest.fn(),
    off: jest.fn(),
    subscribeToBooking: jest.fn(),
    unsubscribeFromBooking: jest.fn(),
  },
}));

describe('AI Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TrustScoreDisplay Component', () => {
    const mockTrustScore = {
      sitterId: 'sitter-123',
      overallScore: 0.85,
      confidence: 0.92,
      factors: {
        reviews: 0.9,
        completionRate: 0.95,
        responseTime: 0.8,
        verification: 0.85,
        experience: 0.75,
      },
      insights: [
        'Excellent response time to booking requests',
        'High completion rate indicates reliability',
        'Strong positive reviews from pet owners',
      ],
      recommendations: [
        'Consider this sitter for urgent bookings',
        'Great choice for first-time pet owners',
      ],
    };

    it('renders trust score display correctly', () => {
      const { getByText } = render(
        <TrustScoreDisplay trustScore={mockTrustScore} />
      );

      expect(getByText('Trust Score')).toBeTruthy();
      expect(getByText('85')).toBeTruthy(); // Overall score
      expect(getByText('Excellent')).toBeTruthy();
      expect(getByText('92%')).toBeTruthy(); // Confidence
    });

    it('shows detailed breakdown when showDetails is true', () => {
      const { getByText } = render(
        <TrustScoreDisplay trustScore={mockTrustScore} showDetails={true} />
      );

      expect(getByText('Score Breakdown')).toBeTruthy();
      expect(getByText('Reviews')).toBeTruthy();
      expect(getByText('Completion Rate')).toBeTruthy();
      expect(getByText('Response Time')).toBeTruthy();
      expect(getByText('Verification')).toBeTruthy();
      expect(getByText('Experience')).toBeTruthy();
      expect(getByText('AI Insights')).toBeTruthy();
      expect(getByText('Recommendations')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <TrustScoreDisplay trustScore={mockTrustScore} onPress={mockOnPress} />
      );

      fireEvent.click(getByText('Trust Score'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('displays correct colors for different score ranges', () => {
      const lowScore = { ...mockTrustScore, overallScore: 0.3 };
      const mediumScore = { ...mockTrustScore, overallScore: 0.65 };
      const highScore = { ...mockTrustScore, overallScore: 0.9 };

      const { getByText: getLowText } = render(
        <TrustScoreDisplay trustScore={lowScore} />
      );
      const { getByText: getMediumText } = render(
        <TrustScoreDisplay trustScore={mediumScore} />
      );
      const { getByText: getHighText } = render(
        <TrustScoreDisplay trustScore={highScore} />
      );

      expect(getLowText('Poor')).toBeTruthy();
      expect(getMediumText('Good')).toBeTruthy();
      expect(getHighText('Excellent')).toBeTruthy();
    });
  });

  describe('SmartBookingSuggestions Component', () => {
    const mockSuggestions = [
      {
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T17:00:00Z',
        confidence: 0.88,
        reasons: [
          'Matches your pet\'s usual feeding schedule',
          'Sitter has high availability during this time',
        ],
        petBehaviorFactors: [
          'Your dog is most active in the morning',
          'Previous successful bookings at this time',
        ],
      },
      {
        startTime: '2024-01-16T10:00:00Z',
        endTime: '2024-01-16T18:00:00Z',
        confidence: 0.75,
        reasons: [
          'Good weather forecast for outdoor activities',
          'Sitter specializes in your pet\'s breed',
        ],
        petBehaviorFactors: [
          'Your pet enjoys afternoon walks',
          'Sitter has experience with similar pets',
        ],
      },
    ];

    it('renders smart booking suggestions correctly', () => {
      const mockOnSelect = jest.fn();
      const { getByText } = render(
        <SmartBookingSuggestions
          suggestions={mockSuggestions}
          onSelectSuggestion={mockOnSelect}
        />
      );

      expect(getByText('🤖 Smart Booking Suggestions')).toBeTruthy();
      expect(getByText('AI-optimized times based on pet behavior and sitter availability')).toBeTruthy();
      expect(getByText('Why this time?')).toBeTruthy();
      expect(getByText('Pet Behavior Factors')).toBeTruthy();
    });

    it('shows loading state correctly', () => {
      const { getByText } = render(
        <SmartBookingSuggestions
          suggestions={[]}
          onSelectSuggestion={jest.fn()}
          isLoading={true}
        />
      );

      expect(getByText('🤖 AI is analyzing optimal times...')).toBeTruthy();
    });

    it('shows empty state when no suggestions', () => {
      const { getByText } = render(
        <SmartBookingSuggestions
          suggestions={[]}
          onSelectSuggestion={jest.fn()}
          isLoading={false}
        />
      );

      expect(getByText('No Smart Suggestions Available')).toBeTruthy();
      expect(getByText('AI couldn\'t find optimal booking times based on current data.')).toBeTruthy();
    });

    it('calls onSelectSuggestion when a suggestion is pressed', () => {
      const mockOnSelect = jest.fn();
      const { getByText } = render(
        <SmartBookingSuggestions
          suggestions={mockSuggestions}
          onSelectSuggestion={mockOnSelect}
        />
      );

      // Click the first suggestion
      fireEvent.click(getByText('Mon, Jan 15'));
      expect(mockOnSelect).toHaveBeenCalledWith(mockSuggestions[0]);
    });

    it('displays correct confidence labels', () => {
      const { getByText } = render(
        <SmartBookingSuggestions
          suggestions={mockSuggestions}
          onSelectSuggestion={jest.fn()}
        />
      );

      expect(getByText('High')).toBeTruthy(); // 88% confidence
      expect(getByText('Medium')).toBeTruthy(); // 75% confidence
    });
  });

  describe('AIIntegrationService', () => {
    let aiService: AIIntegrationService;

    beforeEach(() => {
      aiService = AIIntegrationService.getInstance();
    });

    it('gets sitter recommendations successfully', async () => {
      const mockPetProfile = { id: 'pet-123', breed: 'Golden Retriever', age: 3 };
      const mockOwnerPreferences = { preferredTimes: ['morning', 'afternoon'] };
      const mockAvailableSitters: any[] = [];

      const mockRecommendations = [
        {
          sitterId: 'sitter-1',
          score: 0.95,
          confidence: 0.92,
          reasons: ['Perfect match for your pet\'s breed'],
          matchFactors: {
            petCompatibility: 0.95,
            locationProximity: 0.8,
            availabilityMatch: 0.9,
            trustScore: 0.88,
          },
        },
      ];

      // Mock fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ recommendations: mockRecommendations }),
        })
      ) as jest.Mock;

      const result = await aiService.getSitterRecommendations(
        mockPetProfile,
        mockOwnerPreferences,
        mockAvailableSitters
      );

      expect(result).toEqual(mockRecommendations);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/recommendations'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            petProfile: mockPetProfile,
            ownerPreferences: mockOwnerPreferences,
            availableSitters: mockAvailableSitters,
            limit: 10,
          }),
        })
      );
    });

    it('handles AI service errors gracefully', async () => {
      const mockPetProfile = { id: 'pet-123' };
      const mockOwnerPreferences = {};
      const mockAvailableSitters: any[] = [];

      // Mock fetch to return error
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Internal Server Error',
        })
      ) as jest.Mock;

      await expect(
        aiService.getSitterRecommendations(mockPetProfile, mockOwnerPreferences, mockAvailableSitters)
      ).rejects.toThrow('AI recommendation failed: Internal Server Error');
    });

    it('gets trust score analysis successfully', async () => {
      const mockSitterId = 'sitter-123';
      const mockSitterData = { name: 'John Doe', experience: 5 };

      const mockTrustScore = {
        sitterId: mockSitterId,
        overallScore: 0.85,
        confidence: 0.92,
        factors: {
          reviews: 0.9,
          completionRate: 0.95,
          responseTime: 0.8,
          verification: 0.85,
          experience: 0.75,
        },
        insights: ['Excellent response time'],
        recommendations: ['Great choice for urgent bookings'],
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTrustScore),
        })
      ) as jest.Mock;

      const result = await aiService.getTrustScoreAnalysis(mockSitterId, mockSitterData);

      expect(result).toEqual(mockTrustScore);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/trust-score'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            sitterId: mockSitterId,
            sitterData: mockSitterData,
          }),
        })
      );
    });

    it('gets smart booking suggestions successfully', async () => {
      const mockPetId = 'pet-123';
      const mockSitterId = 'sitter-456';
      const mockOwnerPreferences = { preferredTimes: ['morning'] };

      const mockSuggestions = [
        {
          startTime: '2024-01-15T09:00:00Z',
          endTime: '2024-01-15T17:00:00Z',
          confidence: 0.88,
          reasons: ['Matches feeding schedule'],
          petBehaviorFactors: ['Most active in morning'],
        },
      ];

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ suggestions: mockSuggestions }),
        })
      ) as jest.Mock;

      const result = await aiService.getSmartBookingSuggestions(
        mockPetId,
        mockSitterId,
        mockOwnerPreferences
      );

      expect(result).toEqual(mockSuggestions);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/smart-booking'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            petId: mockPetId,
            sitterId: mockSitterId,
            ownerPreferences: mockOwnerPreferences,
            dateRange: 7,
          }),
        })
      );
    });

    it('tests AI service health successfully', async () => {
      const mockHealthStatus = {
        status: 'healthy',
        services: {
          trustScore: true,
          recommendations: true,
          sentimentAnalysis: true,
          smartBooking: true,
        },
        responseTime: 150,
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockHealthStatus),
        })
      ) as jest.Mock;

      const result = await aiService.testAIHealth();

      expect(result).toEqual(mockHealthStatus);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('handles AI service health check failure', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as jest.Mock;

      const result = await aiService.testAIHealth();

      expect(result).toEqual({
        status: 'unhealthy',
        services: {
          trustScore: false,
          recommendations: false,
          sentimentAnalysis: false,
          smartBooking: false,
        },
        responseTime: 0,
      });
    });
  });

  describe('EnhancedBookingContext', () => {
    const TestComponent = () => {
      const { getSitterRecommendations, aiLoading, aiError } = useEnhancedBooking();
      return (
        <div>
          <div data-testid="ai-loading">{aiLoading ? 'Loading' : 'Not Loading'}</div>
          <div data-testid="ai-error">{aiError || 'No Error'}</div>
          <button
            data-testid="get-recommendations"
            onClick={() => getSitterRecommendations({}, {}, [])}
          >
            Get Recommendations
          </button>
        </div>
      );
    };

    it('provides AI-enhanced booking context', () => {
      const { getByTestId } = render(
        <EnhancedBookingProvider>
          <TestComponent />
        </EnhancedBookingProvider>
      );

      expect(getByTestId('ai-loading')).toHaveTextContent('Not Loading');
      expect(getByTestId('ai-error')).toHaveTextContent('No Error');
    });

    it('handles AI recommendations loading state', async () => {
      // Mock the AI service to simulate loading
      const mockGetSitterRecommendations = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve([]);
          }, 100);
        });
      });

      (AIIntegrationService.getInstance as jest.Mock).mockReturnValue({
        getSitterRecommendations: mockGetSitterRecommendations,
      });

      const { getByTestId } = render(
        <EnhancedBookingProvider>
          <TestComponent />
        </EnhancedBookingProvider>
      );

      fireEvent.click(getByTestId('get-recommendations'));

      await waitFor(() => {
        expect(getByTestId('ai-loading')).toHaveTextContent('Loading');
      });
    });
  });
});

describe('AI Integration Performance Tests', () => {
  it('measures AI recommendation response time', async () => {
    const aiService = AIIntegrationService.getInstance();
    const startTime = Date.now();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ recommendations: [] }),
      })
    ) as jest.Mock;

    await aiService.getSitterRecommendations({}, {}, []);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // AI recommendations should respond within 2 seconds
    expect(responseTime).toBeLessThan(2000);
  });

  it('handles concurrent AI requests', async () => {
    const aiService = AIIntegrationService.getInstance();
    const mockResponses = Array(5).fill({ recommendations: [] });

    global.fetch = jest.fn((url) => {
      const index = parseInt(url.split('/').pop() || '0');
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponses[index]),
      });
    }) as jest.Mock;

    const promises = Array(5).fill(null).map((_, index) =>
      aiService.getSitterRecommendations(
        { id: `pet-${index}` },
        {},
        []
      )
    );

    const results = await Promise.all(promises);
    expect(results).toHaveLength(5);
    expect(fetch).toHaveBeenCalledTimes(5);
  });
});

describe('AI Integration Error Handling', () => {
  it('handles network timeouts gracefully', async () => {
    const aiService = AIIntegrationService.getInstance();

    global.fetch = jest.fn(() =>
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100);
      })
    ) as jest.Mock;

    await expect(
      aiService.getSitterRecommendations({}, {}, [])
    ).rejects.toThrow('Timeout');
  });

  it('handles malformed AI responses', async () => {
    const aiService = AIIntegrationService.getInstance();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' }),
      })
    ) as jest.Mock;

    const result = await aiService.getSitterRecommendations({}, {}, []);
    expect(result).toEqual(undefined); // Should handle missing recommendations gracefully
  });

  it('handles AI service authentication errors', async () => {
    const aiService = AIIntegrationService.getInstance();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      })
    ) as jest.Mock;

    await expect(
      aiService.getTrustScoreAnalysis('sitter-123', {})
    ).rejects.toThrow('Trust score analysis failed: Unauthorized');
  });
});
