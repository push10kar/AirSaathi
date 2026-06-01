import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';
import ApplianceCard from '../components/ApplianceCard';
import AQIHero from '../components/AQIHero';
import DailyActions from '../components/DailyActions';
import InsightCard from '../components/InsightCard';
import CommunityPreview from '../components/CommunityPreview';

const DashboardScreen = React.memo(function DashboardScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const { 
    location, aqiData, nearestStation, loading: locationLoading, 
    detectLocation, refreshAqi 
  } = useLocation();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [refreshing, setRefreshing] = useState(false);
  
  const [hvacActive, setHvacActive] = useState(true);
  const [evActive, setEvActive] = useState(true);
  const [sprinklerActive, setSprinklerActive] = useState(false);

  const [dailyActions, setDailyActions] = useState([
    { id: 1, title: 'Wear mask outdoors', icon: 'masks', completed: false },
    { id: 2, title: 'Avoid burning waste', icon: 'delete-forever', completed: false },
    { id: 3, title: 'Use public transport', icon: 'directions-bus', completed: true },
    { id: 4, title: 'Check air filter', icon: 'filter-alt', completed: false },
  ]);

  const toggleAction = (id, newState) => {
    setDailyActions(prev => prev.map(a => a.id === id ? { ...a, completed: newState } : a));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // If we have a location, just refresh the data. Otherwise, try to detect.
    if (location.coords) {
      await refreshAqi();
    } else {
      await detectLocation();
    }
    setRefreshing(false);
  };

  // Default values while loading
  const displayAqi = aqiData?.aqi || 0;
  const displayStation = locationLoading 
    ? "Locating nearest station..." 
    : nearestStation 
      ? `${nearestStation.name} (${nearestStation.distance} km)` 
      : "No monitoring stations found in this area";

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.accent.primary]} />
        }
      >
        
        {/* AQI Hero Section */}
        <AQIHero 
          aqi={aqiData?.aqi} 
          displayAqi={aqiData?.displayAqi}
          nearbyArea={displayStation} 
          lastUpdated={aqiData?.updatedAt}
          theme={theme} 
        />

        {/* Stats Metadata (Temperature & Humidity) */}
        <View style={styles.statsContainer}>
          <View style={styles.statBoxLeft}>
            <Text style={styles.statLabel}>TEMPERATURE</Text>
            <View style={styles.statValueRow}>
              <Feather name="thermometer" size={20} color={theme.colors.accent.primary} style={{ marginRight: 8 }} />
              <Text style={styles.statValuePrimary}>{aqiData?.temp || '--'}°C</Text>
            </View>
          </View>
          <View style={styles.statBoxRight}>
            <Text style={styles.statLabelRight}>HUMIDITY</Text>
            <View style={styles.statValueRowRight}>
              <Text style={styles.statValueNormal}>{aqiData?.humidity || '--'}%</Text>
              <Feather name="droplet" size={20} color={theme.colors.support.teal} style={{ marginLeft: 8 }} />
            </View>
          </View>
        </View>

        {/* Today's Actions & Progress */}
        <DailyActions 
          actions={dailyActions} 
          onActionToggle={toggleAction} 
          theme={theme} 
        />

        {/* Insight Card */}
        <InsightCard theme={theme} />

        {/* Quick Actions (Existing Appliances) */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>Control your environment</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={styles.horizontalScrollContent}>
          <ApplianceCard
            title="HVAC"
            draw="1.2 kW"
            drawPercentage={66}
            icon={<Feather name="wind" size={24} color={theme.colors.accent.primary} />}
            activeColor={theme.colors.accent.primary}
            activeContainerColor="rgba(0, 209, 102, 0.2)"
            isActive={hvacActive}
            onToggle={setHvacActive}
          />
          <ApplianceCard
            title="EV Charger"
            draw="7.4 kW"
            drawPercentage={85}
            icon={<Feather name="zap" size={24} color={theme.colors.accent.primary} />}
            activeColor={theme.colors.accent.primary}
            activeContainerColor="rgba(0, 209, 102, 0.2)"
            isActive={evActive}
            onToggle={setEvActive}
          />
          <ApplianceCard
            title="Smart Sprinkler"
            draw="0 L/m"
            drawPercentage={0}
            icon={<Feather name="droplet" size={24} color={theme.colors.support.teal} />}
            activeColor={theme.colors.support.teal}
            activeContainerColor="rgba(0, 89, 187, 0.1)"
            isActive={sprinklerActive}
            onToggle={setSprinklerActive}
          />
        </ScrollView>

        {/* Smart Alert (Modified existing Bento Card) */}
        <View style={styles.bentoGrid}>
          <View style={styles.bentoCardSmall}>
            <Feather name="bell" size={32} color={theme.colors.background.primary} />
            <Text style={styles.bentoSmallTitle}>Smart Alert</Text>
            <Text style={styles.bentoSmallDescription}>
              Current status: {aqiData?.category || 'Analyzing...'}. 
              {displayAqi > 100 ? ' High pollution levels detected. Keep windows closed.' : ' Air quality is acceptable for outdoor activity.'}
            </Text>
            <Text style={styles.bentoSmallStatus}>Active</Text>
          </View>
        </View>

        {/* Community Highlight */}
        <CommunityPreview theme={theme} />

        {/* Spacer for bottom nav */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
});

export default DashboardScreen;

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 140, // Make room for bottom nav
  },
  centerpieceContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
    width: '100%',
  },
  statBoxLeft: {
    flex: 1,
  },
  statBoxRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statLabel: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statLabelRight: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'right',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValueRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  statValuePrimary: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 22,
    color: theme.colors.accent.primary,
  },
  statValueNormal: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 22,
    color: theme.colors.text.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 48,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  sectionSubtitle: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  viewAllText: {
    fontFamily: theme.fonts.body.semiBold,
    fontSize: 14,
    color: theme.colors.accent.primary,
  },
  horizontalScroll: {
    marginLeft: -24,
    marginRight: -24,
  },
  horizontalScrollContent: {
    paddingLeft: 24,
    paddingRight: 0,
    paddingBottom: 8,
  },
  bentoGrid: {
    marginTop: 48,
  },
  bentoCardSmall: {
    backgroundColor: theme.colors.support.teal,
    borderRadius: 24,
    padding: 32,
  },
  bentoSmallTitle: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 18,
    color: theme.colors.background.primary,
    marginTop: 16,
  },
  bentoSmallDescription: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    lineHeight: 20,
  },
  bentoSmallStatus: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 24,
    color: theme.colors.background.primary,
    marginTop: 24,
  },
  bottomSpacer: {
    height: 40,
  },
});
