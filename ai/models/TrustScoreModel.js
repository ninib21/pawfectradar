const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const { OpenAI } = require('openai');
const winston = require('winston');

class TrustScoreModel {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/trust-score.log' }),
        new winston.transports.Console()
      ]
    });

    this.model = null;
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    
    this.initializeModel();
  }

  async initializeModel() {
    try {
      // Load pre-trained model or create new one
      this.model = await this.loadOrCreateModel();
      this.logger.info('Trust Score Model initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Trust Score Model:', error);
    }
  }

  async loadOrCreateModel() {
    try {
      // Try to load existing model
      const model = await tf.loadLayersModel('file://./models/trust-score-model/model.json');
      this.logger.info('Loaded existing trust score model');
      return model;
    } catch (error) {
      // Create new model if none exists
      this.logger.info('Creating new trust score model');
      return this.createModel();
    }
  }

  createModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [15], // 15 features for trust scoring
          units: 64,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid' // Output trust score between 0 and 1
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async calculateTrustScore(sitterId, sitterData) {
    try {
      this.logger.info(`Calculating trust score for sitter: ${sitterId}`);

      // Extract features from sitter data
      const features = await this.extractFeatures(sitterData);
      
      // Get AI-enhanced insights
      const aiInsights = await this.getAIInsights(sitterData);
      
      // Combine traditional features with AI insights
      const combinedFeatures = this.combineFeatures(features, aiInsights);
      
      // Predict trust score using TensorFlow model
      const tensorFeatures = tf.tensor2d([combinedFeatures], [1, 15]);
      const prediction = await this.model.predict(tensorFeatures);
      const trustScore = prediction.dataSync()[0];
      
      // Apply business logic adjustments
      const adjustedScore = this.applyBusinessLogic(trustScore, sitterData);
      
      this.logger.info(`Trust score calculated: ${adjustedScore} for sitter: ${sitterId}`);
      
      return {
        score: adjustedScore,
        confidence: this.calculateConfidence(sitterData),
        factors: this.getContributingFactors(features, aiInsights),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error calculating trust score for sitter ${sitterId}:`, error);
      throw error;
    }
  }

  async extractFeatures(sitterData) {
    const {
      reviews = [],
      bookings = [],
      responseTime = 0,
      completionRate = 0,
      verificationStatus = false,
      experienceYears = 0,
      certifications = [],
      emergencyContacts = [],
      insurance = false,
      backgroundCheck = false,
      avgRating = 0,
      totalBookings = 0,
      cancellationRate = 0,
      onTimeRate = 0,
      communicationScore = 0
    } = sitterData;

    // Calculate review sentiment
    const reviewSentiment = await this.analyzeReviewSentiment(reviews);
    
    // Calculate response time score (lower is better)
    const responseTimeScore = Math.max(0, 1 - (responseTime / 24)); // 24 hours max
    
    // Calculate completion rate
    const completionScore = completionRate / 100;
    
    // Calculate average rating normalized
    const ratingScore = avgRating / 5;
    
    // Calculate reliability score
    const reliabilityScore = (onTimeRate + (1 - cancellationRate)) / 2;
    
    // Calculate verification score
    const verificationScore = this.calculateVerificationScore({
      verificationStatus,
      backgroundCheck,
      insurance,
      certifications
    });

    return [
      reviewSentiment,
      responseTimeScore,
      completionScore,
      ratingScore,
      reliabilityScore,
      verificationScore,
      experienceYears / 10, // Normalize to 0-1
      totalBookings / 100, // Normalize to 0-1
      communicationScore / 5,
      emergencyContacts.length / 3, // Normalize to 0-1
      certifications.length / 5, // Normalize to 0-1
      backgroundCheck ? 1 : 0,
      insurance ? 1 : 0,
      verificationStatus ? 1 : 0,
      this.calculateConsistencyScore(bookings)
    ];
  }

  async analyzeReviewSentiment(reviews) {
    if (!reviews || reviews.length === 0) return 0.5; // Neutral score

    try {
      const reviewTexts = reviews.map(r => r.text || r.comment || '').filter(text => text.length > 0);
      
      if (reviewTexts.length === 0) return 0.5;

      // Use OpenAI for sentiment analysis
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Analyze the sentiment of pet sitter reviews. Return a JSON object with 'sentiment' (positive/negative/neutral) and 'score' (0-1, where 1 is very positive)."
          },
          {
            role: "user",
            content: `Analyze these reviews: ${reviewTexts.join(' | ')}`
          }
        ],
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.score || 0.5;
    } catch (error) {
      this.logger.warn('Failed to analyze review sentiment with AI, using fallback:', error);
      
      // Fallback to simple keyword analysis
      const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'perfect', 'love', 'best', 'fantastic'];
      const negativeWords = ['terrible', 'awful', 'bad', 'horrible', 'worst', 'hate', 'disappointed', 'poor'];
      
      let positiveCount = 0;
      let negativeCount = 0;
      let totalWords = 0;

      reviews.forEach(review => {
        const text = (review.text || review.comment || '').toLowerCase();
        const words = this.tokenizer.tokenize(text) || [];
        
        words.forEach(word => {
          if (positiveWords.includes(word)) positiveCount++;
          if (negativeWords.includes(word)) negativeCount++;
          totalWords++;
        });
      });

      if (totalWords === 0) return 0.5;
      
      const sentiment = (positiveCount - negativeCount) / totalWords;
      return Math.max(0, Math.min(1, (sentiment + 1) / 2)); // Normalize to 0-1
    }
  }

  calculateVerificationScore(verificationData) {
    let score = 0;
    const weights = {
      verificationStatus: 0.3,
      backgroundCheck: 0.25,
      insurance: 0.25,
      certifications: 0.2
    };

    if (verificationData.verificationStatus) score += weights.verificationStatus;
    if (verificationData.backgroundCheck) score += weights.backgroundCheck;
    if (verificationData.insurance) score += weights.insurance;
    if (verificationData.certifications && verificationData.certifications.length > 0) {
      score += weights.certifications;
    }

    return score;
  }

  calculateConsistencyScore(bookings) {
    if (!bookings || bookings.length === 0) return 0.5;

    const completedBookings = bookings.filter(b => b.status === 'completed');
    if (completedBookings.length === 0) return 0.5;

    // Calculate consistency in booking patterns
    const intervals = [];
    for (let i = 1; i < completedBookings.length; i++) {
      const interval = new Date(completedBookings[i].startTime) - new Date(completedBookings[i-1].startTime);
      intervals.push(interval);
    }

    if (intervals.length === 0) return 0.5;

    // Calculate coefficient of variation (lower is more consistent)
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    // Convert to consistency score (lower CV = higher consistency)
    return Math.max(0, Math.min(1, 1 - (cv / 2)));
  }

  async getAIInsights(sitterData) {
    try {
      const prompt = `Analyze this pet sitter's profile and provide insights on trustworthiness:
        - Experience: ${sitterData.experienceYears} years
        - Total bookings: ${sitterData.totalBookings}
        - Average rating: ${sitterData.avgRating}/5
        - Completion rate: ${sitterData.completionRate}%
        - Response time: ${sitterData.responseTime} hours
        - Verification: ${sitterData.verificationStatus ? 'Yes' : 'No'}
        - Background check: ${sitterData.backgroundCheck ? 'Yes' : 'No'}
        
        Return a JSON object with 'trustworthiness' (0-1), 'risk_factors' (array), and 'strengths' (array).`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI expert analyzing pet sitter trustworthiness. Provide objective, data-driven insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      this.logger.warn('Failed to get AI insights:', error);
      return {
        trustworthiness: 0.5,
        risk_factors: [],
        strengths: []
      };
    }
  }

  combineFeatures(traditionalFeatures, aiInsights) {
    // Combine traditional ML features with AI insights
    const aiTrustScore = aiInsights.trustworthiness || 0.5;
    
    // Weight traditional features more heavily (70%) than AI insights (30%)
    const combinedFeatures = [...traditionalFeatures];
    combinedFeatures[0] = (traditionalFeatures[0] * 0.7) + (aiTrustScore * 0.3);
    
    return combinedFeatures;
  }

  applyBusinessLogic(baseScore, sitterData) {
    let adjustedScore = baseScore;

    // Boost for verified sitters
    if (sitterData.verificationStatus) {
      adjustedScore += 0.1;
    }

    // Boost for experienced sitters
    if (sitterData.experienceYears >= 3) {
      adjustedScore += 0.05;
    }

    // Penalty for high cancellation rate
    if (sitterData.cancellationRate > 0.2) {
      adjustedScore -= 0.15;
    }

    // Penalty for poor response time
    if (sitterData.responseTime > 48) {
      adjustedScore -= 0.1;
    }

    // Ensure score stays within 0-1 range
    return Math.max(0, Math.min(1, adjustedScore));
  }

  calculateConfidence(sitterData) {
    // Calculate confidence based on data completeness and volume
    let confidence = 0.5; // Base confidence

    // More data = higher confidence
    if (sitterData.totalBookings >= 10) confidence += 0.2;
    if (sitterData.totalBookings >= 50) confidence += 0.1;
    if (sitterData.reviews && sitterData.reviews.length >= 5) confidence += 0.1;
    if (sitterData.reviews && sitterData.reviews.length >= 20) confidence += 0.1;

    // Verification boosts confidence
    if (sitterData.verificationStatus) confidence += 0.1;
    if (sitterData.backgroundCheck) confidence += 0.1;

    return Math.min(1, confidence);
  }

  getContributingFactors(features, aiInsights) {
    const factors = [];
    
    if (features[0] > 0.8) factors.push('Excellent review sentiment');
    if (features[1] > 0.8) factors.push('Fast response time');
    if (features[2] > 0.9) factors.push('High completion rate');
    if (features[3] > 0.8) factors.push('High average rating');
    if (features[4] > 0.8) factors.push('Reliable booking patterns');
    if (features[5] > 0.8) factors.push('Strong verification status');
    if (features[6] > 0.7) factors.push('Significant experience');
    if (features[7] > 0.5) factors.push('High booking volume');

    // Add AI-identified strengths
    if (aiInsights.strengths) {
      factors.push(...aiInsights.strengths);
    }

    return factors;
  }

  async trainModel(trainingData) {
    try {
      this.logger.info('Training trust score model...');
      
      const { features, labels } = this.prepareTrainingData(trainingData);
      
      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(labels, [labels.length, 1]);

      await this.model.fit(xs, ys, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.logger.info(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.accuracy.toFixed(4)}`);
          }
        }
      });

      // Save the trained model
      await this.model.save('file://./models/trust-score-model');
      
      this.logger.info('Trust score model trained and saved successfully');
    } catch (error) {
      this.logger.error('Error training trust score model:', error);
      throw error;
    }
  }

  prepareTrainingData(data) {
    const features = [];
    const labels = [];

    data.forEach(item => {
      const featureVector = item.features;
      const trustLabel = item.trustScore; // 0 or 1 for binary classification
      
      features.push(featureVector);
      labels.push(trustLabel);
    });

    return { features, labels };
  }
}

module.exports = { TrustScoreModel };
