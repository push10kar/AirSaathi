import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const InsightCard = ({ theme }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={[styles.container, { backgroundColor: theme.colors.background.elevated }]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 209, 102, 0.1)' }]}>
          <Feather name="info" size={18} color={theme.colors.accent.primary} />
        </View>
        <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Did you know?</Text>
      </View>
      <Text style={[styles.insightText, { color: theme.colors.text.primary }]}>
        Burning waste releases PM2.5 — harmful for lungs and heart health.
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.learnMore, { color: theme.colors.accent.primary }]}>Tap to learn more</Text>
        <Feather name="chevron-right" size={16} color={theme.colors.accent.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  learnMore: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 4,
  },
});

export default InsightCard;
