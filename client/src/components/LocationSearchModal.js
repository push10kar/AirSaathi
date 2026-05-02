import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Platform } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';

export default function LocationSearchModal({ visible, onClose }) {
  const { theme, isDarkMode } = useAppTheme();
  const { setManualLocation, detectLocation } = useLocation();
  const styles = getStyles(theme, isDarkMode);

  // IMPORTANT: The user needs to provide their own Google Maps API Key
  const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Search Location</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.currentLocationBtn} onPress={() => { detectLocation(); onClose(); }}>
            <MaterialIcons name="my-location" size={20} color={theme.colors.accent.primary} />
            <Text style={styles.currentLocationText}>Use Current Location</Text>
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <GooglePlacesAutocomplete
              placeholder="Search city or area in Maharashtra..."
              fetchDetails={true}
              onPress={(data, details = null) => {
                setManualLocation(data, details);
                onClose();
              }}
              query={{
                key: GOOGLE_API_KEY,
                language: 'en',
                components: 'country:in', // Restrict to India
                location: '18.5204,73.8567', // Bias towards Maharashtra (Pune center)
                radius: '500000', // 500km radius
              }}
              styles={{
                textInputContainer: styles.textInputContainer,
                textInput: styles.textInput,
                predefinedPlacesDescription: {
                  color: theme.colors.accent.primary,
                },
                listView: styles.listView,
                row: styles.row,
                description: styles.description,
              }}
              nearbyPlacesAPI="GooglePlacesSearch"
              debounce={400}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 100 : 50,
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 20,
    color: theme.colors.text.primary,
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.elevated,
    marginBottom: 10,
  },
  currentLocationText: {
    fontFamily: theme.fonts.body.medium,
    fontSize: 16,
    color: theme.colors.accent.primary,
    marginLeft: 12,
  },
  searchContainer: {
    minHeight: 300,
  },
  textInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  textInput: {
    backgroundColor: theme.colors.background.elevated,
    height: 48,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: theme.fonts.body.regular,
    color: theme.colors.text.primary,
  },
  listView: {
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  row: {
    backgroundColor: 'transparent',
    padding: 13,
    height: 52,
    flexDirection: 'row',
  },
  description: {
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.body.regular,
  },
});
