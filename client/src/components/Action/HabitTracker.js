import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const HabitTracker = ({ streak, history, theme }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border || 'rgba(0,0,0,0.05)' }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Your Streak</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Keep it up!</Text>
        </View>
        <View style={[styles.streakContainer, { backgroundColor: theme.colors.background.secondary }]}>
          <Text style={[styles.streakText, { color: theme.colors.text.primary }]}>{streak}</Text>
          <Feather name="zap" size={24} color={theme.colors.accent.primary} />
        </View>
      </View>

      <View style={styles.grid}>
        {days.map((day, index) => (
          <View key={day} style={styles.dayCol}>
            <Text style={[styles.dayText, { color: theme.colors.text.secondary }]}>{day}</Text>
            <View style={[
              styles.statusIcon, 
              { 
                backgroundColor: history[index] ? 'rgba(0, 209, 102, 0.2)' : 'rgba(255, 75, 75, 0.1)',
                borderColor: history[index] ? theme.colors.accent.primary : 'rgba(255, 75, 75, 0.3)'
              }
            ]}>
              <Feather 
                name={history[index] ? "check" : "x"} 
                size={12} 
                color={history[index] ? theme.colors.accent.primary : "#FF4B4B"} 
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginRight: 4,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HabitTracker;
