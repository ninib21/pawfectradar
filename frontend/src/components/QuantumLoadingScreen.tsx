// 🚀 QUANTUM PAWFECT SITTERS - QUANTUM LOADING SCREEN
// 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED LOADING
// 📈 QUANTUM-INFINITE SCALABILITY
// 🚀 QUANTUM-OPTIMIZED PERFORMANCE

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuantumLoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  variant?: 'paws' | 'spinner' | 'dots' | 'quantum';
}

export const QuantumLoadingScreen: React.FC<QuantumLoadingScreenProps> = ({
  message = 'Loading...',
  showProgress = false,
  progress = 0,
  variant = 'quantum',
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous animations
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    rotateAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const renderLoadingIndicator = () => {
    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    switch (variant) {
      case 'paws':
        return (
          <Animated.View
            style={[
              styles.pawsContainer,
              {
                transform: [
                  { scale: pulseAnim },
                  { rotate },
                ],
              },
            ]}
          >
            <Ionicons name="paw" size={60} color="#007AFF" />
          </Animated.View>
        );

      case 'spinner':
        return (
          <ActivityIndicator size="large" color="#007AFF" />
        );

      case 'dots':
        return (
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity: pulseAnim,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
            ))}
          </View>
        );

      case 'quantum':
      default:
        return (
          <Animated.View
            style={[
              styles.quantumContainer,
              {
                transform: [
                  { scale: pulseAnim },
                  { rotate },
                ],
              },
            ]}
          >
            <View style={styles.quantumRing} />
            <View style={[styles.quantumRing, styles.quantumRingInner]} />
            <View style={styles.quantumCore}>
              <Ionicons name="flash" size={24} color="#FFFFFF" />
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {renderLoadingIndicator()}
        
        <Text style={styles.message}>{message}</Text>
        
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, Math.max(0, progress))}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    minWidth: 200,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // Paws variant
  pawsContainer: {
    marginBottom: 20,
  },
  
  // Dots variant
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginHorizontal: 4,
  },
  
  // Quantum variant
  quantumContainer: {
    width: 80,
    height: 80,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantumRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#007AFF',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  quantumRingInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: '#34C759',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  quantumCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Text styles
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 10,
  },
  
  // Progress styles
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
});
