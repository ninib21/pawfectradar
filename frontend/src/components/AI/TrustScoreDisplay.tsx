import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrustScoreAnalysis } from '../../services/AIIntegrationService';

interface TrustScoreDisplayProps {
  trustScore: TrustScoreAnalysis;
  onPress?: () => void;
  showDetails?: boolean;
}

export const TrustScoreDisplay: React.FC<TrustScoreDisplayProps> = ({
  trustScore,
  onPress,
  showDetails = false,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#10B981'; // Green
    if (score >= 0.6) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10B981';
    if (confidence >= 0.6) return '#F59E0B';
    return '#EF4444';
  };

  const renderFactorBar = (label: string, value: number, maxValue: number = 1) => {
    const percentage = (value / maxValue) * 100;
    const color = getScoreColor(value);

    return (
      <View style={styles.factorContainer}>
        <View style={styles.factorHeader}>
          <Text style={styles.factorLabel}>{label}</Text>
          <Text style={styles.factorValue}>{Math.round(percentage)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Trust Score</Text>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreValue, { color: getScoreColor(trustScore.overallScore) }]}>
                {Math.round(trustScore.overallScore * 100)}
              </Text>
            </View>
            <Text style={[styles.scoreText, { color: getScoreColor(trustScore.overallScore) }]}>
              {getScoreLabel(trustScore.overallScore)}
            </Text>
          </View>
          
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <View style={[styles.confidenceIndicator, { backgroundColor: getConfidenceColor(trustScore.confidence) }]}>
              <Text style={styles.confidenceValue}>
                {Math.round(trustScore.confidence * 100)}%
              </Text>
            </View>
          </View>
        </View>

        {showDetails && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Score Breakdown</Text>
            
            {renderFactorBar('Reviews', trustScore.factors.reviews)}
            {renderFactorBar('Completion Rate', trustScore.factors.completionRate)}
            {renderFactorBar('Response Time', trustScore.factors.responseTime)}
            {renderFactorBar('Verification', trustScore.factors.verification)}
            {renderFactorBar('Experience', trustScore.factors.experience)}

            {trustScore.insights.length > 0 && (
              <View style={styles.insightsContainer}>
                <Text style={styles.insightsTitle}>AI Insights</Text>
                {trustScore.insights.slice(0, 3).map((insight, index) => (
                  <Text key={index} style={styles.insightText}>
                    • {insight}
                  </Text>
                ))}
              </View>
            )}

            {trustScore.recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Recommendations</Text>
                {trustScore.recommendations.slice(0, 2).map((recommendation, index) => (
                  <Text key={index} style={styles.recommendationText}>
                    • {recommendation}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by AI • Updated {new Date().toLocaleDateString()}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#374151',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  confidenceIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  factorContainer: {
    marginBottom: 12,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  factorLabel: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  factorValue: {
    fontSize: 14,
    color: '#F9FAFB',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 12,
    color: '#D1D5DB',
    marginBottom: 4,
    lineHeight: 16,
  },
  recommendationsContainer: {
    marginTop: 12,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 12,
    color: '#D1D5DB',
    marginBottom: 4,
    lineHeight: 16,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#6B7280',
  },
});
