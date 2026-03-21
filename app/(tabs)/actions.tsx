import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import designSystem from '../../context/design_system.json';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import HabitTracker from '../../components/HabitTracker';

// ─── Types ────────────────────────────────────────────────────────────────────
type Task = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Section = {
  id: string;
  label: string;
  timeRange: string;
  icon: keyof typeof Ionicons.glyphMap;
  tasks: Task[];
};

// ─── Mock Data (matches Stitch design content) ────────────────────────────────
const SECTIONS: Section[] = [
  {
    id: 'morning',
    label: 'Morning',
    timeRange: '06:00 AM — 11:59 AM',
    icon: 'sunny-outline',
    tasks: [
      {
        id: 'm1',
        title: 'Close windows',
        subtitle: 'Prevent early smog entry',
        duration: '2 min',
        icon: 'home-outline',
      },
      {
        id: 'm2',
        title: 'Wear N95 Mask',
        subtitle: 'High PM2.5 levels outside',
        duration: '1 min',
        icon: 'medical-outline',
      },
      {
        id: 'm3',
        title: 'Run air purifier',
        subtitle: 'Set to high for optimal indoor air',
        duration: '5 min',
        icon: 'refresh-outline',
      },
    ],
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    timeRange: '12:00 PM — 04:59 PM',
    icon: 'partly-sunny-outline',
    tasks: [
      {
        id: 'a1',
        title: 'Avoid peak traffic',
        subtitle: 'Ozone levels are peaking',
        duration: '—',
        icon: 'car-outline',
      },
      {
        id: 'a2',
        title: 'Stay hydrated',
        subtitle: 'Flush out airborne toxins naturally',
        duration: '1 min',
        icon: 'water-outline',
      },
    ],
  },
  {
    id: 'evening',
    label: 'Evening',
    timeRange: '05:00 PM — 11:59 PM',
    icon: 'moon-outline',
    tasks: [
      {
        id: 'e1',
        title: 'Indoor Exercise',
        subtitle: 'Outdoor air is "Unhealthy"',
        duration: '45 min',
        icon: 'fitness-outline',
      },
      {
        id: 'e2',
        title: 'Close vents & gaps',
        subtitle: 'Reduce overnight infiltration',
        duration: '5 min',
        icon: 'shield-checkmark-outline',
      },
      {
        id: 'e3',
        title: 'Use recirculating AC',
        subtitle: 'Minimise outdoor air intake while driving',
        duration: '—',
        icon: 'thermometer-outline',
      },
    ],
  },
];

const DAILY_ROUTINES: Task[] = [
  {
    id: 'r1',
    title: 'Check AQI on wake-up',
    subtitle: 'Plan your day around forecasted air quality',
    duration: '1 min',
    icon: 'analytics-outline',
  },
  {
    id: 'r2',
    title: 'Log symptoms',
    subtitle: 'Track any respiratory changes daily',
    duration: '2 min',
    icon: 'clipboard-outline',
  },
];

// ─── Checkbox ─────────────────────────────────────────────────────────────────
type CheckboxProps = {
  checked: boolean;
  onPress: () => void;
  activeColor: string;
  borderColor: string;
};

