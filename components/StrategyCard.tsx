import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import designSystem from '../context/design_system.json';
import { useTheme } from '../context/ThemeContext';

type StrategyCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress?: () => void;
};

const timingConfig = { duration: 150, easing: Easing.out(Easing.cubic) };

export default function StrategyCard({ icon, title, description, onPress }: StrategyCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const scale = useSharedValue(1);

  const cardBg = isDark
    ? designSystem.designSystem.colors.cards.dark.background
    : designSystem.designSystem.colors.cards.light.background;
  const cardBorder = isDark
    ? designSystem.designSystem.colors.cards.dark.border
    : 'transparent';
  const textPrimary = isDark
    ? '#F1F5F9'
    : designSystem.designSystem.colors.primary.lightText;
  const textSecondary = isDark ? '#94A3B8' : '#475569';
  const iconBg = isDark
    ? designSystem.designSystem.colors.feedback.action.dark
    : designSystem.designSystem.colors.feedback.action.light;
  const iconColor = isDark
    ? designSystem.designSystem.colors.primary.mint
    : '#065F46';
  const chevronColor = isDark ? '#475569' : '#94A3B8';

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, timingConfig);
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, timingConfig);
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.card,
          animatedScale,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            borderWidth: isDark ? 1 : 0,
          },
        ]}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
          <Text style={[styles.description, { color: textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={18} color={chevronColor} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: designSystem.designSystem.colors.cards.light.borderRadius,
    padding: 16,
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
  description: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
});
