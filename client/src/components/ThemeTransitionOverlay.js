import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ThemeTransitionOverlay = ({ visible, targetDarkMode }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Use fixed colors for the transition based on the target theme
  // This prevents the "flicker" where the overlay text changes color mid-transition
  const bgColor = targetDarkMode ? '#0A0C10' : '#F8F9FA';
  const accentColor = targetDarkMode ? '#C4FF01' : '#006D32';
  const textColor = targetDarkMode ? '#FFFFFF' : '#1A1C1E';
  const subTextColor = targetDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250, // Faster fade in
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible && fadeAnim._value === 0) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay, 
        { 
          backgroundColor: bgColor,
          opacity: fadeAnim 
        }
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.iconCircle, { backgroundColor: targetDarkMode ? '#C4FF0115' : '#006D3210' }]}>
          <Feather 
            name={targetDarkMode ? "moon" : "sun"} 
            size={48} 
            color={accentColor} 
          />
        </View>
        <Text style={[styles.title, { color: textColor }]}>
          {targetDarkMode ? 'Switching to Dark' : 'Switching to Light'}
        </Text>
        <Text style={[styles.subtitle, { color: subTextColor }]}>
          Optimizing your experience...
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  content: {
    alignItems: 'center',
    padding: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    opacity: 0.7,
  }
});

export default ThemeTransitionOverlay;
