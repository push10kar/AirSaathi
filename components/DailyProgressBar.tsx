import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import designSystem from '../context/design_system.json';
import { useTheme } from '../context/ThemeContext';

type DailyProgressBarProps = {
  completed: number;
  total: number;
};

export default function DailyProgressBar({ completed, total }: DailyProgressBarProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [trackWidth, setTrackWidth] = useState(0);
  const fillWidth = useSharedValue(0);

  // Recalculate fill whenever completed, total, or measured width change
  useEffect(() => {
    if (trackWidth > 0) {
      const ratio = total > 0 ? completed / total : 0;
      fillWidth.value = withTiming(ratio * trackWidth, {
        duration: 450,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [completed, total, trackWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  // ── Theme tokens ──────────────────────────────────────────
  const mintColor = isDark
    ? designSystem.designSystem.colors.primary.mint
    : '#059669';
  const trackColor = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(0, 0, 0, 0.07)';
  const textPrimary = isDark
    ? '#F1F5F9'
    : designSystem.designSystem.colors.primary.lightText;
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark
    ? designSystem.designSystem.colors.cards.dark.background
    : designSystem.designSystem.colors.cards.light.background;
  const cardBorder = isDark
    ? designSystem.designSystem.colors.cards.dark.border
    : 'transparent';

  const fillStyle = useAnimatedStyle(() => ({
    width: fillWidth.value,
  }));

  const allDone = completed === total && total > 0;
  const progressText =
    completed === 0
      ? 'Start your first action'
      : allDone
      ? 'All done — great work today!'
      : `${completed} of ${total} actions completed`;

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
      {/* ── Header row ── */}
      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <Ionicons
            name={allDone ? 'checkmark-circle' : 'stats-chart-outline'}
            size={15}
            color={allDone ? mintColor : textSecondary}
          />
          <Text style={[styles.label, { color: textPrimary }]}>Daily Progress</Text>
        </View>
        <Text style={[styles.count, { color: allDone ? mintColor : textSecondary }]}>
          {completed}/{total}
        </Text>
      </View>

      {/* ── Track ── */}
      <View
        style={[styles.track, { backgroundColor: trackColor }]}
        onLayout={handleLayout}
      >
        <Animated.View
          style={[
            styles.fill,
            fillStyle,
            { backgroundColor: mintColor },
          ]}
        />
      </View>

      {/* ── Status text ── */}
      <Text style={[styles.statusText, { color: allDone ? mintColor : textSecondary }]}>
        {progressText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: designSystem.designSystem.colors.cards.light.borderRadius,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 15,
    fontWeight: '700',
  },
  count: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    height: 6,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
  statusText: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    fontWeight: '500',
  },
});
