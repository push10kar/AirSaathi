import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useAppTheme } from '../context/ThemeContext';
import { MaterialSymbols } from '@expo/vector-icons'; // We will use MaterialCommunityIcons in App.js or similar

export default function CircularProgress({ aqi = 42 }) {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);

  const getAQIColor = (value) => {
    if (value <= 50) return '#00D166'; // Good
    if (value <= 100) return '#FFB800'; // Moderate
    if (value <= 150) return '#FF8C00'; // Sensitive
    if (value <= 200) return '#FF4444'; // Unhealthy
    return '#990000'; // Hazardous
  };

  const aqiColor = getAQIColor(aqi);
  const size = 288;
  const strokeWidthOuter = 16;
  const center = size / 2;
  const radiusOuter = (size - strokeWidthOuter) / 2;
  const circumferenceOuter = 2 * Math.PI * radiusOuter;

  // Max scale for display is 300
  const percentage = Math.min(aqi / 300, 1);
  const offsetOuter = circumferenceOuter * (1 - percentage);

  return (
    <View style={styles.container}>
      {/* Shadow Glow */}
      <View style={[styles.glow, { backgroundColor: aqiColor }]} />
      
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={center}
          cy={center}
          r={radiusOuter}
          stroke={theme.colors.background.elevated}
          strokeWidth={strokeWidthOuter}
          fill="transparent"
        />
        {/* Outer Ring Foreground (AQI) */}
        <Circle
          cx={center}
          cy={center}
          r={radiusOuter}
          stroke={aqiColor}
          strokeWidth={strokeWidthOuter}
          fill="transparent"
          strokeDasharray={circumferenceOuter}
          strokeDashoffset={offsetOuter}
          strokeLinecap="round"
        />
      </Svg>

      <View style={styles.centerContent}>
        <Text style={styles.mainValue}>{aqi}</Text>
        <Text style={styles.subText}>AQI TODAY</Text>
      </View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    width: 288,
    height: 288,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.accent.primary,
    opacity: 0.05,
    borderRadius: 144,
    transform: [{ scale: 1.2 }],
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  mainValue: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 48,
    color: theme.colors.text.primary,
  },
  subText: {
    fontFamily: theme.fonts.body.medium,
    fontSize: 14,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
    marginTop: 4,
  }
});
