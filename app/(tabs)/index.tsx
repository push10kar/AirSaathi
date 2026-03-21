import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import designSystem from '../../context/design_system.json';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import AQIRing from '../../components/AQIRing';
import StatCard from '../../components/StatCard';
import StrategyCard from '../../components/StrategyCard';
import DailyTipCard from '../../components/DailyTipCard';

// ─── Mock Data ─────────────────────────────────────────────────────
const AQI_DATA = {
  value: 42,
  location: 'San Francisco, CA',
  description: 'Air quality is good today. A great day for a walk.',
  pm25: '12.4',
  pm25Unit: 'μg/m³',
  humidity: '48%',
  humidityUnit: 'Comfortable',
};

const STRATEGIES = [
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Air Purification',
    description: 'Run your HEPA filter on high for the next 2 hours for optimal indoor air.',
  },
  {
    icon: 'car-outline' as const,
    title: 'Travel Strategy',
    description: 'Use a recirculating air setting if driving today to minimize traffic exhaust exposure.',
  },
  {
    icon: 'fitness-outline' as const,
    title: 'Physical Activity',
    description: 'Move your workout indoors this evening to avoid localized PM2.5 peaks.',
  },
];

const DAILY_TIP = {
  title: 'Did you know?',
  body: 'Cooking with high heat can temporarily raise indoor PM2.5 levels by 10x. Always use a range hood or open a window during active cooking.',
};

// ─── HomeScreen ────────────────────────────────────────────────────
export default function HomeScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textPrimary = isDark
    ? designSystem.designSystem.colors.primary.mint
    : designSystem.designSystem.colors.primary.lightText;
  const textSecondary = isDark ? '#94A3B8' : '#475569';
  const sectionTitle = isDark ? '#F1F5F9' : designSystem.designSystem.colors.primary.lightText;
  const accentColor = isDark
    ? designSystem.designSystem.colors.primary.mint
    : '#065F46';

  return (
    <ScreenWrapper>
      {/* ── AQI Ring Section ──────────────────────────────── */}
      <AQIRing value={AQI_DATA.value} />

      {/* ── Location ──────────────────────────────────────── */}
      <View style={styles.locationSection}>
        <Text style={[styles.locationText, { color: textPrimary }]}>
          {AQI_DATA.location}
        </Text>
        <Text style={[styles.descriptionText, { color: textSecondary }]}>
          {AQI_DATA.description}
        </Text>
      </View>

      {/* ── Stat Cards ────────────────────────────────────── */}
      <View style={styles.statRow}>
        <StatCard
          icon="analytics-outline"
          label="PM2.5"
          value={AQI_DATA.pm25}
          unit={AQI_DATA.pm25Unit}
        />
        <StatCard
          icon="water-outline"
          label="Humidity"
          value={AQI_DATA.humidity}
          unit={AQI_DATA.humidityUnit}
        />
      </View>

      {/* ── Personal Protection Section ───────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: sectionTitle }]}>
          Personal Protection
        </Text>
        <View style={styles.exposureBadge}>
          <View style={[styles.exposureDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.exposureText, { color: accentColor }]}>
            CURRENT EXPOSURE: LOW
          </Text>
        </View>
      </View>

      {/* ── Strategy Cards ────────────────────────────────── */}
      <View style={styles.strategiesContainer}>
        {STRATEGIES.map((strategy, index) => (
          <StrategyCard
            key={index}
            icon={strategy.icon}
            title={strategy.title}
            description={strategy.description}
            onPress={() => {}}
          />
        ))}
      </View>

      {/* ── Daily Tip ─────────────────────────────────────── */}
      <DailyTipCard title={DAILY_TIP.title} body={DAILY_TIP.body} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  locationSection: {
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 20,
  },
  locationText: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 20,
    fontWeight: '700',
  },
  descriptionText: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  sectionHeader: {
    gap: 6,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 20,
    fontWeight: '700',
  },
  exposureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exposureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exposureText: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  strategiesContainer: {
    gap: 12,
    marginBottom: 24,
  },
});
