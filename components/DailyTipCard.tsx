import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import designSystem from '../context/design_system.json';
import { useTheme } from '../context/ThemeContext';

type DailyTipCardProps = {
  title: string;
  body: string;
};

export default function DailyTipCard({ title, body }: DailyTipCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark
    ? designSystem.designSystem.colors.feedback.action.dark
    : designSystem.designSystem.colors.feedback.action.light;
  const badgeBg = isDark ? 'rgba(52, 211, 153, 0.15)' : '#065F46';
  const badgeText = isDark ? designSystem.designSystem.colors.primary.mint : '#FFFFFF';
  const titleColor = isDark ? '#F1F5F9' : designSystem.designSystem.colors.primary.lightText;
  const bodyColor = isDark ? '#CBD5E1' : '#334155';
  const iconColor = isDark ? designSystem.designSystem.colors.primary.mint : '#065F46';

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      {/* Badge */}
      <View style={[styles.badge, { backgroundColor: badgeBg }]}>
        <Ionicons name="bulb" size={12} color={badgeText} />
        <Text style={[styles.badgeText, { color: badgeText }]}>DAILY TIP</Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>

      {/* Body */}
      <Text style={[styles.body, { color: bodyColor }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: designSystem.designSystem.colors.cards.light.borderRadius,
    padding: 20,
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
});
