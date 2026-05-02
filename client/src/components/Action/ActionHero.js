import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ActionItem = ({ action, onToggle, theme }) => {
  const scaleAnim = new Animated.Value(1);

  const handlePress = () => {
    onToggle(action.id);
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

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Impact': return '#FF4B4B';
      case 'Medium': return '#FFB800';
      default: return theme.colors.accent.primary;
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={handlePress}
      style={[
        styles.actionCard, 
        { 
          backgroundColor: theme.colors.background.elevated,
          borderColor: theme.colors.border || 'rgba(0,0,0,0.05)'
        }
      ]}
    >
      <Animated.View style={[styles.actionContent, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 209, 102, 0.1)' }]}>
          <Feather 
            name={action.icon} 
            size={22} 
            color={getTierColor(action.tier)} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.actionTitle, { color: theme.colors.text.primary, textDecorationLine: action.completed ? 'line-through' : 'none', opacity: action.completed ? 0.6 : 1 }]}>
            {action.title}
          </Text>
          <View style={styles.tierRow}>
            <Text style={[styles.tierText, { color: getTierColor(action.tier) }]}>{action.tier}</Text>
            <Text style={[styles.pointsText, { color: theme.colors.text.secondary }]}> • +{action.points} pts</Text>
          </View>
        </View>
        <View style={[styles.checkbox, { borderColor: action.completed ? theme.colors.accent.primary : theme.colors.text.muted, backgroundColor: action.completed ? theme.colors.accent.primary : 'transparent' }]}>
          {action.completed && <Feather name="check" size={14} color="#000" />}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const ActionHero = ({ actions, onToggle, theme }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Today's Actions</Text>
        <View style={[styles.countBadge, { backgroundColor: theme.colors.accent.primary + '20' }]}>
          <Text style={[styles.countText, { color: theme.colors.accent.primary }]}>{actions.filter(a => a.completed).length}/{actions.length}</Text>
        </View>
      </View>
      {actions.map(action => (
        <ActionItem 
          key={action.id} 
          action={action} 
          onToggle={onToggle} 
          theme={theme} 
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  actionCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
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
  textContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
  },
  pointsText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ActionHero;
