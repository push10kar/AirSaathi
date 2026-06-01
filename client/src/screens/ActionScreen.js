import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import ActionHero from '../components/Action/ActionHero';
import HabitTracker from '../components/Action/HabitTracker';
import RewardSystem from '../components/Action/RewardSystem';
import PersonalInsights from '../components/Action/PersonalInsights';
import DailyCheckIn from '../components/Action/DailyCheckIn';

const ActionScreen = React.memo(function ActionScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for gamification
  const [points, setPoints] = useState(240);
  const [streak, setStreak] = useState(5);
  const [history, setHistory] = useState([true, true, false, true, true, false, true]);
  
  // State for daily actions
  const [actions, setActions] = useState([
    { id: 1, title: 'Wear mask outdoors', tier: 'Easy', points: 5, icon: 'shield', completed: false },
    { id: 2, title: 'Use public transport', tier: 'Medium', points: 10, icon: 'truck', completed: false },
    { id: 3, title: 'Avoid burning waste', tier: 'Impact', points: 20, icon: 'trash-2', completed: false },
    { id: 4, title: 'Plant a sapling', tier: 'Impact', points: 20, icon: 'sun', completed: false },
  ]);

  const toggleAction = (id) => {
    setActions(prev => prev.map(action => {
      if (action.id === id) {
        const newState = !action.completed;
        // Update points
        if (newState) {
          setPoints(p => p + action.points);
        } else {
          setPoints(p => p - action.points);
        }
        return { ...action, completed: newState };
      }
      return action;
    }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent.primary} />
        }
      >
        
        {/* 1. Habit Tracker (Stickiness) */}
        <HabitTracker streak={streak} history={history} theme={theme} />

        {/* 2. Daily Action Engine (Core) */}
        <ActionHero actions={actions} onToggle={toggleAction} theme={theme} />

        {/* 3. Reward System (Motivation) */}
        <RewardSystem points={points} theme={theme} />

        {/* 4. Daily Check-in (1-tap exposure check) */}
        <DailyCheckIn theme={theme} />

        {/* 5. Smart Actions (Context Aware) */}
        <View style={[styles.smartCard, { backgroundColor: isDarkMode ? 'rgba(0, 89, 187, 0.1)' : 'rgba(0, 89, 187, 0.05)', borderColor: isDarkMode ? 'rgba(0, 89, 187, 0.2)' : 'rgba(0, 89, 187, 0.1)' }]}>
          <View style={styles.smartHeader}>
            <Feather name="zap" size={20} color="#00d166" />
            <Text style={[styles.smartTitle, { color: theme.colors.text.primary }]}>Smart Action</Text>
          </View>
          <Text style={[styles.smartDesc, { color: theme.colors.text.secondary }]}>
            AQI is High right now. Avoid intense outdoor exercise for the next 3 hours.
          </Text>
        </View>

        {/* 6. Community Challenge */}
        <TouchableOpacity 
          activeOpacity={0.9}
          style={[styles.challengeCard, { backgroundColor: theme.colors.background.elevated }]}
        >
          <View style={styles.challengeInfo}>
            <Text style={[styles.challengeLabel, { color: theme.colors.accent.primary }]}>COMMUNITY CHALLENGE</Text>
            <Text style={[styles.challengeTitle, { color: theme.colors.text.primary }]}>Pune: 10,000 Actions</Text>
            <View style={styles.challengeProgressRow}>
              <View style={[styles.challengeTrack, { backgroundColor: theme.colors.background.secondary }]}>
                <View style={[styles.challengeFill, { width: '65%', backgroundColor: theme.colors.accent.primary }]} />
              </View>
              <Text style={[styles.challengePercent, { color: theme.colors.text.secondary }]}>65%</Text>
            </View>
          </View>
          <Feather name="users" size={32} color={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} style={styles.challengeIcon} />
        </TouchableOpacity>

        {/* 7. Personal Insights (Simplified) */}
        <PersonalInsights theme={theme} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
});

export default ActionScreen;

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 140,
  },
  smartCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
  },
  smartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  smartTitle: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginLeft: 8,
  },
  smartDesc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  challengeCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 12,
  },
  challengeProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  challengeFill: {
    height: '100%',
    borderRadius: 3,
  },
  challengePercent: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  challengeIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    transform: [{ rotate: '-15deg' }],
  },
  bottomSpacer: {
    height: 40,
  },
});
