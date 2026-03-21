/**
 * HabitTracker — GitHub-style activity heatmap for AirSaathi Actions screen.
 *
 * Design source: Stitch "Actions - Habit Tracker (Dark)" screen
 * Layout: Consistency section — 13 weeks × 7 days grid (last ~90 days)
 */
import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import designSystem from '../context/design_system.json';
import { useTheme } from '../context/ThemeContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const WEEKS = 13;       // columns
const DAYS_PER_WEEK = 7; // rows
const CELL_GAP = 4;
const CARD_PADDING = 16;

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ─── Mock data generation ─────────────────────────────────────────────────────
function generateHeatmapData() {
  const today = new Date();
  const totalCells = WEEKS * DAYS_PER_WEEK;
  const data: { date: Date; level: 0 | 1 | 2 | 3 }[] = [];

  for (let i = totalCells - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Weighted random: mostly 0, occasionally active days
    const rand = Math.random();
    const level =
      i <= 0
        ? 1                    // today gets at least 1
        : rand < 0.45 ? 0      // no activity
        : rand < 0.70 ? 1      // low
        : rand < 0.88 ? 2      // medium
        : 3;                   // high
    data.push({ date: d, level: level as 0 | 1 | 2 | 3 });
  }
  return data;
}

// Stable mock — generated once per module load, not on every render
const HEATMAP_DATA = generateHeatmapData();

// ─── Color scale ──────────────────────────────────────────────────────────────
function getCellColor(level: 0 | 1 | 2 | 3, isDark: boolean) {
  if (isDark) {
    switch (level) {
      case 0: return 'rgba(30, 41, 59, 0.7)';      // slate-800/70 — empty
      case 1: return 'rgba(16, 85, 71, 0.55)';     // mint tint — low
      case 2: return 'rgba(52, 211, 153, 0.55)';   // mint mid — medium
      case 3: return '#34D399';                     // full mint — high
    }
  } else {
    switch (level) {
      case 0: return '#E2E8F0';                     // slate-200 — empty
      case 1: return '#A7F3D0';                     // mint-200 — low
      case 2: return '#34D399';                     // mint-400 — medium
      case 3: return '#065F46';                     // forest — high
    }
  }
}

// ─── HeatmapCell ──────────────────────────────────────────────────────────────
type CellProps = {
  level: 0 | 1 | 2 | 3;
  date: Date;
  cellSize: number;
  isDark: boolean;
  onPress: (date: Date, level: number) => void;
};

const HeatmapCell = memo(({ level, date, cellSize, isDark, onPress }: CellProps) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withTiming(0.8, { duration: 100, easing: Easing.out(Easing.ease) }, () => {
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.elastic(1)) });
    });
    onPress(date, level);
  }, [date, level, onPress]);

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.cell,
          {
            width: cellSize,
            height: cellSize,
            backgroundColor: getCellColor(level, isDark),
          },
          animStyle,
        ]}
      />
    </Pressable>
  );
});

// ─── Streak summary ───────────────────────────────────────────────────────────
function computeStreak(data: typeof HEATMAP_DATA): number {
  let streak = 0;
  // Walk backward from today
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].level > 0) streak++;
    else break;
  }
  return streak;
}

function computeActiveDays(data: typeof HEATMAP_DATA): number {
  return data.filter((d) => d.level > 0).length;
}

