import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ActionItem = ({ action, onToggle, theme }) => {
  const [checked, setChecked] = useState(action.completed);
  const scaleAnim = new Animated.Value(1);

  const handlePress = () => {
    const newState = !checked;
    setChecked(newState);
    onToggle(action.id, newState);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Map Material icons to Feather icons if needed
  const iconMap = {
    'masks': 'shield',
    'delete-forever': 'trash-2',
    'directions-bus': 'truck',
    'filter-alt': 'filter',
  };

  const featherIcon = iconMap[action.icon] || action.icon || 'circle';

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={handlePress}
      style={[
        styles.actionCard, 
        { backgroundColor: theme.colors.background.elevated }
      ]}
    >
      <Animated.View style={[styles.actionContent, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 209, 102, 0.2)' }]}>
          <Feather 
            name={featherIcon} 
            size={22} 
            color={theme.colors.accent.primary} 
          />
        </View>
        <Text style={[styles.actionTitle, { color: theme.colors.text.primary, textDecorationLine: checked ? 'line-through' : 'none', opacity: checked ? 0.6 : 1 }]}>
          {action.title}
        </Text>
        <View style={[styles.checkbox, { borderColor: checked ? theme.colors.accent.primary : theme.colors.text.muted, backgroundColor: checked ? theme.colors.accent.primary : 'transparent' }]}>
          {checked && <Feather name="check" size={14} color="#000" />}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const ProgressIndicator = ({ completed, total, theme }) => {
  const progressWidth = (completed / total) * 100;
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animWidth, {
      toValue: progressWidth,
      useNativeDriver: false,
    }).start();
  }, [progressWidth]);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressText, { color: theme.colors.text.primary }]}>
          {completed} / {total} Completed
        </Text>
        {completed === total && (
          <Text style={[styles.completedText, { color: theme.colors.accent.primary }]}>
            All done! 🎉
          </Text>
        )}
      </View>
      <View style={[styles.progressBarBg, { backgroundColor: theme.colors.background.secondary }]}>
        <Animated.View 
          style={[
            styles.progressBarFill, 
            { 
              backgroundColor: theme.colors.accent.primary,
              width: animWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              })
            }
          ]} 
        />
      </View>
    </View>
  );
};

const DailyActions = ({ actions, onActionToggle, theme }) => {
  const completedCount = actions.filter(a => a.completed).length;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Today's Actions</Text>
      {actions.map(action => (
        <ActionItem 
          key={action.id} 
          action={action} 
          onToggle={onActionToggle} 
          theme={theme} 
        />
      ))}
      <ProgressIndicator completed={completedCount} total={actions.length} theme={theme} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 16,
  },
  actionCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  completedText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default DailyActions;
