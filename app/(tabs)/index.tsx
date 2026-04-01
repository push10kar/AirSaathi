import React, { useState } from 'react';
import { Text, StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import designSystem from '../../context/design_system.json';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import AQIRing from '../../components/AQIRing';
import StatCard from '../../components/StatCard';
import ActionCard from '../../components/ActionCard';
import DailyProgressBar from '../../components/DailyProgressBar';
import DailyTipCard from '../../components/DailyTipCard';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const AQI_DATA = {
  value: 42,
  location: 'San Francisco, CA',
  message: 'Air quality is good today — a great day to get outside.',
  temperature: '24',
  temperatureUnit: '°C',
  humidity: '48%',
  humidityUnit: 'Comfortable',
};

const ACTIONS = [
  {
    id: '1',
    icon: 'leaf-outline' as const,
    title: 'Keep windows open',
    subtitle: 'Fresh air circulation is safe at AQI 42',
  },
  {
    id: '2',
    icon: 'walk-outline' as const,
    title: 'Walk instead of drive',
    subtitle: 'Low AQI makes it ideal for outdoor movement',
  },
  {
    id: '3',
    icon: 'water-outline' as const,
    title: 'Stay well hydrated',
    subtitle: 'Helps your body filter airborne particles',
  },
  {
    id: '4',
    icon: 'fitness-outline' as const,
    title: 'Check AQI before your jog',
    subtitle: 'Evening air can vary — a quick check first',
  },
];

const INSIGHT = {
  title: 'Good air day ahead',
  body: 'AQI is low today, but avoid burning waste or candles indoors — even on clean days, indoor PM2.5 can spike quickly.',
};

// ─── HomeScreen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const toggleAction = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ── Theme tokens ────────────────────────────────────────────────────────
  const textPrimary = isDark
    ? designSystem.designSystem.colors.primary.mint
    : designSystem.designSystem.colors.primary.lightText;
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const sectionTitleColor = isDark
    ? '#F1F5F9'
    : designSystem.designSystem.colors.primary.lightText;
  const dividerColor = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(0,0,0,0.07)';
  const learnBg = isDark ? 'rgba(52, 211, 153, 0.08)' : '#F0FDF4';
  const learnBorder = isDark ? 'rgba(52, 211, 153, 0.18)' : '#BBF7D0';
  const learnTextColor = isDark
    ? designSystem.designSystem.colors.primary.mint
    : '#065F46';

  return (
    <ScreenWrapper>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 1 — AQI OVERVIEW
      ───────────────────────────────────────────────────────────────── */}
      <AQIRing value={AQI_DATA.value} />

      <View style={styles.locationSection}>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={textSecondary} />
          <Text style={[styles.locationText, { color: textSecondary }]}>
            {AQI_DATA.location}
          </Text>
        </View>
        <Text style={[styles.messageText, { color: textPrimary }]}>
          {AQI_DATA.message}
        </Text>
      </View>

      <View style={styles.statRow}>
        <StatCard
          icon="thermometer-outline"
          label="Temperature"
          value={AQI_DATA.temperature}
          unit={AQI_DATA.temperatureUnit}
        />
        <StatCard
          icon="water-outline"
          label="Humidity"
          value={AQI_DATA.humidity}
          unit={AQI_DATA.humidityUnit}
        />
      </View>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 2 — TODAY'S ACTIONS
      ───────────────────────────────────────────────────────────────── */}
      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
          Today's Actions
        </Text>
        <Text style={[styles.sectionSubtitle, { color: textSecondary }]}>
          Simple steps to protect your health
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        {ACTIONS.map(action => (
          <ActionCard
            key={action.id}
            icon={action.icon}
            title={action.title}
            subtitle={action.subtitle}
            completed={completedIds.has(action.id)}
            onToggle={() => toggleAction(action.id)}
          />
        ))}
      </View>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 3 — PROGRESS
      ───────────────────────────────────────────────────────────────── */}
      <DailyProgressBar
        completed={completedIds.size}
        total={ACTIONS.length}
      />

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 4 — INSIGHT CARD
      ───────────────────────────────────────────────────────────────── */}
      <View style={styles.insightSection}>
        <DailyTipCard title={INSIGHT.title} body={INSIGHT.body} />
      </View>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 5 — LEARN WHY LINK
      ───────────────────────────────────────────────────────────────── */}
      <Pressable
        style={({ pressed }) => [
          styles.learnRow,
          {
            backgroundColor: learnBg,
            borderColor: learnBorder,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Ionicons name="bulb-outline" size={16} color={learnTextColor} />
        <Text style={[styles.learnText, { color: learnTextColor }]}>
          Learn why air quality matters today
        </Text>
        <Ionicons name="arrow-forward-outline" size={14} color={learnTextColor} />
      </Pressable>

    </ScreenWrapper>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Section 1 ──────────────────────────────────────────────────────────
  locationSection: {
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  messageText: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },

  // ── Divider ────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    marginBottom: 24,
    borderRadius: 1,
  },

  // ── Section 2 ──────────────────────────────────────────────────────────
  sectionHeader: {
    gap: 4,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 13,
    fontWeight: '400',
  },
  actionsContainer: {
    gap: 10,
    marginBottom: 20,
  },

  // ── Section 4 ──────────────────────────────────────────────────────────
  insightSection: {
    marginTop: 16,
    marginBottom: 14,
  },

  // ── Section 5 ──────────────────────────────────────────────────────────
  learnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  learnText: {
    flex: 1,
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 14,
    fontWeight: '600',
  },
});
