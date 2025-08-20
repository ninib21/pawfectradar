import { quantumAPI } from '../shared/api/apiClient';

// 🧠 AI Integration Service for Pawfect Sitters Frontend
export interface AIRecommendation {
  sitterId: string;
  score: number;
  confidence: number;
  reasons: string[];
  matchFactors: {
    petCompatibility: number;
    locationProximity: number;
    availabilityMatch: number;
    trustScore: number;
  };
}

export interface TrustScoreAnalysis {
  sitterId: string;
  overallScore: number;
  confidence: number;
  factors: {
    reviews: number;
    completionRate: number;
    responseTime: number;
    verification: number;
    experience: number;
  };
  insights: string[];
  recommendations: string[];
}

export interface SentimentAnalysis {
  reviewId: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  themes: string[];
  emotions: string[];
  insights: string[];
}

export interface SmartBookingSuggestion {
  startTime: string;
  endTime: string;
  confidence: number;
  reasons: string[];
  petBehaviorFactors: string[];
}

export class AIIntegrationService {
  private static instance: AIIntegrationService;
  private baseURL: string;

  private constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_AI_API_URL || 'http://localhost:3001/ai';
  }

  public static getInstance(): AIIntegrationService {
    if (!AIIntegrationService.instance) {
      AIIntegrationService.instance = new AIIntegrationService();
    }
    return AIIntegrationService.instance;
  }

  // 🎯 Get AI-powered sitter recommendations
  async getSitterRecommendations(
    petProfile: any,
    ownerPreferences: any,
    availableSitters: any[],
    limit: number = 10
  ): Promise<AIRecommendation[]> {
    try {
      const response = await fetch(`${this.baseURL}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          petProfile,
          ownerPreferences,
          availableSitters,
          limit,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI recommendation failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Track AI recommendation usage
      await quantumAPI.trackEvent('ai_recommendations_requested', {
        category: 'ai',
        label: 'success',
        value: data.recommendations.length,
        metadata: { petId: petProfile.id },
      });

      return data.recommendations;
    } catch (error) {
      console.error('AI recommendation error:', error);
      
      // Track AI recommendation failure
      await quantumAPI.trackEvent('ai_recommendations_failed', {
        category: 'ai',
        label: 'error',
        value: 1,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      throw error;
    }
  }

  // 🛡️ Get trust score analysis for a sitter
  async getTrustScoreAnalysis(sitterId: string, sitterData: any): Promise<TrustScoreAnalysis> {
    try {
      const response = await fetch(`${this.baseURL}/trust-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          sitterId,
          sitterData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Trust score analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Track trust score analysis
      await quantumAPI.trackEvent('trust_score_analyzed', {
        category: 'ai',
        label: 'success',
        value: Math.round(data.overallScore * 100),
        metadata: { sitterId },
      });

      return data;
    } catch (error) {
      console.error('Trust score analysis error:', error);
      throw error;
    }
  }

  // 📝 Analyze review sentiment
  async analyzeReviewSentiment(reviewText: string, reviewId: string): Promise<SentimentAnalysis> {
    try {
      const response = await fetch(`${this.baseURL}/sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          reviewText,
          reviewId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sentiment analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Track sentiment analysis
      await quantumAPI.trackEvent('sentiment_analyzed', {
        category: 'ai',
        label: data.sentiment,
        value: Math.round(data.confidence * 100),
        metadata: { reviewId },
      });

      return data;
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw error;
    }
  }

  // ⏰ Get smart booking time suggestions
  async getSmartBookingSuggestions(
    petId: string,
    sitterId: string,
    ownerPreferences: any,
    dateRange: number = 7
  ): Promise<SmartBookingSuggestion[]> {
    try {
      const response = await fetch(`${this.baseURL}/smart-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          petId,
          sitterId,
          ownerPreferences,
          dateRange,
        }),
      });

      if (!response.ok) {
        throw new Error(`Smart booking suggestions failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Track smart booking usage
      await quantumAPI.trackEvent('smart_booking_suggestions_requested', {
        category: 'ai',
        label: 'success',
        value: data.suggestions.length,
        metadata: { petId, sitterId },
      });

      return data.suggestions;
    } catch (error) {
      console.error('Smart booking suggestions error:', error);
      throw error;
    }
  }

  // 🔄 Get comprehensive AI analysis for sitter profile
  async getSitterProfileAnalysis(
    sitterId: string,
    sitterData: any,
    reviews: any[]
  ): Promise<{
    trustScore: TrustScoreAnalysis;
    sentimentAnalysis: SentimentAnalysis[];
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseURL}/sitter-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          sitterId,
          sitterData,
          reviews,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sitter profile analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Track comprehensive analysis
      await quantumAPI.trackEvent('sitter_profile_analyzed', {
        category: 'ai',
        label: 'comprehensive',
        value: 1,
        metadata: { sitterId },
      });

      return data;
    } catch (error) {
      console.error('Sitter profile analysis error:', error);
      throw error;
    }
  }

  // 🔐 Get authentication token
  private async getAuthToken(): Promise<string> {
    try {
      // Get token from secure storage or auth context
      const token = await quantumAPI.getAuthToken();
      return token || '';
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return '';
    }
  }

  // 📊 Get AI performance metrics
  async getAIPerformanceMetrics(): Promise<{
    trustScoreAccuracy: number;
    recommendationSatisfaction: number;
    sentimentAnalysisAccuracy: number;
    smartBookingSuccessRate: number;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/performance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI performance metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI performance metrics error:', error);
      throw error;
    }
  }

  // 🧪 Test AI service health
  async testAIHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      trustScore: boolean;
      recommendations: boolean;
      sentimentAnalysis: boolean;
      smartBooking: boolean;
    };
    responseTime: number;
  }> {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`AI health check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        responseTime,
      };
    } catch (error) {
      console.error('AI health check error:', error);
      return {
        status: 'unhealthy',
        services: {
          trustScore: false,
          recommendations: false,
          sentimentAnalysis: false,
          smartBooking: false,
        },
        responseTime: 0,
      };
    }
  }
}

// Export singleton instance
export const aiService = AIIntegrationService.getInstance();
