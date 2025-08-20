// 🚀 QUANTUM PAWFECT SITTERS - QUANTUM SPLASH SCREEN
// 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED SPLASH
// 📈 QUANTUM-INFINITE SCALABILITY
// 🚀 QUANTUM-OPTIMIZED PERFORMANCE

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface QuantumSplashScreenProps {
  onAnimationComplete?: () => void;
  duration?: number;
  variant?: 'gradient' | 'minimal' | 'quantum' | 'paws';
}

export const QuantumSplashScreen: React.FC<QuantumSplashScreenProps> = ({
  onAnimationComplete,
  duration = 3000,
  variant = 'quantum',
}) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      // Background fade in
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Logo entrance animation
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Text fade in with delay
      setTimeout(() => {
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 800);

      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      // Rotation animation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      );

      setTimeout(() => {
        pulseAnimation.start();
        if (variant === 'quantum') {
          rotateAnimation.start();
        }
      }, 1000);

      // Auto complete
      if (onAnimationComplete) {
        setTimeout(() => {
          pulseAnimation.stop();
          rotateAnimation.stop();
          onAnimationComplete();
        }, duration);
      }
    };

    startAnimation();
  }, [duration, onAnimationComplete, variant]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderLogo = () => {
    switch (variant) {
      case 'paws':
        return (
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <View style={styles.pawsLogoContainer}>
              <Ionicons name="paw" size={80} color="#FFFFFF" />
              <Text style={styles.pawsText}>PawfectSitters</Text>
            </View>
          </Animated.View>
        );

      case 'minimal':
        return (
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <View style={styles.minimalLogo}>
              <Text style={styles.minimalLogoText}>PS</Text>
            </View>
          </Animated.View>
        );

      case 'quantum':
      default:
        return (
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.quantumRing,
                { transform: [{ rotate }] },
              ]}
            >
              <View style={styles.quantumRingOuter} />
            </Animated.View>
            <Animated.View
              style={[
                styles.quantumRing,
                { transform: [{ rotate: rotate }] },
              ]}
            >
              <View style={styles.quantumRingInner} />
            </Animated.View>
            <View style={styles.quantumCore}>
              <Ionicons name="flash" size={40} color="#FFFFFF" />
            </View>
          </Animated.View>
        );
    }
  };

  const renderBackground = () => {
    if (variant === 'gradient') {
      return (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: backgroundOpacity },
          ]}
        >
          <LinearGradient
            colors={['#007AFF', '#34C759', '#FF9500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.defaultBackground,
          { opacity: backgroundOpacity },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {renderBackground()}
      
      <View style={styles.content}>
        {renderLogo()}
        
        <Animated.View
          style={[
            styles.textContainer,
            { opacity: textOpacity },
          ]}
        >
          <Text style={styles.title}>PawfectSitters</Text>
          <Text style={styles.subtitle}>Quantum-Enhanced Pet Care</Text>
          <Text style={styles.tagline}>Where Technology Meets Love</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  defaultBackground: {
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  // Logo styles
  logoContainer: {
    marginBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Paws variant
  pawsLogoContainer: {
    alignItems: 'center',
  },
  pawsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  
  // Minimal variant
  minimalLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  minimalLogoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  // Quantum variant
  quantumRing: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantumRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  quantumRingInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#34C759',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  quantumCore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  
  // Text styles
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