// ─── HabitTracker ─────────────────────────────────────────────────────────────
export default function HabitTracker() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { width: screenWidth } = useWindowDimensions();
  const isIOS = Platform.OS === 'ios';

  const [selectedDay, setSelectedDay] = useState<{ date: Date; level: number } | null>(null);

  // Fit exactly WEEKS columns inside available card width
  const cardContentWidth = screenWidth - 32 - CARD_PADDING * 2; // 16px margin each side
  const cellSize = Math.floor(
    (cardContentWidth - (WEEKS - 1) * CELL_GAP) / WEEKS
  );

  // Memoize grid — reshaped as columns (weeks)
  const columns = useMemo(() => {
    const cols: (typeof HEATMAP_DATA[number])[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      cols.push(HEATMAP_DATA.slice(w * DAYS_PER_WEEK, (w + 1) * DAYS_PER_WEEK));
    }
    return cols;
  }, []);

  const streak = useMemo(() => computeStreak(HEATMAP_DATA), []);
  const activeDays = useMemo(() => computeActiveDays(HEATMAP_DATA), []);

  const handleCellPress = useCallback((date: Date, level: number) => {
    setSelectedDay((prev) =>
      prev?.date.toDateString() === date.toDateString() ? null : { date, level }
    );
  }, []);

  // ── Month label row ────────────────────────────────────────────────────────
  const monthLabel = useMemo(() => {
    const last = HEATMAP_DATA[HEATMAP_DATA.length - 1].date;
    const first = HEATMAP_DATA[0].date;
    const fmt = (d: Date) => d.toLocaleString('default', { month: 'short' });
    if (fmt(first) === fmt(last)) return fmt(last);
    return `${fmt(first)} – ${fmt(last)}`;
  }, []);

  // Theme colors
  const textPrimary = isDark ? '#F1F5F9' : designSystem.designSystem.colors.primary.lightText;
  const textSecondary = isDark ? '#64748B' : '#94A3B8';
  const accent = isDark ? designSystem.designSystem.colors.primary.mint : '#065F46';
  const cardBg = isDark ? designSystem.designSystem.colors.cards.dark.background : '#F8FAFC';
  const cardBorder = isDark ? designSystem.designSystem.colors.cards.dark.border : 'rgba(0,0,0,0.06)';

  // Shared inner content — rendered inside either BlurView (dark) or View (light)
  const cardBody = (
    <View style={styles.cardContent}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, {
            backgroundColor: isDark
              ? designSystem.designSystem.colors.feedback.action.dark
              : designSystem.designSystem.colors.feedback.action.light
          }]}>
            <Ionicons name="calendar-outline" size={15} color={accent} />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: textPrimary }]}>Consistency</Text>
            <Text style={[styles.cardSubtitle, { color: textSecondary }]}>{monthLabel}</Text>
          </View>
        </View>
        <View style={[styles.streakPill, {
          backgroundColor: isDark
            ? designSystem.designSystem.colors.feedback.action.dark
            : designSystem.designSystem.colors.feedback.action.light,
        }]}>
          <Ionicons name="flame-outline" size={13} color={accent} />
          <Text style={[styles.streakText, { color: accent }]}>{streak}d streak</Text>
        </View>
      </View>

      {/* Day-of-week labels */}
      <View style={styles.dayLabelRow}>
        {DAY_LABELS.map((d, i) => (
          <Text key={i} style={[styles.dayLabel, { color: textSecondary, width: cellSize }]}>{d}</Text>
        ))}
      </View>

      {/* Heatmap grid */}
      <View style={styles.grid}>
        {columns.map((week, wi) => (
          <View key={wi} style={[styles.column, { gap: CELL_GAP }]}>
            {week.map((cell, di) => (
              <HeatmapCell
                key={di}
                level={cell.level}
                date={cell.date}
                cellSize={cellSize}
                isDark={isDark}
                onPress={handleCellPress}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Selected day tooltip */}
      {selectedDay && (
        <View style={[styles.tooltip, {
          backgroundColor: isDark ? 'rgba(30,41,59,0.9)' : '#F8FAFC',
          borderColor: cardBorder,
          borderWidth: isDark ? 1 : 0,
        }]}>
          <Text style={[styles.tooltipText, { color: textPrimary }]}>
            {selectedDay.date.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
            {' · '}
            <Text style={{ color: accent }}>
              {selectedDay.level === 0 ? 'No activity'
                : selectedDay.level === 1 ? 'Low activity'
                : selectedDay.level === 2 ? 'Moderate activity'
                : 'High activity'}
            </Text>
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerStat, { color: textSecondary }]}>
          <Text style={{ color: textPrimary, fontWeight: '700' }}>{activeDays}</Text>
          {' active days'}
        </Text>
        <View style={styles.legend}>
          <Text style={[styles.legendLabel, { color: textSecondary }]}>Less</Text>
          {([0, 1, 2, 3] as const).map((l) => (
            <View key={l} style={[styles.legendCell, { backgroundColor: getCellColor(l, isDark) }]} />
          ))}
          <Text style={[styles.legendLabel, { color: textSecondary }]}>More</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {isDark ? (
        // Dark: BlurView IS the card — content inside ensures correct z-order
        <BlurView
          tint="dark"
          intensity={isIOS ? 20 : 8}
          style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 }]}
        >
          {cardBody}
        </BlurView>
      ) : (
        // Light: plain View — NO overflow:hidden so elevation shadow shows on Android
        <View
          style={[
            styles.cardLight,
            Platform.OS === 'ios' && styles.cardShadowIOS,
            Platform.OS === 'android' && styles.cardShadowAndroid,
          ]}
        >
          {cardBody}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 28,
  },
  // Dark mode: overflow:hidden needed to clip BlurView to border radius
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  // Light mode: no overflow:hidden so Android elevation shadow is visible
  cardLight: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cardShadowIOS: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  cardShadowAndroid: {
    elevation: 3,
  },
  cardContent: {
    padding: CARD_PADDING,
    gap: 14,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  streakText: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    fontWeight: '700',
  },

  // Day labels
  dayLabelRow: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  dayLabel: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  column: {
    flexDirection: 'column',
  },
  cell: {
    borderRadius: 4,
  },

  // Tooltip
  tooltip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  tooltipText: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    fontWeight: '500',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerStat: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    fontWeight: '400',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendLabel: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 10,
    fontWeight: '500',
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
