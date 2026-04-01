import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AnimatedCheckbox from './AnimatedCheckbox';
import designSystem from '../context/design_system.json';
import { useTheme } from '../context/ThemeContext';

type ActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  completed: boolean;
  onToggle: () => void;
};

const pressConfig = { duration: 120, easing: Easing.out(Easing.cubic) };

export default function ActionCard({
  icon,
  title,
  subtitle,
  completed,
  onToggle,
}: ActionCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Card-level animation values only (checkbox handled by AnimatedCheckbox)
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);

  useEffect(() => {
    cardOpacity.value = withTiming(completed ? 0.52 : 1, { duration: 320 });
  }, [completed]);

  // ── Theme tokens ──────────────────────────────────────────
  const cardBg = isDark
    ? designSystem.designSystem.colors.cards.dark.background
    : designSystem.designSystem.colors.cards.light.background;
  const cardBorder = isDark
    ? designSystem.designSystem.colors.cards.dark.border
    : 'transparent';
  const textPrimary = isDark
    ? '#F1F5F9'
    : designSystem.designSystem.colors.primary.lightText;
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const iconBg = isDark
    ? designSystem.designSystem.colors.feedback.action.dark
    : designSystem.designSystem.colors.feedback.action.light;
  const iconColor = isDark
    ? designSystem.designSystem.colors.primary.mint
    : '#065F46';
  const mintColor = isDark
    ? designSystem.designSystem.colors.primary.mint
    : '#059669';
  const checkboxBorderColor = isDark ? '#334155' : '#CBD5E1';

  // ── Animated styles ───────────────────────────────────────
  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const handlePressIn = () => { cardScale.value = withTiming(0.97, pressConfig); };
  const handlePressOut = () => { cardScale.value = withTiming(1, pressConfig); };
  const handleToggle = () => {
    Haptics.selectionAsync();
    onToggle();
  };

  return (
    <Pressable
      onPress={handleToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          cardAnimStyle,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            borderWidth: isDark ? 1 : 0,
          },
        ]}
      >
        {/* ── Action Icon ── */}
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>

        {/* ── Text ── */}
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, { color: completed ? textSecondary : textPrimary }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, { color: textSecondary }]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* ── Checkbox (shared animated component) ── */}
        <AnimatedCheckbox
          checked={completed}
          onPress={handleToggle}
          activeColor={mintColor}
          borderColor={checkboxBorderColor}
          size={24}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: designSystem.designSystem.colors.cards.light.borderRadius,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
  },
});
