import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

export default function ApplianceCard({ title, draw, drawPercentage, icon, activeColor, activeContainerColor, isActive, onToggle }) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: activeContainerColor }]}>
          {icon}
        </View>
        <Switch
          value={isActive}
          onValueChange={onToggle}
          trackColor={{ false: theme.colors.background.elevated, true: activeColor }}
          thumbColor={isActive ? '#fff' : '#fff'}
        />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.footer}>
        <View style={styles.drawRow}>
          <Text style={styles.drawLabel}>{title === 'Smart Sprinkler' ? 'Water Flow' : 'Current Draw'}</Text>
          <Text style={styles.drawValue}>{draw}</Text>
        </View>
        
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${drawPercentage}%`, backgroundColor: activeColor }]} />
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  card: {
    width: 256, // w-64
    padding: 24, // p-6
    borderRadius: 12, // rounded-xl
    backgroundColor: theme.colors.background.secondary,
    marginRight: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32, // mb-8
  },
  iconContainer: {
    padding: 12, // p-3
    borderRadius: 8, // rounded-lg
  },
  title: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 18,
    color: theme.colors.text.primary,
  },
  footer: {
    marginTop: 8, // mt-2
  },
  drawRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  drawLabel: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  drawValue: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  }
});
