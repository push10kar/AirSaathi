import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CircularProgress from './CircularProgress';

const getAQIInfo = (aqi) => {
  if (!aqi || aqi === 0) {
    return {
      category: 'Pending',
      message: 'Select a location to see live air quality data.',
      color: '#999',
    };
  }

  if (aqi <= 50) {
    return {
      category: 'Good',
      message: 'Air is fresh — perfect for outdoor activities!',
      color: '#00C853',
    };
  } else if (aqi <= 100) {
    return {
      category: 'Satisfactory',
      message: 'Air quality is acceptable today.',
      color: '#FFD600',
    };
  } else if (aqi <= 200) {
    return {
      category: 'Moderate',
      message: 'Sensitive groups should reduce outdoor time.',
      color: '#FF6D00',
    };
  } else if (aqi <= 300) {
    return {
      category: 'Poor',
      message: 'Air is unhealthy today — limit exposure.',
      color: '#D50000',
    };
  } else if (aqi <= 400) {
    return {
      category: 'Very Poor',
      message: 'Health alert: everyone may experience health effects.',
      color: '#6A0080',
    };
  } else {
    return {
      category: 'Severe',
      message: 'Health warnings of emergency conditions!',
      color: '#93000a',
    };
  }
};

const AQIHero = ({ aqi, displayAqi, nearbyArea, lastUpdated, theme }) => {
  const info = getAQIInfo(aqi);
  const currentTime = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <View style={styles.nearbyContainer}>
        <Text style={[styles.nearbyText, { color: theme.colors.text.primary }]}>
          {nearbyArea || 'Location not set'}
        </Text>
        <Text style={[styles.timeText, { color: theme.colors.text.secondary }]}>
          {lastUpdated ? `Last updated: ${currentTime}` : `Current time: ${currentTime}`}
        </Text>
      </View>

      <View style={styles.ringContainer}>
        <CircularProgress aqi={displayAqi || 0} />
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
