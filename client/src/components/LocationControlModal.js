import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';

export default function LocationControlModal({ visible, onClose }) {
  const { theme, isDarkMode } = useAppTheme();
  const { location, detectLocation, setManualLocation } = useLocation();
  
  // Mock saved places (In a real app, these would come from the context/storage)
  const [savedPlaces, setSavedPlaces] = useState([
    { id: '1', city: 'Mumbai', aqi: 156, status: 'Poor', isPinned: false },
    { id: '2', city: 'Delhi', aqi: 312, status: 'Hazardous', isPinned: true },
    { id: '3', city: 'Bangalore', aqi: 42, status: 'Good', isPinned: false },
  ]);

  const styles = getStyles(theme, isDarkMode);

  const togglePin = (id) => {
    setSavedPlaces(prev => prev.map(p => ({
      ...p,
      isPinned: p.id === id ? !p.isPinned : false // Only one pinned at a time
    })));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.backdrop} 
          onPress={onClose} 
        />
        
        <View style={styles.modalContainer}>
          <View style={styles.indicator} />
          
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Location Hub</Text>
              <Text style={styles.subtitle}>Manage your monitoring zones</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={theme.colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* 1. AUTO LOCATION CONTROL */}
            <View style={styles.section}>
              <View style={styles.controlRow}>
                <View style={styles.controlInfo}>
                  <View style={[styles.iconBox, { backgroundColor: theme.colors.accent.primary + '20' }]}>
                    <Ionicons name="location" size={20} color={theme.colors.accent.primary} />
                  </View>
                  <View>
                    <Text style={styles.controlTitle}>Automatic Location</Text>
                    <Text style={styles.controlDesc}>Uses GPS for real-time tracking</Text>
                  </View>
                </View>
                <Switch 
                  value={location.isAuto} 
                  onValueChange={detectLocation}
                  trackColor={{ false: theme.colors.background.elevated, true: theme.colors.accent.primary }}
                  thumbColor={Platform.OS === 'ios' ? '#fff' : (location.isAuto ? '#fff' : '#f4f3f4')}
                />
              </View>
              
              {location.isAuto && (
                <View style={styles.currentLocationCard}>
                  <View style={styles.dot} />
                  <Text style={styles.currentLocationText}>
                    Currently tracking: <Text style={styles.boldText}>{location.city}</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* 2. PINNED / HOME LOCATION */}
            <Text style={styles.sectionLabel}>Pinned Places</Text>
            {savedPlaces.filter(p => p.isPinned).map(place => (
              <View key={place.id} style={styles.placeCard}>
                <View style={styles.placeInfo}>
                  <View style={[styles.statusIndicator, { backgroundColor: getAQIColor(place.aqi) }]} />
                  <View>
                    <Text style={styles.placeName}>{place.city}</Text>
                    <Text style={styles.placeAqi}>AQI: {place.aqi} • {place.status}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => togglePin(place.id)}>
                  <MaterialIcons name="push-pin" size={22} color={theme.colors.accent.primary} />
                </TouchableOpacity>
              </View>
            ))}

            {/* 3. SAVED PLACES */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Saved Places</Text>
              <TouchableOpacity style={styles.addBtn}>
                <Feather name="plus" size={18} color={theme.colors.accent.primary} />
                <Text style={styles.addBtnText}>Add New</Text>
              </TouchableOpacity>
            </View>

            {savedPlaces.filter(p => !p.isPinned).map(place => (
              <View key={place.id} style={styles.placeCard}>
                <View style={styles.placeInfo}>
                  <View style={[styles.statusIndicator, { backgroundColor: getAQIColor(place.aqi) }]} />
                  <View>
                    <Text style={styles.placeName}>{place.city}</Text>
                    <Text style={styles.placeAqi}>AQI: {place.aqi} • {place.status}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => togglePin(place.id)}>
                  <MaterialIcons name="push-pin" size={22} color={theme.colors.text.muted} />
                </TouchableOpacity>
              </View>
            ))}

            {/* 4. PRIVACY NOTE */}
            <View style={styles.privacyBox}>
              <Feather name="shield" size={16} color={theme.colors.text.muted} />
              <Text style={styles.privacyText}>
                Your location data is processed locally and never shared with third parties. 
                We use it only to fetch relevant air quality data.
              </Text>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#00E400';
  if (aqi <= 100) return '#FFFF00';
  if (aqi <= 150) return '#FF7E00';
  if (aqi <= 200) return '#FF0000';
  if (aqi <= 300) return '#8F3F97';
  return '#7E0023';
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '75%',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  indicator: {
    width: 40,
    height: 5,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 14,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: 20,
    borderRadius: 24,
  },
  controlInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  controlTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  controlDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  currentLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E400',
    marginRight: 10,
  },
  currentLocationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  boldText: {
    fontFamily: 'Inter_700Bold',
    color: theme.colors.text.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent.primary + '15',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  addBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: theme.colors.accent.primary,
    marginLeft: 4,
  },
  placeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
  },
  placeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 16,
  },
  placeName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  placeAqi: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  privacyBox: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  privacyText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: theme.colors.text.muted,
    marginLeft: 12,
    lineHeight: 16,
  }
});
