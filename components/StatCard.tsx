import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import designSystem from '../context/design_system.json';
import { useTheme } from '../context/ThemeContext';

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit: string;
};

export default function StatCard({ icon, label, value, unit }: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBg = isDark
    ? designSystem.designSystem.colors.cards.dark.background
    : designSystem.designSystem.colors.cards.light.background;
  const cardBorder = isDark
    ? designSystem.designSystem.colors.cards.dark.border
    : 'transparent';
  const textPrimary = isDark
    ? designSystem.designSystem.colors.primary.mint
    : designSystem.designSystem.colors.primary.lightText;
  const textSecondary = isDark ? '#94A3B8' : '#475569';
  const iconColor = isDark
    ? designSystem.designSystem.colors.primary.darkText
    : '#065F46';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          borderWidth: isDark ? 1 : 0,
        },
      ]}
    >
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={14} color={textSecondary} />
        <Text style={[styles.label, { color: textSecondary }]}>{label}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: textPrimary }]}>{value}</Text>
        <Text style={[styles.unit, { color: textSecondary }]}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: designSystem.designSystem.colors.cards.light.borderRadius,
    padding: 16,
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 28,
    fontWeight: '700',
  },
  unit: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 13,
    fontWeight: '500',
  },
});
