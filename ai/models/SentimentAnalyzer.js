const natural = require('natural');
const { OpenAI } = require('openai');
const winston = require('winston');
const compromise = require('compromise');

class SentimentAnalyzer {
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
        new winston.transports.File({ filename: 'logs/sentiment.log' }),
        new winston.transports.Console()
      ]
    });

    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.tfidf = new natural.TfIdf();
    
    this.positiveWords = new Set([
      'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'love', 'best', 'fantastic',
      'outstanding', 'superb', 'brilliant', 'awesome', 'terrific', 'fabulous', 'incredible',
      'phenomenal', 'exceptional', 'stellar', 'magnificent', 'splendid', 'delightful',
      'charming', 'lovely', 'beautiful', 'gorgeous', 'stunning', 'impressive', 'remarkable',
      'extraordinary', 'outstanding', 'superior', 'premium', 'quality', 'professional',
      'reliable', 'trustworthy', 'caring', 'attentive', 'patient', 'gentle', 'kind',
      'thoughtful', 'considerate', 'responsible', 'dependable', 'punctual', 'clean',
      'organized', 'thorough', 'detailed', 'comprehensive', 'complete', 'thorough'
    ]);

    this.negativeWords = new Set([
      'terrible', 'awful', 'bad', 'horrible', 'worst', 'hate', 'disappointed', 'poor',
      'mediocre', 'subpar', 'inadequate', 'unsatisfactory', 'unacceptable', 'frustrated',
      'angry', 'upset', 'annoyed', 'irritated', 'bothered', 'concerned', 'worried',
      'anxious', 'nervous', 'scared', 'frightened', 'terrified', 'panicked', 'stressed',
      'overwhelmed', 'exhausted', 'tired', 'fatigued', 'drained', 'depleted', 'empty',
      'void', 'missing', 'lost', 'gone', 'disappeared', 'vanished', 'absent', 'lacking',
      'deficient', 'insufficient', 'incomplete', 'partial', 'fragmentary', 'broken',
      'damaged', 'ruined', 'destroyed', 'wrecked', 'shattered', 'crushed', 'devastated'
    ]);

    this.neutralWords = new Set([
      'okay', 'fine', 'alright', 'decent', 'average', 'normal', 'standard', 'regular',
      'typical', 'usual', 'common', 'ordinary', 'basic', 'simple', 'plain', 'modest',
      'adequate', 'sufficient', 'enough', 'satisfactory', 'acceptable', 'passable',
      'reasonable', 'fair', 'balanced', 'moderate', 'middle', 'central', 'neutral',
      'indifferent', 'unconcerned', 'uninterested', 'apathetic', 'dispassionate'
    ]);

    this.emotionKeywords = {
      joy: ['happy', 'joyful', 'excited', 'thrilled', 'delighted', 'pleased', 'satisfied'],
      sadness: ['sad', 'disappointed', 'upset', 'unhappy', 'depressed', 'melancholy'],
      anger: ['angry', 'furious', 'mad', 'irritated', 'annoyed', 'frustrated'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'terrified'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned'],
      trust: ['trust', 'reliable', 'dependable', 'faithful', 'loyal', 'honest'],
      anticipation: ['excited', 'eager', 'looking forward', 'anticipating'],
      disgust: ['disgusted', 'repulsed', 'revolted', 'sickened', 'appalled']
    };

    this.themeKeywords = {
      communication: ['communication', 'responsive', 'reply', 'message', 'text', 'call', 'update'],
      punctuality: ['punctual', 'on time', 'late', 'early', 'schedule', 'timing'],
      care: ['care', 'attention', 'gentle', 'patient', 'loving', 'caring', 'nurturing'],
      cleanliness: ['clean', 'tidy', 'organized', 'messy', 'dirty', 'neat'],
      safety: ['safe', 'secure', 'protective', 'watchful', 'vigilant', 'careful'],
      experience: ['experienced', 'knowledgeable', 'skilled', 'professional', 'expert'],
      flexibility: ['flexible', 'accommodating', 'understanding', 'patient', 'adaptable'],
      value: ['worth', 'value', 'price', 'cost', 'expensive', 'affordable', 'reasonable'],
      reliability: ['reliable', 'dependable', 'consistent', 'trustworthy', 'steady'],
      personality: ['friendly', 'warm', 'personable', 'approachable', 'kind', 'nice']
    };

    this.initializeClassifier();
  }

  async initializeClassifier() {
    try {
      // Train the classifier with sample data
      this.trainClassifier();
      this.logger.info('Sentiment Analyzer initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Sentiment Analyzer:', error);
    }
  }

  trainClassifier() {
    // Train with positive examples
    this.classifier.addDocument('great service and very caring', 'positive');
    this.classifier.addDocument('excellent experience with the sitter', 'positive');
    this.classifier.addDocument('amazing care for my pet', 'positive');
    this.classifier.addDocument('wonderful and professional', 'positive');
    this.classifier.addDocument('perfect match for our needs', 'positive');
    this.classifier.addDocument('love how they treated my dog', 'positive');
    this.classifier.addDocument('best sitter we have found', 'positive');
    this.classifier.addDocument('fantastic communication throughout', 'positive');
    this.classifier.addDocument('outstanding reliability and trust', 'positive');
    this.classifier.addDocument('superb attention to detail', 'positive');

    // Train with negative examples
    this.classifier.addDocument('terrible experience with the sitter', 'negative');
    this.classifier.addDocument('awful service and unprofessional', 'negative');
    this.classifier.addDocument('bad communication and late', 'negative');
    this.classifier.addDocument('horrible care for my pet', 'negative');
    this.classifier.addDocument('worst sitter we have used', 'negative');
    this.classifier.addDocument('hate how they handled everything', 'negative');
    this.classifier.addDocument('disappointed with the service', 'negative');
    this.classifier.addDocument('poor quality of care provided', 'negative');
    this.classifier.addDocument('mediocre experience overall', 'negative');
    this.classifier.addDocument('unsatisfactory and unreliable', 'negative');

    // Train with neutral examples
    this.classifier.addDocument('okay service and adequate care', 'neutral');
    this.classifier.addDocument('fine experience with the sitter', 'neutral');
    this.classifier.addDocument('alright but nothing special', 'neutral');
    this.classifier.addDocument('decent care for my pet', 'neutral');
    this.classifier.addDocument('average service quality', 'neutral');
    this.classifier.addDocument('normal experience overall', 'neutral');
    this.classifier.addDocument('standard care provided', 'neutral');
    this.classifier.addDocument('regular service as expected', 'neutral');
    this.classifier.addDocument('typical sitter experience', 'neutral');
    this.classifier.addDocument('usual quality of care', 'neutral');

    this.classifier.train();
  }

  async analyzeReview(reviewText) {
    try {
      this.logger.info('Analyzing review sentiment');

      // Clean and preprocess the text
      const cleanedText = this.preprocessText(reviewText);
      
      // Get multiple sentiment scores
      const traditionalScore = this.calculateTraditionalSentiment(cleanedText);
      const classifierScore = this.calculateClassifierSentiment(cleanedText);
      const aiScore = await this.calculateAISentiment(cleanedText);
      
      // Extract themes and emotions
      const themes = this.extractThemes(cleanedText);
      const emotions = this.extractEmotions(cleanedText);
      const keywords = this.extractKeywords(cleanedText);
      
      // Combine scores with weights
      const combinedScore = this.combineSentimentScores(traditionalScore, classifierScore, aiScore);
      
      // Determine overall sentiment
      const sentiment = this.determineSentiment(combinedScore);
      
      // Generate insights
      const insights = this.generateInsights(cleanedText, sentiment, themes, emotions);

      const result = {
        text: reviewText,
        sentiment: sentiment,
        score: combinedScore,
        confidence: this.calculateConfidence(cleanedText),
        themes: themes,
        emotions: emotions,
        keywords: keywords,
        insights: insights,
        analysis: {
          traditional: traditionalScore,
          classifier: classifierScore,
          ai: aiScore
        },
        timestamp: new Date().toISOString()
      };

      this.logger.info(`Sentiment analysis completed: ${sentiment} (${combinedScore.toFixed(3)})`);
      
      return result;
    } catch (error) {
      this.logger.error('Error analyzing review sentiment:', error);
      throw error;
    }
  }

  preprocessText(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Convert to lowercase
    let cleaned = text.toLowerCase();
    
    // Remove special characters but keep spaces and basic punctuation
    cleaned = cleaned.replace(/[^\w\s.,!?;:()]/g, '');
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  calculateTraditionalSentiment(text) {
    if (!text) return 0.5;

    const words = this.tokenizer.tokenize(text) || [];
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    let totalWords = 0;

    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length < 2) return; // Skip very short words
      
      totalWords++;
      
      if (this.positiveWords.has(cleanWord)) {
        positiveCount++;
      } else if (this.negativeWords.has(cleanWord)) {
        negativeCount++;
      } else if (this.neutralWords.has(cleanWord)) {
        neutralCount++;
      }
    });

    if (totalWords === 0) return 0.5;

    // Calculate sentiment score (-1 to 1, then normalize to 0-1)
    const sentiment = (positiveCount - negativeCount) / totalWords;
    return Math.max(0, Math.min(1, (sentiment + 1) / 2));
  }

  calculateClassifierSentiment(text) {
    if (!text) return 0.5;

    try {
      const classification = this.classifier.classify(text);
      const probabilities = this.classifier.getClassifications(text);
      
      // Get probability for the classified sentiment
      const probability = probabilities.find(p => p.label === classification)?.value || 0.5;
      
      // Convert classification to score
      let score = 0.5; // neutral
      if (classification === 'positive') score = 0.5 + (probability * 0.5);
      else if (classification === 'negative') score = 0.5 - (probability * 0.5);
      
      return Math.max(0, Math.min(1, score));
    } catch (error) {
      this.logger.warn('Classifier sentiment calculation failed:', error);
      return 0.5;
    }
  }

  async calculateAISentiment(text) {
    if (!text) return 0.5;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Analyze the sentiment of this pet sitter review. Return a JSON object with 'sentiment' (positive/negative/neutral), 'score' (0-1, where 1 is very positive), and 'confidence' (0-1)."
          },
          {
            role: "user",
            content: `Analyze this review: "${text}"`
          }
        ],
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.score || 0.5;
    } catch (error) {
      this.logger.warn('AI sentiment calculation failed, using fallback:', error);
      return 0.5;
    }
  }

  combineSentimentScores(traditional, classifier, ai) {
    // Weight the different approaches
    const weights = {
      traditional: 0.2,
      classifier: 0.3,
      ai: 0.5
    };

    return (traditional * weights.traditional) + 
           (classifier * weights.classifier) + 
           (ai * weights.ai);
  }

  determineSentiment(score) {
    if (score >= 0.7) return 'positive';
    if (score <= 0.3) return 'negative';
    return 'neutral';
  }

  extractThemes(text) {
    const themes = {};
    const words = this.tokenizer.tokenize(text) || [];

    Object.entries(this.themeKeywords).forEach(([theme, keywords]) => {
      let count = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          count++;
        }
      });
      
      if (count > 0) {
        themes[theme] = {
          count: count,
          relevance: Math.min(count / keywords.length, 1)
        };
      }
    });

    return themes;
  }

  extractEmotions(text) {
    const emotions = {};
    const words = this.tokenizer.tokenize(text) || [];

    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      let count = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          count++;
        }
      });
      
      if (count > 0) {
        emotions[emotion] = {
          count: count,
          intensity: Math.min(count / keywords.length, 1)
        };
      }
    });

    return emotions;
  }

  extractKeywords(text) {
    if (!text) return [];

    // Use TF-IDF to extract important keywords
    this.tfidf.addDocument(text);
    
    const terms = this.tfidf.listTerms(0);
    const keywords = terms
      .slice(0, 10) // Top 10 keywords
      .filter(term => term.score > 0.1) // Filter by relevance
      .map(term => ({
        word: term.term,
        score: term.score,
        frequency: term.count
      }));

    // Clear the TF-IDF for next use
    this.tfidf = new natural.TfIdf();
    
    return keywords;
  }

  calculateConfidence(text) {
    if (!text) return 0.5;

    const words = this.tokenizer.tokenize(text) || [];
    let confidence = 0.5; // Base confidence

    // More words = higher confidence (up to a point)
    if (words.length >= 10) confidence += 0.2;
    if (words.length >= 20) confidence += 0.1;
    if (words.length >= 50) confidence += 0.1;

    // Presence of sentiment words increases confidence
    const sentimentWords = words.filter(word => 
      this.positiveWords.has(word) || 
      this.negativeWords.has(word) || 
      this.neutralWords.has(word)
    );
    
    if (sentimentWords.length > 0) {
      confidence += Math.min(sentimentWords.length / words.length, 0.2);
    }

    return Math.min(1, confidence);
  }

  generateInsights(text, sentiment, themes, emotions) {
    const insights = [];

    // Sentiment-based insights
    if (sentiment === 'positive') {
      insights.push('Overall positive experience');
      if (themes.care) insights.push('Good care and attention provided');
      if (themes.communication) insights.push('Effective communication');
      if (themes.reliability) insights.push('Reliable and trustworthy service');
    } else if (sentiment === 'negative') {
      insights.push('Overall negative experience');
      if (themes.communication) insights.push('Communication issues identified');
      if (themes.punctuality) insights.push('Timing or punctuality concerns');
      if (themes.care) insights.push('Care quality concerns');
    } else {
      insights.push('Neutral or mixed experience');
    }

    // Theme-based insights
    Object.entries(themes).forEach(([theme, data]) => {
      if (data.relevance > 0.5) {
        insights.push(`Strong focus on ${theme}`);
      }
    });

    // Emotion-based insights
    Object.entries(emotions).forEach(([emotion, data]) => {
      if (data.intensity > 0.5) {
        insights.push(`Expressed ${emotion} in review`);
      }
    });

    // Length-based insights
    const wordCount = this.tokenizer.tokenize(text)?.length || 0;
    if (wordCount < 10) {
      insights.push('Brief review - limited detail');
    } else if (wordCount > 50) {
      insights.push('Detailed review with comprehensive feedback');
    }

    return insights;
  }

  async analyzeBatchReviews(reviews) {
    try {
      this.logger.info(`Analyzing batch of ${reviews.length} reviews`);

      const results = [];
      const batchSize = 5; // Process in batches to avoid rate limits

      for (let i = 0; i < reviews.length; i += batchSize) {
        const batch = reviews.slice(i, i + batchSize);
        const batchPromises = batch.map(review => this.analyzeReview(review));
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Add delay between batches to respect rate limits
        if (i + batchSize < reviews.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Calculate aggregate statistics
      const aggregateStats = this.calculateAggregateStats(results);

      return {
        reviews: results,
        aggregate: aggregateStats,
        totalReviews: reviews.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error analyzing batch reviews:', error);
      throw error;
    }
  }

  calculateAggregateStats(results) {
    const stats = {
      averageSentiment: 0,
      sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
      commonThemes: {},
      commonEmotions: {},
      averageConfidence: 0,
      totalReviews: results.length
    };

    if (results.length === 0) return stats;

    let totalScore = 0;
    let totalConfidence = 0;
    const allThemes = {};
    const allEmotions = {};

    results.forEach(result => {
      totalScore += result.score;
      totalConfidence += result.confidence;
      stats.sentimentDistribution[result.sentiment]++;

      // Aggregate themes
      Object.entries(result.themes).forEach(([theme, data]) => {
        if (!allThemes[theme]) allThemes[theme] = { count: 0, totalRelevance: 0 };
        allThemes[theme].count++;
        allThemes[theme].totalRelevance += data.relevance;
      });

      // Aggregate emotions
      Object.entries(result.emotions).forEach(([emotion, data]) => {
        if (!allEmotions[emotion]) allEmotions[emotion] = { count: 0, totalIntensity: 0 };
        allEmotions[emotion].count++;
        allEmotions[emotion].totalIntensity += data.intensity;
      });
    });

    stats.averageSentiment = totalScore / results.length;
    stats.averageConfidence = totalConfidence / results.length;

    // Calculate average relevance/intensity for themes and emotions
    Object.entries(allThemes).forEach(([theme, data]) => {
      stats.commonThemes[theme] = {
        frequency: data.count / results.length,
        averageRelevance: data.totalRelevance / data.count
      };
    });

    Object.entries(allEmotions).forEach(([emotion, data]) => {
      stats.commonEmotions[emotion] = {
        frequency: data.count / results.length,
        averageIntensity: data.totalIntensity / data.count
      };
    });

    return stats;
  }
}

module.exports = { SentimentAnalyzer };
