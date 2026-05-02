import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';
import CircularProgress from '../components/CircularProgress';
import ApplianceCard from '../components/ApplianceCard';
import TopAppBar from '../components/TopAppBar';

// API Configuration
// Use '10.0.2.2' for Android Emulator, or your computer's local IP (e.g. 192.168.1.5) for physical devices
const API_BASE_URL = 'http://10.0.2.2:5000/api'; 

export default function DashboardScreen({ onMenuPress }) {
  const { theme, isDarkMode } = useAppTheme();
  const { location, loading: locationLoading } = useLocation();
  const styles = getStyles(theme);

  const [aqiData, setAqiData] = useState({ aqi: 42, city: location.city });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [hvacActive, setHvacActive] = useState(true);
  const [evActive, setEvActive] = useState(true);
  const [sprinklerActive, setSprinklerActive] = useState(false);

  const fetchAQI = async () => {
    try {
      const { latitude, longitude } = location.coords;
      const response = await fetch(`${API_BASE_URL}/aqi/live?lat=${latitude}&lng=${longitude}`);
      const data = await response.json();
      if (data && data.aqi) {
        setAqiData(data);
      }
    } catch (error) {
      console.error('Failed to fetch AQI:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAQI();
  }, [location.coords]); // Re-fetch when location changes

  const onRefresh = () => {
    setRefreshing(true);
    fetchAQI();
  };

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
        
        {/* Centerpiece Dial */}
        <View style={styles.centerpieceContainer}>
          <CircularProgress aqi={aqiData.aqi} />
        </View>

        {/* Stats Metadata */}
        <View style={styles.statsContainer}>
          <View style={styles.statBoxLeft}>
            <Text style={styles.statLabel}>ENERGY EFFICIENCY</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValuePrimary}>88%</Text>
              <MaterialIcons name="trending-up" size={16} color={theme.colors.accent.primary} style={{ marginLeft: 4 }} />
            </View>
          </View>
          <View style={styles.statBoxRight}>
            <Text style={styles.statLabelRight}>RESOURCE HEALTH</Text>
            <View style={styles.statValueRowRight}>
              <Text style={styles.statValueNormal}>Optimal</Text>
            </View>
          </View>
        </View>

        {/* Active Appliances */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Active Appliances</Text>
            <Text style={styles.sectionSubtitle}>3 systems drawing power</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={styles.horizontalScrollContent}>
          <ApplianceCard
            title="HVAC"
            draw="1.2 kW"
            drawPercentage={66}
            icon={<MaterialIcons name="ac-unit" size={24} color={theme.colors.accent.primary} />}
            activeColor={theme.colors.accent.primary}
            activeContainerColor="rgba(0, 209, 102, 0.2)"
            isActive={hvacActive}
            onToggle={setHvacActive}
          />
          <ApplianceCard
            title="EV Charger"
            draw="7.4 kW"
            drawPercentage={85}
            icon={<MaterialIcons name="ev-station" size={24} color={theme.colors.accent.primary} />}
            activeColor={theme.colors.accent.primary}
            activeContainerColor="rgba(0, 209, 102, 0.2)"
            isActive={evActive}
            onToggle={setEvActive}
          />
          <ApplianceCard
            title="Smart Sprinkler"
            draw="0 L/m"
            drawPercentage={0}
            icon={<MaterialIcons name="waves" size={24} color={theme.colors.support.teal} />}
            activeColor={theme.colors.support.teal}
            activeContainerColor="rgba(0, 89, 187, 0.1)"
            isActive={sprinklerActive}
            onToggle={setSprinklerActive}
          />
        </ScrollView>

        {/* Bento Grid Insights */}
        <View style={styles.bentoGrid}>
          {/* Peak Saving Window */}
          <View style={styles.bentoCardLarge}>
            <Text style={styles.bentoTitle}>Live in {aqiData.city}</Text>
            <Text style={styles.bentoDescription}>
              The current air quality is {aqiData.aqi > 100 ? 'Poor' : 'Good'}. {aqiData.aqi > 100 ? 'Avoid heavy outdoor exercise.' : 'Perfect time for a morning walk!'}
            </Text>
            <TouchableOpacity style={styles.scheduleButton}>
              <Text style={styles.scheduleButtonText}>Detailed Report</Text>
            </TouchableOpacity>
            
            {/* Background Icon Watermark */}
            <MaterialIcons 
              name="bolt" 
              size={120} 
              color={theme.colors.accent.primary} 
              style={styles.watermarkIcon} 
            />
          </View>

          {/* Water Leak Alert */}
          <View style={styles.bentoCardSmall}>
            <MaterialIcons name="water-drop" size={32} color={theme.colors.background.primary} />
            <Text style={styles.bentoSmallTitle}>Water Leak Alert</Text>
            <Text style={styles.bentoSmallDescription}>No abnormal flow detected in the main line today.</Text>
            <Text style={styles.bentoSmallStatus}>Secure</Text>
          </View>
        </View>

        {/* Spacer for bottom nav */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100, // Make room for bottom nav
  },
  centerpieceContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
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
    alignItems: 'flex-end',
  },
  statValueRowRight: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  statValuePrimary: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 24,
    color: theme.colors.accent.primary,
  },
  statValueNormal: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 24,
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
  bentoCardLarge: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(187, 203, 185, 0.1)', // outline-variant with opacity
    overflow: 'hidden',
  },
  bentoTitle: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 20,
    color: theme.colors.text.primary,
  },
  bentoDescription: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 8,
    maxWidth: '80%',
    lineHeight: 20,
  },
  scheduleButton: {
    backgroundColor: theme.colors.accent.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 24,
    zIndex: 10,
  },
  scheduleButtonText: {
    fontFamily: theme.fonts.body.semiBold,
    fontSize: 14,
    color: theme.colors.background.primary,
  },
  watermarkIcon: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    opacity: 0.1,
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
