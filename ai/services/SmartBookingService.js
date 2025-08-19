const tf = require('@tensorflow/tfjs-node');
const { OpenAI } = require('openai');
const winston = require('winston');
const { format, addDays, addHours, startOfDay, endOfDay, isWithinInterval } = require('date-fns');
const _ = require('lodash');

class SmartBookingService {
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
        new winston.transports.File({ filename: 'logs/smart-booking.log' }),
        new winston.transports.Console()
      ]
    });

    this.timeSeriesModel = null;
    this.patternModel = null;
    this.availabilityCache = new Map();
    
    this.initializeModels();
  }

  async initializeModels() {
    try {
      await this.loadTimeSeriesModel();
      await this.loadPatternModel();
      this.logger.info('Smart Booking Service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Smart Booking Service:', error);
    }
  }

  async loadTimeSeriesModel() {
    try {
      this.timeSeriesModel = await tf.loadLayersModel('file://./models/time-series/model.json');
      this.logger.info('Loaded time series model');
    } catch (error) {
      this.logger.info('Creating new time series model');
      this.timeSeriesModel = this.createTimeSeriesModel();
    }
  }

  async loadPatternModel() {
    try {
      this.patternModel = await tf.loadLayersModel('file://./models/booking-patterns/model.json');
      this.logger.info('Loaded booking pattern model');
    } catch (error) {
      this.logger.info('Creating new booking pattern model');
      this.patternModel = this.createPatternModel();
    }
  }

  createTimeSeriesModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 50,
          returnSequences: true,
          inputShape: [24, 7] // 24 hours, 7 features
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({
          units: 30,
          returnSequences: false
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 24, // Predict next 24 hours
          activation: 'sigmoid'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    return model;
  }

  createPatternModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [20], // Pet traits + owner preferences + time features
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
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

  async getTimeSuggestions(petId, sitterId, ownerPreferences, dateRange = 7) {
    try {
      this.logger.info(`Getting time suggestions for pet: ${petId}, sitter: ${sitterId}`);

      // Get historical booking data
      const historicalData = await this.getHistoricalData(petId, sitterId);
      
      // Get sitter availability
      const sitterAvailability = await this.getSitterAvailability(sitterId, dateRange);
      
      // Get pet behavior patterns
      const petPatterns = await this.analyzePetPatterns(petId);
      
      // Generate time series predictions
      const timeSeriesPredictions = await this.predictTimeSeries(historicalData);
      
      // Get AI-enhanced suggestions
      const aiSuggestions = await this.getAISuggestions(petId, sitterId, ownerPreferences, dateRange);
      
      // Combine all predictions
      const combinedSuggestions = this.combineSuggestions(
        timeSeriesPredictions,
        sitterAvailability,
        petPatterns,
        aiSuggestions
      );

      // Filter and rank suggestions
      const rankedSuggestions = this.rankSuggestions(combinedSuggestions, ownerPreferences);

      this.logger.info(`Generated ${rankedSuggestions.length} time suggestions`);

      return {
        suggestions: rankedSuggestions,
        confidence: this.calculateConfidence(historicalData, petPatterns),
        factors: this.getContributingFactors(rankedSuggestions),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error getting time suggestions for pet ${petId}:`, error);
      throw error;
    }
  }

  async getHistoricalData(petId, sitterId) {
    // Simulate fetching historical booking data
    // In real implementation, this would query the database
    const mockData = {
      petId,
      sitterId,
      bookings: [
        {
          startTime: new Date('2024-01-15T09:00:00Z'),
          endTime: new Date('2024-01-15T17:00:00Z'),
          duration: 8,
          success: true,
          rating: 5
        },
        {
          startTime: new Date('2024-01-17T10:00:00Z'),
          endTime: new Date('2024-01-17T18:00:00Z'),
          duration: 8,
          success: true,
          rating: 4
        },
        {
          startTime: new Date('2024-01-20T08:00:00Z'),
          endTime: new Date('2024-01-20T16:00:00Z'),
          duration: 8,
          success: true,
          rating: 5
        }
      ],
      cancellations: [],
      noShows: []
    };

    return mockData;
  }

  async getSitterAvailability(sitterId, dateRange) {
    const cacheKey = `availability_${sitterId}_${dateRange}`;
    
    if (this.availabilityCache.has(cacheKey)) {
      return this.availabilityCache.get(cacheKey);
    }

    // Simulate fetching sitter availability
    const availability = {
      sitterId,
      schedule: {},
      preferences: {
        preferredHours: { start: 8, end: 18 },
        maxPets: 2,
        advanceNotice: 24, // hours
        maxDuration: 12 // hours
      }
    };

    // Generate availability for next N days
    for (let i = 0; i < dateRange; i++) {
      const date = addDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      availability.schedule[dateKey] = {
        available: true,
        hours: {
          start: 8,
          end: 18
        },
        existingBookings: []
      };
    }

    this.availabilityCache.set(cacheKey, availability);
    return availability;
  }

  async analyzePetPatterns(petId) {
    // Simulate analyzing pet behavior patterns
    const patterns = {
      petId,
      preferredTimes: {
        morning: { start: 8, end: 12, confidence: 0.8 },
        afternoon: { start: 12, end: 16, confidence: 0.6 },
        evening: { start: 16, end: 20, confidence: 0.4 }
      },
      activityLevel: 'high',
      feedingSchedule: [8, 12, 18],
      sleepPatterns: {
        wakeTime: 7,
        bedTime: 21
      },
      anxietyTriggers: ['separation', 'loud noises'],
      comfortFactors: ['familiar environment', 'routine']
    };

    return patterns;
  }

  async predictTimeSeries(historicalData) {
    try {
      // Prepare time series data
      const timeSeriesData = this.prepareTimeSeriesData(historicalData);
      
      // Create input tensor
      const input = tf.tensor3d([timeSeriesData], [1, 24, 7]);
      
      // Get prediction
      const prediction = this.timeSeriesModel.predict(input);
      const predictions = prediction.dataSync();
      
      // Convert to time slots
      const timeSlots = [];
      for (let hour = 0; hour < 24; hour++) {
        timeSlots.push({
          hour,
          score: predictions[hour],
          confidence: this.calculateTimeConfidence(predictions[hour])
        });
      }

      return timeSlots;
    } catch (error) {
      this.logger.warn('Time series prediction failed, using fallback:', error);
      
      // Fallback: generate reasonable time slots
      return this.generateFallbackTimeSlots();
    }
  }

  prepareTimeSeriesData(historicalData) {
    // Create 24-hour time series with 7 features
    const timeSeries = Array(24).fill().map(() => Array(7).fill(0));
    
    historicalData.bookings.forEach(booking => {
      const startHour = new Date(booking.startTime).getHours();
      const endHour = new Date(booking.endTime).getHours();
      
      for (let hour = startHour; hour < endHour; hour++) {
        if (hour < 24) {
          timeSeries[hour][0] = 1; // Booking exists
          timeSeries[hour][1] = booking.rating / 5; // Normalized rating
          timeSeries[hour][2] = booking.duration / 12; // Normalized duration
          timeSeries[hour][3] = booking.success ? 1 : 0; // Success flag
          timeSeries[hour][4] = new Date(booking.startTime).getDay() / 6; // Day of week
          timeSeries[hour][5] = hour / 23; // Hour of day
          timeSeries[hour][6] = 1; // Historical data flag
        }
      }
    });

    return timeSeries;
  }

  generateFallbackTimeSlots() {
    const timeSlots = [];
    const peakHours = [8, 9, 10, 14, 15, 16, 17];
    
    for (let hour = 0; hour < 24; hour++) {
      const isPeakHour = peakHours.includes(hour);
      const score = isPeakHour ? 0.8 : 0.4;
      
      timeSlots.push({
        hour,
        score,
        confidence: 0.6
      });
    }

    return timeSlots;
  }

  async getAISuggestions(petId, sitterId, ownerPreferences, dateRange) {
    try {
      const prompt = `Suggest optimal booking times for a pet sitter:

Pet ID: ${petId}
Sitter ID: ${sitterId}
Date Range: Next ${dateRange} days

Owner Preferences:
- Preferred Duration: ${ownerPreferences.duration || '8 hours'}
- Preferred Time: ${ownerPreferences.preferredTime || 'flexible'}
- Budget: ${ownerPreferences.budget || 'standard'}
- Special Requirements: ${ownerPreferences.specialRequirements || 'none'}

Consider:
- Pet behavior patterns
- Sitter availability
- Historical success rates
- Owner convenience
- Optimal care timing

Return a JSON array with suggested time slots, each containing:
- date (YYYY-MM-DD)
- startTime (HH:MM)
- endTime (HH:MM)
- confidence (0-1)
- reasoning (string)`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert pet care scheduler. Analyze pet behavior, sitter availability, and owner preferences to suggest optimal booking times."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result;
    } catch (error) {
      this.logger.warn('AI suggestions failed, using fallback:', error);
      
      // Fallback: generate basic suggestions
      return this.generateFallbackAISuggestions(dateRange);
    }
  }

  generateFallbackAISuggestions(dateRange) {
    const suggestions = [];
    
    for (let i = 0; i < dateRange; i++) {
      const date = addDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      suggestions.push({
        date: dateStr,
        startTime: '09:00',
        endTime: '17:00',
        confidence: 0.7,
        reasoning: 'Standard business hours - optimal for most pets and sitters'
      });
    }

    return suggestions;
  }

  combineSuggestions(timeSeriesPredictions, sitterAvailability, petPatterns, aiSuggestions) {
    const combined = [];

    // Process AI suggestions
    aiSuggestions.forEach(suggestion => {
      const startHour = parseInt(suggestion.startTime.split(':')[0]);
      const endHour = parseInt(suggestion.endTime.split(':')[0]);
      
      combined.push({
        date: suggestion.date,
        startTime: suggestion.startTime,
        endTime: suggestion.endTime,
        duration: endHour - startHour,
        score: suggestion.confidence,
        reasoning: suggestion.reasoning,
        source: 'ai'
      });
    });

    // Process time series predictions
    const today = new Date();
    for (let day = 0; day < 7; day++) {
      const date = addDays(today, day);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Find best time slots for this day
      const bestSlots = this.findBestTimeSlots(timeSeriesPredictions, petPatterns, day);
      
      bestSlots.forEach(slot => {
        combined.push({
          date: dateStr,
          startTime: `${slot.startHour.toString().padStart(2, '0')}:00`,
          endTime: `${slot.endHour.toString().padStart(2, '0')}:00`,
          duration: slot.endHour - slot.startHour,
          score: slot.score,
          reasoning: 'Based on historical patterns and pet behavior',
          source: 'timeSeries'
        });
      });
    }

    return combined;
  }

  findBestTimeSlots(timeSeriesPredictions, petPatterns, dayOffset) {
    const slots = [];
    const minDuration = 4; // Minimum 4-hour slots
    const maxDuration = 12; // Maximum 12-hour slots
    
    // Find continuous high-scoring time periods
    for (let startHour = 6; startHour <= 18; startHour++) {
      for (let duration = minDuration; duration <= maxDuration; duration++) {
        const endHour = startHour + duration;
        if (endHour > 24) continue;
        
        // Calculate average score for this time slot
        let totalScore = 0;
        let count = 0;
        
        for (let hour = startHour; hour < endHour; hour++) {
          const prediction = timeSeriesPredictions.find(p => p.hour === hour);
          if (prediction) {
            totalScore += prediction.score;
            count++;
          }
        }
        
        if (count > 0) {
          const avgScore = totalScore / count;
          
          // Apply pet pattern adjustments
          const adjustedScore = this.applyPetPatternAdjustments(avgScore, startHour, endHour, petPatterns);
          
          if (adjustedScore > 0.6) { // Only include good suggestions
            slots.push({
              startHour,
              endHour,
              score: adjustedScore,
              duration
            });
          }
        }
      }
    }

    // Sort by score and return top 3
    return slots.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  applyPetPatternAdjustments(baseScore, startHour, endHour, petPatterns) {
    let adjustedScore = baseScore;
    
    // Adjust based on pet's preferred times
    const morningOverlap = this.calculateTimeOverlap(startHour, endHour, 8, 12);
    const afternoonOverlap = this.calculateTimeOverlap(startHour, endHour, 12, 16);
    const eveningOverlap = this.calculateTimeOverlap(startHour, endHour, 16, 20);
    
    if (morningOverlap > 0) {
      adjustedScore += morningOverlap * petPatterns.preferredTimes.morning.confidence * 0.2;
    }
    if (afternoonOverlap > 0) {
      adjustedScore += afternoonOverlap * petPatterns.preferredTimes.afternoon.confidence * 0.2;
    }
    if (eveningOverlap > 0) {
      adjustedScore += eveningOverlap * petPatterns.preferredTimes.evening.confidence * 0.2;
    }
    
    // Adjust based on feeding schedule
    const feedingOverlap = this.calculateFeedingOverlap(startHour, endHour, petPatterns.feedingSchedule);
    adjustedScore += feedingOverlap * 0.1;
    
    return Math.min(1, adjustedScore);
  }

  calculateTimeOverlap(start1, end1, start2, end2) {
    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    const overlap = Math.max(0, overlapEnd - overlapStart);
    const totalDuration = end1 - start1;
    
    return totalDuration > 0 ? overlap / totalDuration : 0;
  }

  calculateFeedingOverlap(startHour, endHour, feedingSchedule) {
    let overlap = 0;
    
    feedingSchedule.forEach(feedingHour => {
      if (feedingHour >= startHour && feedingHour < endHour) {
        overlap += 1;
      }
    });
    
    return overlap / feedingSchedule.length;
  }

  rankSuggestions(suggestions, ownerPreferences) {
    // Apply owner preference filters
    const filtered = suggestions.filter(suggestion => {
      // Check duration preference
      if (ownerPreferences.duration) {
        const preferredDuration = parseInt(ownerPreferences.duration);
        const tolerance = 2; // ±2 hours tolerance
        if (Math.abs(suggestion.duration - preferredDuration) > tolerance) {
          return false;
        }
      }
      
      // Check time preference
      if (ownerPreferences.preferredTime && ownerPreferences.preferredTime !== 'flexible') {
        const startHour = parseInt(suggestion.startTime.split(':')[0]);
        if (ownerPreferences.preferredTime === 'morning' && startHour > 12) return false;
        if (ownerPreferences.preferredTime === 'afternoon' && (startHour < 12 || startHour > 16)) return false;
        if (ownerPreferences.preferredTime === 'evening' && startHour < 16) return false;
      }
      
      return true;
    });

    // Sort by score and add ranking
    return filtered
      .sort((a, b) => b.score - a.score)
      .map((suggestion, index) => ({
        ...suggestion,
        rank: index + 1,
        confidence: this.calculateTimeConfidence(suggestion.score)
      }));
  }

  calculateTimeConfidence(score) {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  calculateConfidence(historicalData, petPatterns) {
    let confidence = 0.5; // Base confidence
    
    // More historical data = higher confidence
    if (historicalData.bookings.length >= 5) confidence += 0.2;
    if (historicalData.bookings.length >= 10) confidence += 0.1;
    
    // Consistent patterns = higher confidence
    const patterns = petPatterns.preferredTimes;
    const patternConfidence = (patterns.morning.confidence + patterns.afternoon.confidence + patterns.evening.confidence) / 3;
    confidence += patternConfidence * 0.2;
    
    return Math.min(1, confidence);
  }

  getContributingFactors(suggestions) {
    const factors = [];
    
    suggestions.forEach(suggestion => {
      if (suggestion.score >= 0.8) factors.push('High historical success rate');
      if (suggestion.source === 'ai') factors.push('AI-optimized timing');
      if (suggestion.duration >= 6) factors.push('Extended care period');
      if (suggestion.reasoning.includes('pet behavior')) factors.push('Pet behavior analysis');
    });
    
    return [...new Set(factors)]; // Remove duplicates
  }

  async trainTimeSeriesModel(trainingData) {
    try {
      this.logger.info('Training time series model...');
      
      const { features, labels } = this.prepareTimeSeriesTrainingData(trainingData);
      
      const xs = tf.tensor3d(features, [features.length, 24, 7]);
      const ys = tf.tensor2d(labels, [labels.length, 24]);

      await this.timeSeriesModel.fit(xs, ys, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.logger.info(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}`);
          }
        }
      });

      await this.timeSeriesModel.save('file://./models/time-series');
      
      this.logger.info('Time series model trained successfully');
    } catch (error) {
      this.logger.error('Error training time series model:', error);
      throw error;
    }
  }

  async trainPatternModel(trainingData) {
    try {
      this.logger.info('Training booking pattern model...');
      
      const { features, labels } = this.preparePatternTrainingData(trainingData);
      
      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(labels, [labels.length, 1]);

      await this.patternModel.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2
      });

      await this.patternModel.save('file://./models/booking-patterns');
      
      this.logger.info('Booking pattern model trained successfully');
    } catch (error) {
      this.logger.error('Error training pattern model:', error);
      throw error;
    }
  }

  prepareTimeSeriesTrainingData(data) {
    const features = [];
    const labels = [];

    data.forEach(item => {
      features.push(item.timeSeriesFeatures);
      labels.push(item.timeSeriesLabels);
    });

    return { features, labels };
  }

  preparePatternTrainingData(data) {
    const features = [];
    const labels = [];

    data.forEach(item => {
      features.push(item.patternFeatures);
      labels.push(item.success ? 1 : 0);
    });

    return { features, labels };
  }
}

module.exports = { SmartBookingService };
