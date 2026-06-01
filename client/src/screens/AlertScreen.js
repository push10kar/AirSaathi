import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAppTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';
import apiRequest from '../services/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AlertScreen = React.memo(function AlertScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);
  const { location, aqiData, nearestStation } = useLocation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [healthMeta, setHealthMeta] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const fetchHistory = async () => {
    if (!nearestStation?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await apiRequest(`/aqi/history/${nearestStation.id}?hours=24`);
      if (data.status === 'success') {
        setHistoryData(data.data);
        setHealthMeta(data.meta.healthImpact);
      }

      // Fetch alerts for the city
      if (location?.city) {
        const { data: alertData } = await apiRequest(`/aqi/alerts?city=${location.city}`);
        if (alertData.status === 'success') {
          setAlerts(alertData.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [nearestStation?.id, location.city]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.accent.primary} />
      </View>
    );
  }

  // Prepare chart data
  const chartLabels = historyData.length > 6 
    ? historyData.filter((_, i) => i % 4 === 0).map(d => new Date(d.recorded_at).getHours() + ":00")
    : [];
  
  const chartValues = historyData.map(d => parseFloat(d.pm25 || 0));

  const chartConfig = {
    backgroundGradientFrom: theme.colors.background.secondary,
    backgroundGradientTo: theme.colors.background.secondary,
    color: (opacity = 1) => theme.colors.accent.primary,
    labelColor: (opacity = 1) => theme.colors.text.muted,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.colors.accent.primary
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Insights Hub</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Monitoring: {nearestStation?.name || 'Local Station'}
          </Text>
        </View>

        {/* 1. Health Impact Hero (The Cigarette Metric) */}
        <View style={[styles.heroCard, { 
          backgroundColor: (aqiData?.pm25 > 35 ? theme.colors.support.error : theme.colors.support.teal) + '15', 
          borderColor: (aqiData?.pm25 > 35 ? theme.colors.support.error : theme.colors.support.teal) + '30' 
        }]}>
          <View style={styles.heroHeader}>
            <MaterialIcons name="smoking-rooms" size={32} color={aqiData?.pm25 > 35 ? theme.colors.support.error : theme.colors.support.teal} />
            <Text style={[styles.heroTitle, { color: theme.colors.text.primary }]}>Health Impact</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.metricValue, { color: aqiData?.pm25 > 35 ? theme.colors.support.error : theme.colors.support.teal }]}>
              {aqiData?.pm25 ? (aqiData.pm25 / 22).toFixed(1) : '0.0'}
            </Text>
            <View style={styles.metricLabelCol}>
              <Text style={[styles.metricUnit, { color: theme.colors.text.primary }]}>Cigarettes / Day</Text>
              <Text style={[styles.metricDesc, { color: theme.colors.text.secondary }]}>Equivalent PM2.5 exposure</Text>
            </View>
          </View>
          <View style={[styles.impactBadge, { backgroundColor: aqiData?.pm25 > 35 ? theme.colors.support.error : theme.colors.support.teal }]}>
            <Text style={styles.impactBadgeText}>
              {aqiData?.pm25 ? (aqiData.pm25 > 150 ? 'Critical' : aqiData.pm25 > 35 ? 'High' : 'Low') : 'Analyzing'} Risk
            </Text>
          </View>
        </View>

        {/* 2. Trend Chart */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>24h PM2.5 Trend</Text>
          <Feather name="trending-up" size={18} color={theme.colors.accent.primary} />
        </View>

        {chartValues.length > 0 ? (
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: chartLabels,
                datasets: [{ data: chartValues }]
              }}
              width={SCREEN_WIDTH - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
            />
          </View>
        ) : (
          <View style={[styles.noData, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={{ color: theme.colors.text.muted }}>Not enough history data yet</Text>
          </View>
        )}

        {/* 3. Detailed Pollutants Bento */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Pollutant Breakdown</Text>
        </View>

        <View style={styles.bentoGrid}>
          <View style={styles.bentoRow}>
            <PollutantCard 
              label="PM2.5" 
              value={aqiData?.pm25?.toFixed(1) || '--'} 
              unit="µg/m³" 
              status={aqiData?.pm25 < 15 ? 'Good' : 'Moderate'}
              theme={theme}
            />
            <PollutantCard 
              label="PM10" 
              value={aqiData?.pm10?.toFixed(1) || '--'} 
              unit="µg/m³" 
              status={aqiData?.pm10 < 50 ? 'Good' : 'Moderate'}
              theme={theme}
            />
          </View>
          <View style={styles.bentoRow}>
            <PollutantCard 
              label="NO₂" 
              value={aqiData?.no2?.toFixed(1) || '--'} 
              unit="µg/m³" 
              status={aqiData?.no2 < 40 ? 'Good' : 'Moderate'}
              theme={theme}
            />
            <PollutantCard 
              label="O₃" 
              value={aqiData?.o3?.toFixed(1) || '--'} 
              unit="µg/m³" 
              status={aqiData?.o3 < 100 ? 'Good' : 'Moderate'}
              theme={theme}
            />
          </View>
          <View style={styles.bentoRow}>
            <PollutantCard 
              label="CO" 
              value={(aqiData?.co / 1000)?.toFixed(2) || '--'} 
              unit="mg/m³" 
              status={aqiData?.co < 4000 ? 'Good' : 'Moderate'}
              theme={theme}
            />
            <PollutantCard 
              label="SO₂" 
              value={aqiData?.so2?.toFixed(1) || '--'} 
              unit="µg/m³" 
              status={aqiData?.so2 < 20 ? 'Good' : 'Moderate'}
              theme={theme}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Active Alerts</Text>
        </View>

        {alerts.length > 0 ? (
          alerts.map(alert => (
            <View key={alert.id} style={[styles.alertCard, { backgroundColor: theme.colors.background.secondary }]}>
              <View style={[styles.alertIndicator, { backgroundColor: getSeverityColor(alert.severity, theme) }]} />
              <View style={styles.alertContent}>
                <View style={styles.alertHeaderRow}>
                  <Text style={[styles.alertTitle, { color: theme.colors.text.primary }]}>{alert.title}</Text>
                  <Feather 
                    name={alert.severity === 'critical' ? "alert-triangle" : "info"} 
                    size={16} 
                    color={getSeverityColor(alert.severity, theme)} 
                  />
                </View>
                <Text style={[styles.alertDesc, { color: theme.colors.text.secondary }]}>{alert.description}</Text>
                <Text style={[styles.alertTime, { color: theme.colors.text.muted }]}>
                  {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.noAlerts, { backgroundColor: theme.colors.background.secondary }]}>
            <Feather name="shield" size={24} color={theme.colors.support.teal} />
            <Text style={[styles.noAlertsText, { color: theme.colors.text.secondary }]}>No active alerts for {location.city}</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
});

const getSeverityColor = (severity, theme) => {
  switch (severity) {
    case 'critical': return theme.colors.support.error;
    case 'warning': return '#FF9500';
    case 'info': return theme.colors.support.teal;
    default: return theme.colors.text.muted;
  }
};

const PollutantCard = ({ label, value, unit, status, theme }) => (
  <View style={{
    flex: 1,
    padding: 20,
    borderRadius: 24,
    backgroundColor: theme.colors.background.secondary
  }}>
    <Text style={{
      fontFamily: 'Inter_700Bold',
      fontSize: 12,
      letterSpacing: 0.5,
      marginBottom: 8,
      color: theme.colors.text.muted
    }}>{label}</Text>
    <View style={{
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 12,
    }}>
      <Text style={{
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 24,
        marginRight: 4,
        color: theme.colors.text.primary
      }}>{value}</Text>
      <Text style={{
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: theme.colors.text.muted
      }}>{unit}</Text>
    </View>
    <View style={{
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: status === 'Good' ? '#34C75920' : '#FF950020'
    }}>
      <Text style={{
        fontFamily: 'Inter_700Bold',
        fontSize: 10,
        textTransform: 'uppercase',
        color: status === 'Good' ? '#34C759' : '#FF9500'
      }}>{status}</Text>
    </View>
  </View>
);

export default AlertScreen;

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 140,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginTop: 4,
  },
  heroCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 32,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  heroTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  metricValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 56,
    lineHeight: 64,
    marginRight: 12,
  },
  metricLabelCol: {
    paddingBottom: 8,
  },
  metricUnit: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  metricDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  impactBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  impactBadgeText: {
    color: '#FFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
  },
  chartContainer: {
    backgroundColor: 'transparent',
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    height: 200,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  bentoGrid: {
    gap: 12,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
  },
  pLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  pValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    marginRight: 4,
  },
  pUnit: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  pStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pStatusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  bottomSpacer: {
    height: 40,
  },
  alertCard: {
    flexDirection: 'row',
    borderRadius: 24,
    marginBottom: 12,
    overflow: 'hidden',
  },
  alertIndicator: {
    width: 6,
  },
  alertContent: {
    flex: 1,
    padding: 20,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
  },
  alertDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertTime: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  noAlerts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 24,
    gap: 12,
  },
  noAlertsText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});