function Checkbox({ checked, onPress, activeColor, borderColor }: CheckboxProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.85, { damping: 12, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    });
    onPress();
  };

  return (
    <Pressable onPress={handlePress} hitSlop={8}>
      <Animated.View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? activeColor : borderColor,
            backgroundColor: checked ? activeColor : 'transparent',
          },
          animStyle,
        ]}
      >
        {checked && (
          <Ionicons name="checkmark" size={14} color="#fff" />
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────
type TaskCardProps = {
  task: Task;
  isDark: boolean;
  colors: ReturnType<typeof buildColors>;
};

function TaskCard({ task, isDark, colors }: TaskCardProps) {
  const [checked, setChecked] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const timingCfg = { duration: 200, easing: Easing.inOut(Easing.ease) };

  const handlePressIn = () => {
    scale.value = withTiming(0.97, timingCfg);
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, timingCfg);
  };

  const handleToggle = useCallback(() => {
    const next = !checked;
    opacity.value = withTiming(next ? 0.6 : 1, { duration: 200 });
    setChecked(next);
  }, [checked]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const cardInnerContent = (
    <View style={styles.cardInner}>
      <Checkbox
        checked={checked}
        onPress={handleToggle}
        activeColor={colors.accent}
        borderColor={colors.checkboxBorder}
      />
      <View style={styles.cardContent}>
        <Text
          style={[styles.taskTitle, { color: colors.textPrimary }, checked && styles.taskTitleDone]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <Text style={[styles.taskSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {task.subtitle}
        </Text>
      </View>
      <View style={styles.durationBadge}>
        <Text style={[styles.durationText, { color: colors.textSecondary }]}>
          {task.duration}
        </Text>
      </View>
    </View>
  );

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handleToggle}>
      <Animated.View style={cardAnimStyle}>
        {isDark ? (
          // Dark: BlurView IS the container — content is inside, guarantees correct z-order
          <BlurView
            tint="dark"
            intensity={12}
            style={[styles.card, styles.cardDark, { borderColor: colors.cardBorder }]}
          >
            {cardInnerContent}
          </BlurView>
        ) : (
          // Light: plain View, no overflow:hidden so elevation shadow is visible on Android
          <View
            style={[
              styles.cardLight,
              Platform.OS === 'ios' && styles.cardShadowIOS,
              Platform.OS === 'android' && styles.cardShadowAndroid,
            ]}
          >
            {cardInnerContent}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
type SectionHeaderProps = {
  label: string;
  timeRange: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: ReturnType<typeof buildColors>;
};

function SectionHeader({ label, timeRange, icon, colors }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconBadge, { backgroundColor: colors.sectionIconBg }]}>
        <Ionicons name={icon} size={16} color={colors.accent} />
      </View>
      <View style={styles.sectionTextGroup}>
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          {label}
        </Text>
        <Text style={[styles.sectionTimeRange, { color: colors.textSecondary }]}>
          {timeRange}
        </Text>
      </View>
    </View>
  );
}

// ─── Color builder ────────────────────────────────────────────────────────────
function buildColors(isDark: boolean) {
  return {
    textPrimary: isDark ? '#F1F5F9' : designSystem.designSystem.colors.primary.lightText,
    textSecondary: isDark ? '#94A3B8' : '#475569',
    accent: isDark ? designSystem.designSystem.colors.primary.mint : '#065F46',
    cardBorder: isDark
      ? designSystem.designSystem.colors.cards.dark.border
      : 'transparent',
    checkboxBorder: isDark ? '#475569' : '#CBD5E1',
    sectionIconBg: isDark
      ? designSystem.designSystem.colors.feedback.action.dark
      : designSystem.designSystem.colors.feedback.action.light,
    headerSubtitle: isDark ? '#64748B' : '#94A3B8',
    progressBg: isDark ? 'rgba(30,41,59,0.6)' : '#E2E8F0',
    progressFill: isDark ? designSystem.designSystem.colors.primary.mint : '#065F46',
  };
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ total, completed, colors }: { total: number; completed: number; colors: ReturnType<typeof buildColors> }) {
  const pct = total === 0 ? 0 : completed / total;
  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.progressBg }]}>
      <View
        style={[
          styles.progressFill,
          {
            backgroundColor: colors.progressFill,
            width: `${Math.round(pct * 100)}%` as any,
          },
        ]}
      />
    </View>
  );
}

// ─── ActionsScreen ────────────────────────────────────────────────────────────
export default function ActionsScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = buildColors(isDark);

  const totalTasks =
    SECTIONS.reduce((s, sec) => s + sec.tasks.length, 0) + DAILY_ROUTINES.length;

  return (
    <ScreenWrapper>
      {/* ── Page Header ──────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>
            Daily Actions
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Protect your lungs today based on current air quality levels.
          </Text>
        </View>

        {/* Progress summary */}
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            Today's progress
          </Text>
          <Text style={[styles.progressCount, { color: colors.accent }]}>
            0 / {totalTasks}
          </Text>
        </View>
        <ProgressBar total={totalTasks} completed={0} colors={colors} />
      </View>

      {/* ── Habit Tracker (Consistency Heatmap) ─────────────── */}
      <HabitTracker />

      {/* ── Time-of-Day Sections ──────────────────────────────── */}
      {SECTIONS.map((section) => (
        <View key={section.id} style={styles.section}>
          <SectionHeader
            label={section.label}
            timeRange={section.timeRange}
            icon={section.icon}
            colors={colors}
          />
          <View style={styles.taskList}>
            {section.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isDark={isDark}
                colors={colors}
              />
            ))}
          </View>
        </View>
      ))}

      {/* ── Daily Routines ────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          label="Daily Routines"
          timeRange="Always active"
          icon="repeat-outline"
          colors={colors}
        />
        <View style={styles.taskList}>
          {DAILY_ROUTINES.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDark={isDark}
              colors={colors}
            />
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Page header
  pageHeader: {
    marginBottom: 28,
    gap: 12,
  },
  pageHeaderText: {
    gap: 6,
  },
  pageTitle: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    fontWeight: '500',
  },
  progressCount: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Section
  section: {
    marginBottom: 28,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTextGroup: {
    gap: 1,
  },
  sectionLabel: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionTimeRange: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // Task list
  taskList: {
    gap: 10,
  },

  // Task card — each mode self-contained
  card: {
    // Used only by dark mode (BlurView container needs overflow+borderRadius)
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardLight: {
    // Light: NO overflow:hidden so elevation shadow isn't clipped on Android
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cardDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderRadius: 20,
  },
  cardShadowIOS: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  cardShadowAndroid: {
    elevation: 2,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },

  // Checkbox
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Card content
  cardContent: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 15,
    fontWeight: '600',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
  },
  taskSubtitle: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },

  // Duration badge
  durationBadge: {
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  durationText: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    fontWeight: '500',
  },
});
