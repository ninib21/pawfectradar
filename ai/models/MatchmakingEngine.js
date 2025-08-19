const tf = require('@tensorflow/tfjs-node');
const { OpenAI } = require('openai');
const winston = require('winston');
const _ = require('lodash');

class MatchmakingEngine {
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
        new winston.transports.File({ filename: 'logs/matchmaking.log' }),
        new winston.transports.Console()
      ]
    });

    this.collaborativeModel = null;
    this.contentModel = null;
    this.petTraitsEmbeddings = new Map();
    this.sitterEmbeddings = new Map();
    
    this.initializeModels();
  }

  async initializeModels() {
    try {
      await this.loadCollaborativeModel();
      await this.loadContentModel();
      this.logger.info('Matchmaking Engine initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Matchmaking Engine:', error);
    }
  }

  async loadCollaborativeModel() {
    try {
      this.collaborativeModel = await tf.loadLayersModel('file://./models/collaborative-filtering/model.json');
      this.logger.info('Loaded collaborative filtering model');
    } catch (error) {
      this.logger.info('Creating new collaborative filtering model');
      this.collaborativeModel = this.createCollaborativeModel();
    }
  }

  async loadContentModel() {
    try {
      this.contentModel = await tf.loadLayersModel('file://./models/content-based/model.json');
      this.logger.info('Loaded content-based model');
    } catch (error) {
      this.logger.info('Creating new content-based model');
      this.contentModel = this.createContentModel();
    }
  }

  createCollaborativeModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.embedding({
          inputDim: 10000, // Max number of users
          outputDim: 64,
          inputLength: 1
        }),
        tf.layers.flatten(),
        tf.layers.dense({
          units: 128,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 64,
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

  createContentModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [50], // Pet traits + sitter features
          units: 128,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 32,
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

  async getRecommendations(petProfile, ownerPreferences, availableSitters, limit = 10) {
    try {
      this.logger.info(`Getting recommendations for pet: ${petProfile.id}`);

      // Get embeddings for pet and sitters
      const petEmbedding = await this.getPetEmbedding(petProfile);
      const sitterEmbeddings = await this.getSitterEmbeddings(availableSitters);

      // Calculate content-based similarity scores
      const contentScores = await this.calculateContentScores(petEmbedding, sitterEmbeddings);

      // Calculate collaborative filtering scores
      const collaborativeScores = await this.calculateCollaborativeScores(petProfile.ownerId, availableSitters);

      // Get AI-enhanced recommendations
      const aiRecommendations = await this.getAIRecommendations(petProfile, ownerPreferences, availableSitters);

      // Combine all scores with weights
      const finalScores = this.combineScores(contentScores, collaborativeScores, aiRecommendations);

      // Sort and return top recommendations
      const recommendations = this.rankRecommendations(finalScores, availableSitters, limit);

      this.logger.info(`Generated ${recommendations.length} recommendations for pet: ${petProfile.id}`);

      return recommendations;
    } catch (error) {
      this.logger.error(`Error getting recommendations for pet ${petProfile.id}:`, error);
      throw error;
    }
  }

  async getPetEmbedding(petProfile) {
    const cacheKey = `pet_${petProfile.id}`;
    
    if (this.petTraitsEmbeddings.has(cacheKey)) {
      return this.petTraitsEmbeddings.get(cacheKey);
    }

    const traits = this.extractPetTraits(petProfile);
    const embedding = await this.generateEmbedding(traits);
    
    this.petTraitsEmbeddings.set(cacheKey, embedding);
    return embedding;
  }

  async getSitterEmbeddings(sitters) {
    const embeddings = [];

    for (const sitter of sitters) {
      const cacheKey = `sitter_${sitter.id}`;
      
      if (this.sitterEmbeddings.has(cacheKey)) {
        embeddings.push(this.sitterEmbeddings.get(cacheKey));
      } else {
        const traits = this.extractSitterTraits(sitter);
        const embedding = await this.generateEmbedding(traits);
        this.sitterEmbeddings.set(cacheKey, embedding);
        embeddings.push(embedding);
      }
    }

    return embeddings;
  }

  extractPetTraits(petProfile) {
    const {
      breed = '',
      size = 'medium',
      age = 0,
      energyLevel = 'medium',
      temperament = [],
      specialNeeds = [],
      medicalConditions = [],
      trainingLevel = 'basic',
      socialization = 'good',
      separationAnxiety = false,
      aggression = false,
      houseTrained = true,
      microchipped = false,
      spayedNeutered = false,
      vaccinations = []
    } = petProfile;

    return {
      breed: breed.toLowerCase(),
      size: this.normalizeSize(size),
      age: this.normalizeAge(age),
      energyLevel: this.normalizeEnergyLevel(energyLevel),
      temperament: temperament.join(' '),
      specialNeeds: specialNeeds.join(' '),
      medicalConditions: medicalConditions.join(' '),
      trainingLevel: this.normalizeTrainingLevel(trainingLevel),
      socialization: this.normalizeSocialization(socialization),
      separationAnxiety: separationAnxiety ? 1 : 0,
      aggression: aggression ? 1 : 0,
      houseTrained: houseTrained ? 1 : 0,
      microchipped: microchipped ? 1 : 0,
      spayedNeutered: spayedNeutered ? 1 : 0,
      vaccinations: vaccinations.length
    };
  }

  extractSitterTraits(sitter) {
    const {
      experience = [],
      specializations = [],
      certifications = [],
      availability = {},
      preferences = {},
      ratings = {},
      languages = [],
      hasYard = false,
      hasOtherPets = false,
      childrenAges = [],
      maxPets = 1,
      services = [],
      emergencyTraining = false,
      firstAidCertified = false,
      insurance = false
    } = sitter;

    return {
      experience: experience.join(' '),
      specializations: specializations.join(' '),
      certifications: certifications.join(' '),
      availability: JSON.stringify(availability),
      preferences: JSON.stringify(preferences),
      avgRating: ratings.average || 0,
      totalReviews: ratings.count || 0,
      languages: languages.join(' '),
      hasYard: hasYard ? 1 : 0,
      hasOtherPets: hasOtherPets ? 1 : 0,
      childrenAges: childrenAges.join(' '),
      maxPets: maxPets,
      services: services.join(' '),
      emergencyTraining: emergencyTraining ? 1 : 0,
      firstAidCertified: firstAidCertified ? 1 : 0,
      insurance: insurance ? 1 : 0
    };
  }

  async generateEmbedding(traits) {
    try {
      // Use OpenAI to generate embeddings
      const text = Object.values(traits).join(' ');
      
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.warn('Failed to generate embedding with OpenAI, using fallback:', error);
      
      // Fallback: simple feature vector
      return this.createSimpleEmbedding(traits);
    }
  }

  createSimpleEmbedding(traits) {
    // Create a simple numerical embedding from traits
    const embedding = [];
    
    // Convert string traits to numerical values
    Object.values(traits).forEach(value => {
      if (typeof value === 'number') {
        embedding.push(value);
      } else if (typeof value === 'string') {
        // Simple hash-based embedding
        const hash = value.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        embedding.push(Math.abs(hash) % 100 / 100); // Normalize to 0-1
      } else if (typeof value === 'boolean') {
        embedding.push(value ? 1 : 0);
      }
    });

    // Pad to 50 dimensions
    while (embedding.length < 50) {
      embedding.push(0);
    }

    return embedding.slice(0, 50);
  }

  async calculateContentScores(petEmbedding, sitterEmbeddings) {
    const scores = [];

    for (let i = 0; i < sitterEmbeddings.length; i++) {
      const similarity = this.calculateCosineSimilarity(petEmbedding, sitterEmbeddings[i]);
      scores.push({
        sitterIndex: i,
        score: similarity
      });
    }

    return scores;
  }

  async calculateCollaborativeScores(ownerId, sitters) {
    try {
      const scores = [];

      for (let i = 0; i < sitters.length; i++) {
        const sitterId = sitters[i].id;
        
        // Create input tensor for the model
        const input = tf.tensor2d([[ownerId, sitterId]], [1, 2]);
        
        // Get prediction from collaborative model
        const prediction = this.collaborativeModel.predict(input);
        const score = prediction.dataSync()[0];
        
        scores.push({
          sitterIndex: i,
          score: score
        });
      }

      return scores;
    } catch (error) {
      this.logger.warn('Collaborative filtering failed, using fallback scores:', error);
      
      // Fallback: random scores
      return sitters.map((_, i) => ({
        sitterIndex: i,
        score: Math.random() * 0.5 + 0.5 // Random score between 0.5 and 1.0
      }));
    }
  }

  async getAIRecommendations(petProfile, ownerPreferences, sitters) {
    try {
      const prompt = `Recommend pet sitters for this pet and owner:

Pet Profile:
- Breed: ${petProfile.breed}
- Size: ${petProfile.size}
- Age: ${petProfile.age} years
- Energy Level: ${petProfile.energyLevel}
- Temperament: ${petProfile.temperament?.join(', ')}
- Special Needs: ${petProfile.specialNeeds?.join(', ')}
- Medical Conditions: ${petProfile.medicalConditions?.join(', ')}

Owner Preferences:
- Budget: ${ownerPreferences.budget}
- Location: ${ownerPreferences.location}
- Schedule: ${ownerPreferences.schedule}
- Additional Requirements: ${ownerPreferences.additionalRequirements}

Available Sitters (${sitters.length}):
${sitters.map((s, i) => `${i + 1}. ${s.name} - ${s.experience?.join(', ')} - Rating: ${s.ratings?.average || 'N/A'}`).join('\n')}

Return a JSON array with sitter indices (0-based) and confidence scores (0-1), sorted by best match first.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert pet sitter matchmaker. Analyze pet profiles and owner preferences to recommend the best sitters."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.map(item => ({
        sitterIndex: item.index,
        score: item.confidence
      }));
    } catch (error) {
      this.logger.warn('AI recommendations failed, using fallback:', error);
      
      // Fallback: equal scores for all sitters
      return sitters.map((_, i) => ({
        sitterIndex: i,
        score: 0.7
      }));
    }
  }

  combineScores(contentScores, collaborativeScores, aiScores) {
    const combinedScores = new Map();

    // Combine content-based scores (40% weight)
    contentScores.forEach(({ sitterIndex, score }) => {
      combinedScores.set(sitterIndex, (combinedScores.get(sitterIndex) || 0) + score * 0.4);
    });

    // Combine collaborative scores (30% weight)
    collaborativeScores.forEach(({ sitterIndex, score }) => {
      combinedScores.set(sitterIndex, (combinedScores.get(sitterIndex) || 0) + score * 0.3);
    });

    // Combine AI scores (30% weight)
    aiScores.forEach(({ sitterIndex, score }) => {
      combinedScores.set(sitterIndex, (combinedScores.get(sitterIndex) || 0) + score * 0.3);
    });

    return Array.from(combinedScores.entries()).map(([sitterIndex, score]) => ({
      sitterIndex,
      score
    }));
  }

  rankRecommendations(scores, sitters, limit) {
    // Sort by score (descending)
    const sortedScores = scores.sort((a, b) => b.score - a.score);

    // Return top recommendations with sitter data
    return sortedScores.slice(0, limit).map(({ sitterIndex, score }) => ({
      sitter: sitters[sitterIndex],
      matchScore: score,
      confidence: this.calculateConfidence(score),
      reasons: this.getMatchReasons(sitters[sitterIndex])
    }));
  }

  calculateCosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  calculateConfidence(score) {
    // Convert score to confidence level
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  getMatchReasons(sitter) {
    const reasons = [];
    
    if (sitter.ratings?.average >= 4.5) reasons.push('High ratings');
    if (sitter.experience?.length > 0) reasons.push('Experienced');
    if (sitter.certifications?.length > 0) reasons.push('Certified');
    if (sitter.specializations?.length > 0) reasons.push('Specialized');
    if (sitter.insurance) reasons.push('Insured');
    if (sitter.emergencyTraining) reasons.push('Emergency trained');
    
    return reasons;
  }

  // Utility methods for data normalization
  normalizeSize(size) {
    const sizeMap = { 'small': 0.25, 'medium': 0.5, 'large': 0.75, 'extra-large': 1.0 };
    return sizeMap[size.toLowerCase()] || 0.5;
  }

  normalizeAge(age) {
    return Math.min(age / 20, 1.0); // Normalize to 0-1, max age 20
  }

  normalizeEnergyLevel(level) {
    const energyMap = { 'low': 0.25, 'medium': 0.5, 'high': 0.75, 'very-high': 1.0 };
    return energyMap[level.toLowerCase()] || 0.5;
  }

  normalizeTrainingLevel(level) {
    const trainingMap = { 'none': 0, 'basic': 0.25, 'intermediate': 0.5, 'advanced': 0.75, 'expert': 1.0 };
    return trainingMap[level.toLowerCase()] || 0.25;
  }

  normalizeSocialization(level) {
    const socialMap = { 'poor': 0.25, 'fair': 0.5, 'good': 0.75, 'excellent': 1.0 };
    return socialMap[level.toLowerCase()] || 0.5;
  }

  async trainCollaborativeModel(trainingData) {
    try {
      this.logger.info('Training collaborative filtering model...');
      
      const { features, labels } = this.prepareCollaborativeData(trainingData);
      
      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(labels, [labels.length, 1]);

      await this.collaborativeModel.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2
      });

      await this.collaborativeModel.save('file://./models/collaborative-filtering');
      
      this.logger.info('Collaborative filtering model trained successfully');
    } catch (error) {
      this.logger.error('Error training collaborative model:', error);
      throw error;
    }
  }

  async trainContentModel(trainingData) {
    try {
      this.logger.info('Training content-based model...');
      
      const { features, labels } = this.prepareContentData(trainingData);
      
      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(labels, [labels.length, 1]);

      await this.contentModel.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2
      });

      await this.contentModel.save('file://./models/content-based');
      
      this.logger.info('Content-based model trained successfully');
    } catch (error) {
      this.logger.error('Error training content model:', error);
      throw error;
    }
  }

  prepareCollaborativeData(data) {
    const features = [];
    const labels = [];

    data.forEach(item => {
      features.push([item.ownerId, item.sitterId]);
      labels.push(item.rating > 3 ? 1 : 0); // Binary classification
    });

    return { features, labels };
  }

  prepareContentData(data) {
    const features = [];
    const labels = [];

    data.forEach(item => {
      const combinedFeatures = [...item.petTraits, ...item.sitterTraits];
      features.push(combinedFeatures);
      labels.push(item.compatibility > 0.7 ? 1 : 0);
    });

    return { features, labels };
  }
}

module.exports = { MatchmakingEngine };
