const { pawfectAI } = require('./index');

// Example usage of Pawfect AI features
async function exampleUsage() {
  console.log('🐾 Pawfect AI - Example Usage\n');

  try {
    // Wait for AI initialization
    console.log('Initializing AI services...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Example 1: Calculate Trust Score
    console.log('\n1. 📊 Trust Score Analysis');
    const sitterData = {
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
        { text: 'Great experience, highly recommend!', rating: 5 }
      ],
      cancellationRate: 0.05,
      onTimeRate: 0.98,
      communicationScore: 4.9
    };

    const trustScore = await pawfectAI.calculateTrustScore('sitter_001', sitterData);
    console.log(`Trust Score: ${(trustScore.score * 100).toFixed(1)}%`);
    console.log(`Confidence: ${(trustScore.confidence * 100).toFixed(1)}%`);
    console.log(`Factors: ${trustScore.factors.join(', ')}`);

    // Example 2: Sentiment Analysis
    console.log('\n2. 🧠 Review Sentiment Analysis');
    const reviews = [
      'Excellent service! Very caring and professional.',
      'Great experience, highly recommend!',
      'Very reliable and trustworthy.',
      'Good service but could be more punctual.',
      'Amazing care for my pet, will definitely book again!'
    ];

    const sentimentAnalysis = await pawfectAI.analyzeBatchReviews(reviews);
    console.log(`Average Sentiment: ${(sentimentAnalysis.aggregate.averageSentiment * 100).toFixed(1)}%`);
    console.log(`Sentiment Distribution:`, sentimentAnalysis.aggregate.sentimentDistribution);
    console.log(`Common Themes:`, Object.keys(sentimentAnalysis.aggregate.commonThemes));

    // Example 3: Matchmaking Recommendations
    console.log('\n3. 🎯 Sitter Matchmaking');
    const petProfile = {
      id: 'pet_001',
      breed: 'Golden Retriever',
      size: 'large',
      age: 3,
      energyLevel: 'high',
      temperament: ['friendly', 'playful', 'gentle'],
      specialNeeds: [],
      medicalConditions: [],
      trainingLevel: 'intermediate',
      socialization: 'excellent'
    };

    const ownerPreferences = {
      budget: 'standard',
      location: 'downtown',
      schedule: 'flexible',
      duration: 8,
      preferredTime: 'morning',
      additionalRequirements: 'Must be good with children'
    };

    const availableSitters = [
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

    const recommendations = await pawfectAI.getRecommendations(
      petProfile,
      ownerPreferences,
      availableSitters,
      3
    );

    console.log(`Found ${recommendations.length} recommendations:`);
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.sitter.name} - Match: ${(rec.matchScore * 100).toFixed(1)}%`);
      console.log(`   Confidence: ${rec.confidence}, Reasons: ${rec.reasons.join(', ')}`);
    });

    // Example 4: Smart Booking Suggestions
    console.log('\n4. ⏰ Smart Booking Time Suggestions');
    const timeSuggestions = await pawfectAI.getTimeSuggestions(
      'pet_001',
      'sitter_001',
      ownerPreferences,
      7
    );

    console.log(`Generated ${timeSuggestions.suggestions.length} time suggestions:`);
    timeSuggestions.suggestions.slice(0, 3).forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.date} ${suggestion.startTime}-${suggestion.endTime}`);
      console.log(`   Score: ${(suggestion.score * 100).toFixed(1)}%, Reasoning: ${suggestion.reasoning}`);
    });

    // Example 5: Comprehensive Sitter Analysis
    console.log('\n5. 🔍 Comprehensive Sitter Profile Analysis');
    const sitterAnalysis = await pawfectAI.analyzeSitterProfile(
      'sitter_001',
      sitterData,
      reviews
    );

    console.log(`Sitter Analysis for ${sitterAnalysis.sitterId}:`);
    console.log(`Trust Score: ${(sitterAnalysis.trustScore.score * 100).toFixed(1)}%`);
    console.log(`Overall Insights: ${sitterAnalysis.overallInsights.join(', ')}`);

    // Example 6: Enhanced Recommendations
    console.log('\n6. 🚀 Enhanced Recommendations with Time Suggestions');
    const enhancedRecommendations = await pawfectAI.getEnhancedRecommendations(
      petProfile,
      ownerPreferences,
      availableSitters,
      3
    );

    console.log(`Enhanced recommendations for ${enhancedRecommendations.petId}:`);
    console.log(`Found ${enhancedRecommendations.recommendations.length} recommendations`);
    console.log(`Generated ${enhancedRecommendations.timeSuggestions.length} time suggestion sets`);
    console.log(`Insights: ${enhancedRecommendations.insights.join(', ')}`);

    // Example 7: Health Check
    console.log('\n7. 🏥 System Health Check');
    const health = await pawfectAI.healthCheck();
    console.log(`Status: ${health.status}`);
    console.log(`Services:`, health.services);
    console.log(`Models:`, health.models);

    // Example 8: Performance Metrics
    console.log('\n8. 📈 Performance Metrics');
    const metrics = await pawfectAI.getPerformanceMetrics();
    console.log(`Average Response Times:`);
    Object.entries(metrics.averageResponseTime).forEach(([service, time]) => {
      console.log(`  ${service}: ${time}ms`);
    });
    console.log(`Accuracy Scores:`);
    Object.entries(metrics.accuracy).forEach(([service, accuracy]) => {
      console.log(`  ${service}: ${(accuracy * 100).toFixed(1)}%`);
    });

    console.log('\n✅ All AI features working successfully!');

  } catch (error) {
    console.error('❌ Error in example usage:', error.message);
  }
}

// Run the example
if (require.main === module) {
  exampleUsage();
}

module.exports = { exampleUsage };
