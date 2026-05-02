import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CircularProgress from './CircularProgress';

const getAQIInfo = (aqi) => {
  if (aqi <= 50) {
    return {
      category: 'Good',
      message: 'Air is fresh — perfect for outdoor activities!',
      color: '#00d166',
    };
  } else if (aqi <= 100) {
    return {
      category: 'Moderate',
      message: 'Air quality is acceptable today.',
      color: '#FFB800',
    };
  } else if (aqi <= 150) {
    return {
      category: 'Poor',
      message: 'Sensitive groups should reduce outdoor time.',
      color: '#FF7A00',
    };
  } else if (aqi <= 200) {
    return {
      category: 'Unhealthy',
      message: 'Air is unhealthy today — limit outdoor exposure',
      color: '#FF4B4B',
    };
  } else {
    return {
      category: 'Hazardous',
      message: 'Avoid outdoor activities — stay indoors!',
      color: '#93000a',
    };
  }
};

const AQIHero = ({ aqi, nearbyArea, theme }) => {
  const info = getAQIInfo(aqi);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <View style={styles.nearbyContainer}>
        <Text style={[styles.nearbyText, { color: theme.colors.text.primary }]}>
          {nearbyArea || 'Nearby Area'}
        </Text>
        <Text style={[styles.timeText, { color: theme.colors.text.secondary }]}>
          {currentTime}
        </Text>
      </View>

      <View style={styles.ringContainer}>
        <CircularProgress aqi={aqi} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.category, { color: info.color }]}>{info.category}</Text>
        <Text style={[styles.message, { color: theme.colors.text.primary }]}>{info.message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  nearbyContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  nearbyText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
    opacity: 0.7,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  category: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AQIHero;
