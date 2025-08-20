// 🚀 QUANTUM PAWFECT SITTERS - SHARED TYPES
// 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED TYPE DEFINITIONS
// 📈 QUANTUM-INFINITE SCALABILITY
// 🚀 QUANTUM-OPTIMIZED PERFORMANCE

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'owner' | 'sitter' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  ownerId: string;
  sitterId: string;
  petIds: string[];
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  totalAmount: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnhancedBooking extends Booking {
  aiRecommendations?: AIRecommendation[];
  aiInsights?: AIInsights;
  trustScore?: number;
  compatibilityScore?: number;
  predictedSuccess?: number;
}

export interface AIRecommendation {
  id: string;
  type: 'sitter_match' | 'time_suggestion' | 'price_optimization' | 'safety_tip';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  metadata?: any;
  createdAt: string;
}

export interface AIInsights {
  trustScore?: TrustScoreAnalysis;
  sentimentAnalysis?: SentimentAnalysis;
  smartBooking?: SmartBookingSuggestion;
  matchmaking?: MatchmakingInsight;
}

export interface TrustScoreAnalysis {
  overallScore: number;
  factors: {
    reviews: number;
    responseTime: number;
    completionRate: number;
    safetyIncidents: number;
    experience: number;
  };
  recommendations: string[];
}

export interface SentimentAnalysis {
  overallSentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keywords: string[];
  topics: string[];
  emotionScores: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
}

export interface SmartBookingSuggestion {
  suggestedTimes: string[];
  reason: string;
  confidence: number;
  alternativeSlots: string[];
}

export interface MatchmakingInsight {
  compatibilityScore: number;
  matchingFactors: string[];
  potentialIssues: string[];
  recommendations: string[];
}

export interface AIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
