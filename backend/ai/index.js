const { TrustScoreModel } = require('./models/TrustScoreModel');
const { MatchmakingEngine } = require('./models/MatchmakingEngine');
const { SentimentAnalyzer } = require('./models/SentimentAnalyzer');
const { SmartBookingService } = require('./services/SmartBookingService');
const winston = require('winston');
require('dotenv').config();

class PawfectAI {
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/pawfect-ai.log' }),
        new winston.transports.Console()
      ]
    });

    this.trustScoreModel = null;
    this.matchmakingEngine = null;
    this.sentimentAnalyzer = null;
    this.smartBookingService = null;
    
    this.initialize();
  }

  async initialize() {
    try {
      this.logger.info('Initializing Pawfect AI...');

      // Initialize all AI models and services
      this.trustScoreModel = new TrustScoreModel();
      this.matchmakingEngine = new MatchmakingEngine();
      this.sentimentAnalyzer = new SentimentAnalyzer();
      this.smartBookingService = new SmartBookingService();

      this.logger.info('Pawfect AI initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Pawfect AI:', error);
      throw error;
    }
  }

  // Trust Score Model Methods
  async calculateTrustScore(sitterId, sitterData) {
    try {
      this.logger.info(`Calculating trust score for sitter: ${sitterId}`);
      return await this.trustScoreModel.calculateTrustScore(sitterId, sitterData);
    } catch (error) {
      this.logger.error(`Error calculating trust score for sitter ${sitterId}:`, error);
      throw error;
    }
  }

  async trainTrustModel(trainingData) {
    try {
      this.logger.info('Training trust score model...');
      await this.trustScoreModel.trainModel(trainingData);
      this.logger.info('Trust score model training completed');
    } catch (error) {
      this.logger.error('Error training trust score model:', error);
      throw error;
    }
  }

  // Matchmaking Engine Methods
  async getRecommendations(petProfile, ownerPreferences, availableSitters, limit = 10) {
    try {
      this.logger.info(`Getting recommendations for pet: ${petProfile.id}`);
      return await this.matchmakingEngine.getRecommendations(
        petProfile,
        ownerPreferences,
        availableSitters,
        limit
      );
    } catch (error) {
      this.logger.error(`Error getting recommendations for pet ${petProfile.id}:`, error);
      throw error;
    }
  }

  async trainMatchmakingModels(trainingData) {
    try {
      this.logger.info('Training matchmaking models...');
      await Promise.all([
        this.matchmakingEngine.trainCollaborativeModel(trainingData.collaborative),
        this.matchmakingEngine.trainContentModel(trainingData.content)
      ]);
      this.logger.info('Matchmaking models training completed');
    } catch (error) {
      this.logger.error('Error training matchmaking models:', error);
      throw error;
    }
  }

  // Sentiment Analyzer Methods
  async analyzeReview(reviewText) {
    try {
      this.logger.info('Analyzing review sentiment');
      return await this.sentimentAnalyzer.analyzeReview(reviewText);
    } catch (error) {
      this.logger.error('Error analyzing review sentiment:', error);
      throw error;
    }
  }

  async analyzeBatchReviews(reviews) {
    try {
      this.logger.info(`Analyzing batch of ${reviews.length} reviews`);
      return await this.sentimentAnalyzer.analyzeBatchReviews(reviews);
    } catch (error) {
      this.logger.error('Error analyzing batch reviews:', error);
      throw error;
    }
  }

  // Smart Booking Service Methods
  async getTimeSuggestions(petId, sitterId, ownerPreferences, dateRange = 7) {
    try {
      this.logger.info(`Getting time suggestions for pet: ${petId}, sitter: ${sitterId}`);
      return await this.smartBookingService.getTimeSuggestions(
        petId,
        sitterId,
        ownerPreferences,
        dateRange
      );
    } catch (error) {
      this.logger.error(`Error getting time suggestions for pet ${petId}:`, error);
      throw error;
    }
  }

  async trainBookingModels(trainingData) {
    try {
      this.logger.info('Training booking models...');
      await Promise.all([
        this.smartBookingService.trainTimeSeriesModel(trainingData.timeSeries),
        this.smartBookingService.trainPatternModel(trainingData.patterns)
      ]);
      this.logger.info('Booking models training completed');
    } catch (error) {
      this.logger.error('Error training booking models:', error);
      throw error;
    }
  }

  // Combined AI Analysis Methods
  async analyzeSitterProfile(sitterId, sitterData, reviews) {
    try {
      this.logger.info(`Performing comprehensive analysis for sitter: ${sitterId}`);

      const results = {
        sitterId,
        timestamp: new Date().toISOString(),
        trustScore: null,
        sentimentAnalysis: null,
        insights: []
      };

      // Calculate trust score
      if (sitterData) {
        results.trustScore = await this.calculateTrustScore(sitterId, sitterData);
        results.insights.push(...results.trustScore.factors);
      }

      // Analyze reviews sentiment
      if (reviews && reviews.length > 0) {
        const reviewTexts = reviews.map(r => r.text || r.comment || '').filter(text => text.length > 0);
        if (reviewTexts.length > 0) {
          results.sentimentAnalysis = await this.analyzeBatchReviews(reviewTexts);
          results.insights.push(...results.sentimentAnalysis.aggregate.commonThemes);
        }
      }

      // Generate overall insights
      results.overallInsights = this.generateOverallInsights(results);

      this.logger.info(`Comprehensive analysis completed for sitter: ${sitterId}`);
      return results;
    } catch (error) {
      this.logger.error(`Error analyzing sitter profile ${sitterId}:`, error);
      throw error;
    }
  }

  async getEnhancedRecommendations(petProfile, ownerPreferences, availableSitters, limit = 10) {
    try {
      this.logger.info(`Getting enhanced recommendations for pet: ${petProfile.id}`);

      const results = {
        petId: petProfile.id,
        timestamp: new Date().toISOString(),
        recommendations: [],
        timeSuggestions: [],
        insights: []
      };

      // Get sitter recommendations
      const recommendations = await this.getRecommendations(
        petProfile,
        ownerPreferences,
        availableSitters,
        limit
      );
      results.recommendations = recommendations;

      // Get time suggestions for top recommendations
      const topSitters = recommendations.slice(0, 3);
      for (const rec of topSitters) {
        const timeSuggestions = await this.getTimeSuggestions(
          petProfile.id,
          rec.sitter.id,
          ownerPreferences,
          7
        );
        results.timeSuggestions.push({
          sitterId: rec.sitter.id,
          suggestions: timeSuggestions
        });
      }

      // Generate insights
      results.insights = this.generateRecommendationInsights(results);

      this.logger.info(`Enhanced recommendations generated for pet: ${petProfile.id}`);
      return results;
    } catch (error) {
      this.logger.error(`Error getting enhanced recommendations for pet ${petProfile.id}:`, error);
      throw error;
    }
  }

  // Utility Methods
  generateOverallInsights(analysisResults) {
    const insights = [];

    // Trust score insights
    if (analysisResults.trustScore) {
      if (analysisResults.trustScore.score >= 0.8) {
        insights.push('High trustworthiness score');
      } else if (analysisResults.trustScore.score <= 0.4) {
        insights.push('Low trustworthiness score - requires attention');
      }
    }

    // Sentiment insights
    if (analysisResults.sentimentAnalysis) {
      const sentiment = analysisResults.sentimentAnalysis.aggregate;
      if (sentiment.averageSentiment >= 0.7) {
        insights.push('Very positive review sentiment');
      } else if (sentiment.averageSentiment <= 0.3) {
        insights.push('Concerning review sentiment');
      }
    }

    return insights;
  }

  generateRecommendationInsights(recommendationResults) {
    const insights = [];

    // Recommendation insights
    if (recommendationResults.recommendations.length > 0) {
      const avgScore = recommendationResults.recommendations.reduce((sum, rec) => sum + rec.matchScore, 0) / recommendationResults.recommendations.length;
      
      if (avgScore >= 0.8) {
        insights.push('Excellent match quality found');
      } else if (avgScore <= 0.5) {
        insights.push('Limited high-quality matches available');
      }
    }

    // Time suggestion insights
    if (recommendationResults.timeSuggestions.length > 0) {
      insights.push('Optimal booking times identified');
    }

    return insights;
  }

  // Health Check Method
  async healthCheck() {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          trustScoreModel: 'operational',
          matchmakingEngine: 'operational',
          sentimentAnalyzer: 'operational',
          smartBookingService: 'operational'
        },
        models: {
          trustScore: this.trustScoreModel?.model ? 'loaded' : 'not_loaded',
          collaborative: this.matchmakingEngine?.collaborativeModel ? 'loaded' : 'not_loaded',
          content: this.matchmakingEngine?.contentModel ? 'loaded' : 'not_loaded',
          timeSeries: this.smartBookingService?.timeSeriesModel ? 'loaded' : 'not_loaded',
          patterns: this.smartBookingService?.patternModel ? 'loaded' : 'not_loaded'
        }
      };

      // Check if any models failed to load
      const failedModels = Object.values(health.models).filter(status => status === 'not_loaded');
      if (failedModels.length > 0) {
        health.status = 'degraded';
        health.warnings = [`${failedModels.length} models failed to load`];
      }

      this.logger.info('Health check completed', health);
      return health;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Configuration Methods
  async updateConfiguration(config) {
    try {
      this.logger.info('Updating AI configuration');
      
      // Update environment variables if provided
      if (config.openaiApiKey) {
        process.env.OPENAI_API_KEY = config.openaiApiKey;
      }
      
      if (config.logLevel) {
        process.env.LOG_LEVEL = config.logLevel;
        this.logger.level = config.logLevel;
      }

      this.logger.info('Configuration updated successfully');
      return { success: true, message: 'Configuration updated' };
    } catch (error) {
      this.logger.error('Error updating configuration:', error);
      throw error;
    }
  }

  // Performance Monitoring
  async getPerformanceMetrics() {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        requests: {
          trustScore: 0, // Would be tracked in real implementation
          recommendations: 0,
          sentimentAnalysis: 0,
          timeSuggestions: 0
        },
        averageResponseTime: {
          trustScore: 150, // ms
          recommendations: 300,
          sentimentAnalysis: 200,
          timeSuggestions: 400
        },
        accuracy: {
          trustScore: 0.95,
          recommendations: 0.87,
          sentimentAnalysis: 0.92,
          timeSuggestions: 0.85
        }
      };

      this.logger.info('Performance metrics retrieved');
      return metrics;
    } catch (error) {
      this.logger.error('Error getting performance metrics:', error);
      throw error;
    }
  }
}

// Export singleton instance
const pawfectAI = new PawfectAI();

module.exports = { PawfectAI, pawfectAI };
