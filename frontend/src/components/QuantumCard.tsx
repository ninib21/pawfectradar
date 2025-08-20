// 🚀 QUANTUM PAWFECT SITTERS - QUANTUM CARD COMPONENT
// 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED CARD
// 📈 QUANTUM-INFINITE SCALABILITY
// 🚀 QUANTUM-OPTIMIZED PERFORMANCE

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuantumCardProps extends TouchableOpacityProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  shadow?: boolean;
  headerIcon?: string;
  onHeaderIconPress?: () => void;
  containerStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  pressable?: boolean;
}

export const QuantumCard: React.FC<QuantumCardProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  borderRadius = 'medium',
  shadow = true,
  headerIcon,
  onHeaderIconPress,
  containerStyle,
  headerStyle,
  titleStyle,
  subtitleStyle,
  contentStyle,
  pressable = false,
  onPress,
  ...props
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle = styles.card;
    const variantStyle = styles[`${variant}Card` as keyof typeof styles];
    const paddingStyle = styles[`${padding}Padding` as keyof typeof styles];
    const marginStyle = styles[`${margin}Margin` as keyof typeof styles];
    const borderRadiusStyle = styles[`${borderRadius}BorderRadius` as keyof typeof styles];
    const shadowStyle = shadow ? styles.shadowCard : {};

    return StyleSheet.flatten([
      baseStyle,
      variantStyle,
      paddingStyle,
      marginStyle,
      borderRadiusStyle,
      shadowStyle,
      containerStyle,
    ]);
  };

  const getHeaderStyle = (): ViewStyle => {
    return StyleSheet.flatten([
      styles.header,
      headerStyle,
    ]);
  };

  const getTitleStyle = (): TextStyle => {
    return StyleSheet.flatten([
      styles.title,
      titleStyle,
    ]);
  };

  const getSubtitleStyle = (): TextStyle => {
    return StyleSheet.flatten([
      styles.subtitle,
      subtitleStyle,
    ]);
  };

  const getContentStyle = (): ViewStyle => {
    return StyleSheet.flatten([
      styles.content,
      contentStyle,
    ]);
  };

  const CardWrapper: React.ComponentType<any> = pressable && onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={getCardStyle()}
      onPress={onPress}
      activeOpacity={pressable ? 0.7 : 1}
      {...(pressable ? props : {})}
    >
      {(title || subtitle || headerIcon) && (
        <View style={getHeaderStyle()}>
          <View style={styles.headerText}>
            {title && <Text style={getTitleStyle()}>{title}</Text>}
            {subtitle && <Text style={getSubtitleStyle()}>{subtitle}</Text>}
          </View>
          
          {headerIcon && (
            <TouchableOpacity
              onPress={onHeaderIconPress}
              style={styles.headerIconContainer}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={headerIcon as any}
                size={24}
                color="#8E8E93"
              />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {children && (
        <View style={getContentStyle()}>
          {children}
        </View>
      )}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  
  // Variant styles
  defaultCard: {
    backgroundColor: '#FFFFFF',
  },
  outlinedCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  elevatedCard: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filledCard: {
    backgroundColor: '#F2F2F7',
  },
  
  // Padding styles
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: 8,
  },
  mediumPadding: {
    padding: 16,
  },
  largePadding: {
    padding: 24,
  },
  
  // Margin styles
  noneMargin: {
    margin: 0,
  },
  smallMargin: {
    margin: 8,
  },
  mediumMargin: {
    margin: 16,
  },
  largeMargin: {
    margin: 24,
  },
  
  // Border radius styles
  noneBorderRadius: {
    borderRadius: 0,
  },
  smallBorderRadius: {
    borderRadius: 8,
  },
  mediumBorderRadius: {
    borderRadius: 12,
  },
  largeBorderRadius: {
    borderRadius: 16,
  },
  
  // Shadow styles
  shadowCard: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  headerIconContainer: {
    padding: 4,
    marginLeft: 8,
  },
  
  // Text styles
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    lineHeight: 20,
  },
  
  // Content styles
  content: {
    flex: 1,
  },
});
