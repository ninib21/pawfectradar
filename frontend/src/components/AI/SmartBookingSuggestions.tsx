import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SmartBookingSuggestion } from '../../services/AIIntegrationService';

interface SmartBookingSuggestionsProps {
  suggestions: SmartBookingSuggestion[];
  onSelectSuggestion: (suggestion: SmartBookingSuggestion) => void;
  isLoading?: boolean;
}

export const SmartBookingSuggestions: React.FC<SmartBookingSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
  isLoading = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10B981';
    if (confidence >= 0.6) return '#F59E0B';
    return '#EF4444';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const handleSelectSuggestion = (suggestion: SmartBookingSuggestion, index: number) => {
    setSelectedIndex(index);
    onSelectSuggestion(suggestion);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.loadingGradient}
        >
          <Text style={styles.loadingText}>🤖 AI is analyzing optimal times...</Text>
          <View style={styles.loadingSpinner}>
            <Text style={styles.spinnerText}>⏳</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.emptyGradient}
        >
          <Text style={styles.emptyTitle}>No Smart Suggestions Available</Text>
          <Text style={styles.emptyText}>
            AI couldn't find optimal booking times based on current data.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🤖 Smart Booking Suggestions</Text>
          <Text style={styles.subtitle}>
            AI-optimized times based on pet behavior and sitter availability
          </Text>
        </View>

        <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.suggestionCard,
                selectedIndex === index && styles.selectedCard,
              ]}
              onPress={() => handleSelectSuggestion(suggestion, index)}
            >
              <View style={styles.suggestionHeader}>
                <View style={styles.timeContainer}>
                  <Text style={styles.dateText}>
                    {formatDate(suggestion.startTime)}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatTime(suggestion.startTime)} - {formatTime(suggestion.endTime)}
                  </Text>
                </View>
                
                <View style={styles.confidenceContainer}>
                  <View style={[
                    styles.confidenceBadge,
                    { backgroundColor: getConfidenceColor(suggestion.confidence) }
                  ]}>
                    <Text style={styles.confidenceText}>
                      {getConfidenceLabel(suggestion.confidence)}
                    </Text>
                  </View>
                  <Text style={styles.confidenceValue}>
                    {Math.round(suggestion.confidence * 100)}%
                  </Text>
                </View>
              </View>

              {suggestion.reasons.length > 0 && (
                <View style={styles.reasonsContainer}>
                  <Text style={styles.reasonsTitle}>Why this time?</Text>
                  {suggestion.reasons.slice(0, 2).map((reason, reasonIndex) => (
                    <Text key={reasonIndex} style={styles.reasonText}>
                      • {reason}
                    </Text>
                  ))}
                </View>
              )}

              {suggestion.petBehaviorFactors.length > 0 && (
                <View style={styles.behaviorContainer}>
                  <Text style={styles.behaviorTitle}>Pet Behavior Factors</Text>
                  {suggestion.petBehaviorFactors.slice(0, 2).map((factor, factorIndex) => (
                    <Text key={factorIndex} style={styles.behaviorText}>
                      🐾 {factor}
                    </Text>
                  ))}
                </View>
              )}

              {selectedIndex === index && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓ Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Tap a suggestion to auto-fill your booking details
          </Text>
        </View>
      </LinearGradient>
    </View>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  suggestionsContainer: {
    maxHeight: 400,
  },
  suggestionCard: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#10B981',
    backgroundColor: '#065F46',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timeContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  confidenceValue: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reasonsContainer: {
    marginBottom: 8,
  },
  reasonsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
    lineHeight: 14,
  },
  behaviorContainer: {
    marginBottom: 8,
  },
  behaviorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 4,
  },
  behaviorText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
    lineHeight: 14,
  },
  selectedIndicator: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  selectedText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  loadingGradient: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#F9FAFB',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerText: {
    fontSize: 20,
  },
  emptyContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  emptyGradient: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
