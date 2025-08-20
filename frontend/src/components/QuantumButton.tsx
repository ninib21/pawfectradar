// 🚀 QUANTUM PAWFECT SITTERS - QUANTUM BUTTON COMPONENT
// 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED BUTTON
// 📈 QUANTUM-INFINITE SCALABILITY
// 🚀 QUANTUM-OPTIMIZED PERFORMANCE

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuantumButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export const QuantumButton: React.FC<QuantumButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  containerStyle,
  textStyle,
  onPress,
  ...props
}) => {
  const handlePress = (event: any) => {
    if (!loading && !disabled && onPress) {
      onPress(event);
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.button;
    const variantStyle = styles[`${variant}Button` as keyof typeof styles];
    const sizeStyle = styles[`${size}Button` as keyof typeof styles];
    const disabledStyle = (disabled || loading) ? styles.disabledButton : {};
    const fullWidthStyle = fullWidth ? styles.fullWidthButton : {};

    return StyleSheet.flatten([
      baseStyle,
      variantStyle,
      sizeStyle,
      disabledStyle,
      fullWidthStyle,
      containerStyle,
    ]);
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = styles.text;
    const variantStyle = styles[`${variant}Text` as keyof typeof styles];
    const sizeStyle = styles[`${size}Text` as keyof typeof styles];
    const disabledStyle = (disabled || loading) ? styles.disabledText : {};

    return StyleSheet.flatten([
      baseStyle,
      variantStyle,
      sizeStyle,
      disabledStyle,
      textStyle,
    ]);
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const getIconColor = () => {
    if (disabled || loading) {
      return variant === 'outline' || variant === 'ghost' ? '#C7C7CC' : '#FFFFFF';
    }
    
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return '#FFFFFF';
      case 'danger':
        return '#FFFFFF';
      case 'outline':
        return '#007AFF';
      case 'ghost':
        return '#007AFF';
      default:
        return '#FFFFFF';
    }
  };

  const getLoadingColor = () => {
    return variant === 'outline' || variant === 'ghost' ? '#007AFF' : '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={getLoadingColor()}
            style={styles.loadingIndicator}
          />
        )}
        
        {!loading && leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={getIconSize()}
            color={getIconColor()}
            style={styles.leftIcon}
          />
        )}
        
        <Text style={getTextStyle()}>{title}</Text>
        
        {!loading && rightIcon && (
          <Ionicons
            name={rightIcon as any}
            size={getIconSize()}
            color={getIconColor()}
            style={styles.rightIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Variant styles
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  
  // Size styles
  smallButton: {
    height: 36,
    paddingHorizontal: 16,
    minWidth: 80,
  },
  mediumButton: {
    height: 44,
    paddingHorizontal: 24,
    minWidth: 100,
  },
  largeButton: {
    height: 52,
    paddingHorizontal: 32,
    minWidth: 120,
  },
  
  // State styles
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  fullWidthButton: {
    width: '100%',
    minWidth: undefined,
  },
  
  // Content styles
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#007AFF',
  },
  ghostText: {
    color: '#007AFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  
  // Size text styles
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  // Disabled text
  disabledText: {
    color: '#C7C7CC',
  },
  
  // Icon styles
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  loadingIndicator: {
    marginRight: 8,
  },
});
