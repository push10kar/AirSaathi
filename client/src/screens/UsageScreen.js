import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import TopAppBar from '../components/TopAppBar';

// Mock data for the chart
const chartData = [
  { day: 'MON', energy: 40, water: 60 },
  { day: 'TUE', energy: 55, water: 45 },
  { day: 'WED', energy: 70, water: 80 },
  { day: 'THU', energy: 85, water: 40, active: true },
  { day: 'FRI', energy: 40, water: 50 },
  { day: 'SAT', energy: 30, water: 35 },
  { day: 'SUN', energy: 50, water: 40 },
];

export default function UsageScreen({ onMenuPress }) {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <View style={styles.heroMain}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>WEEKLY INSIGHT</Text>
            </View>
            <Text style={styles.heroTitle}>
              Your efficiency rose by <Text style={styles.textPrimary}>12%</Text> since last Monday.
            </Text>
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatBlock}>
                <Text style={styles.heroStatLabel}>Avg. Daily Energy</Text>
                <Text style={styles.heroStatValue}>14.2 kWh</Text>
              </View>
              <View style={[styles.heroStatBlock, { marginLeft: 32 }]}>
                <Text style={styles.heroStatLabel}>Avg. Daily Water</Text>
                <Text style={styles.heroStatValue}>420 L</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.savingsCard}>
            <View style={styles.savingsCardHeader}>
              <MaterialIcons name="bolt" size={36} color={theme.colors.background.primary} />
              <MaterialIcons name="arrow-outward" size={24} color="rgba(255,255,255,0.5)" />
            </View>
            <View>
              <Text style={styles.savingsAmount}>-$42.00</Text>
              <Text style={styles.savingsLabel}>Estimated Savings this month</Text>
            </View>
          </View>
        </View>

        {/* Usage Trends */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Usage Trends</Text>
              <Text style={styles.sectionSubtitle}>7-Day Resource Comparison</Text>
            </View>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.accent.primary }]} />
                <Text style={styles.legendText}>Energy (kWh)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.support.teal }]} />
                <Text style={styles.legendText}>Water (L)</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {chartData.map((data, index) => (
              <View key={index} style={styles.chartCol}>
                <View style={styles.barsContainer}>
                  <View style={[
                    styles.bar, 
                    { height: `${data.energy}%`, backgroundColor: data.active ? theme.colors.accent.primary : 'rgba(0, 109, 50, 0.2)' }
                  ]} />
                  <View style={[
                    styles.bar, 
                    { height: `${data.water}%`, backgroundColor: data.active ? theme.colors.support.teal : 'rgba(0, 89, 187, 0.2)' }
                  ]} />
                </View>
                <Text style={[styles.chartDayLabel, data.active && { color: theme.colors.text.primary }]}>
                  {data.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Consumers */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { marginBottom: 24 }]}>Top Consumers</Text>
          
          <View style={styles.consumerCard}>
            <View style={styles.consumerHeader}>
              <View style={styles.consumerIconBg}>
                <MaterialIcons name="hvac" size={24} color={theme.colors.accent.primary} />
              </View>
              <Text style={[styles.consumerTrend, { color: theme.colors.support.error }]}>+4% vs LW</Text>
            </View>
            <Text style={styles.consumerTitle}>HVAC System</Text>
            <View style={styles.consumerValueRow}>
              <Text style={styles.consumerValue}>84.2</Text>
              <Text style={styles.consumerUnit}>kWh</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '75%', backgroundColor: theme.colors.accent.primary }]} />
            </View>
          </View>

          <View style={styles.consumerCard}>
            <View style={styles.consumerHeader}>
              <View style={styles.consumerIconBg}>
                <MaterialIcons name="local-laundry-service" size={24} color={theme.colors.support.teal} />
              </View>
              <Text style={[styles.consumerTrend, { color: theme.colors.accent.primary }]}>-12% vs LW</Text>
            </View>
            <Text style={styles.consumerTitle}>Dishwasher</Text>
            <View style={styles.consumerValueRow}>
              <Text style={styles.consumerValue}>156</Text>
              <Text style={styles.consumerUnit}>Liters</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '45%', backgroundColor: theme.colors.support.teal }]} />
            </View>
          </View>

          <View style={styles.consumerCard}>
            <View style={styles.consumerHeader}>
              <View style={styles.consumerIconBg}>
                <MaterialIcons name="ev-station" size={24} color={theme.colors.accent.primary} />
              </View>
              <Text style={[styles.consumerTrend, { color: theme.colors.text.secondary }]}>Stable</Text>
            </View>
            <Text style={styles.consumerTitle}>EV Charger</Text>
            <View style={styles.consumerValueRow}>
              <Text style={styles.consumerValue}>52.0</Text>
              <Text style={styles.consumerUnit}>kWh</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '60%', backgroundColor: theme.colors.accent.primary }]} />
            </View>
          </View>
        </View>

        {/* Anomaly Detection */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={styles.tipIconWrapper}>
              <MaterialIcons name="lightbulb" size={32} color={theme.colors.background.primary} />
            </View>
            <View style={styles.tipTextContainer}>
              <Text style={styles.tipTitle}>Smart Optimization Tip</Text>
              <Text style={styles.tipDescription}>
                Your hot water usage peaks between 7 AM and 8 AM. Shifting your dishwasher cycle to 11 PM could save you $14.50/month on off-peak rates.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.automateButton}>
            <Text style={styles.automateButtonText}>Automate Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100, // Make room for bottom nav
  },
  heroContainer: {
    marginBottom: 40,
  },
  heroMain: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: 'rgba(100, 255, 146, 0.3)', // primary-fixed/30
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontFamily: theme.fonts.label.semiBold,
    fontSize: 12,
    color: theme.colors.accent.primary,
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 32,
    lineHeight: 40,
    marginTop: 16,
    color: theme.colors.text.primary,
  },
  textPrimary: {
    color: theme.colors.accent.primary,
  },
  heroStatsRow: {
    flexDirection: 'row',
    marginTop: 32,
  },
  heroStatLabel: {
    fontFamily: theme.fonts.label.medium,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  heroStatValue: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 24,
    color: theme.colors.text.primary,
    marginTop: 4,
  },
  savingsCard: {
    backgroundColor: theme.colors.accent.primary,
    borderRadius: 24,
    padding: 32,
    shadowColor: theme.colors.accent.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  savingsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  savingsAmount: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 36,
    color: theme.colors.background.primary,
  },
  savingsLabel: {
    fontFamily: theme.fonts.label.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  sectionSubtitle: {
    fontFamily: theme.fonts.label.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontFamily: theme.fonts.body.medium,
    fontSize: 12,
    color: theme.colors.text.primary,
  },
  chartContainer: {
    height: 320,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(187, 203, 185, 0.1)',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'flex-end',
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 4,
  },
  bar: {
    width: 12,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    marginHorizontal: 2,
  },
  chartDayLabel: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 10,
    color: theme.colors.text.secondary,
    marginTop: 12,
  },
  consumerCard: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  consumerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  consumerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consumerTrend: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 12,
  },
  consumerTitle: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 18,
    color: theme.colors.text.primary,
  },
  consumerValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  consumerValue: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  consumerUnit: {
    fontFamily: theme.fonts.label.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: 8,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  tipCard: {
    backgroundColor: theme.colors.support.teal,
    borderRadius: 24,
    padding: 24,
  },
  tipHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tipIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 26, 65, 0.1)', // on-secondary-fixed with opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 20,
    color: theme.colors.background.primary,
  },
  tipDescription: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.background.primary,
    opacity: 0.8,
    marginTop: 8,
    lineHeight: 20,
  },
  automateButton: {
    backgroundColor: theme.colors.background.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  automateButtonText: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 14,
    color: theme.colors.support.teal,
  },
  bottomSpacer: {
    height: 40,
  },
});
