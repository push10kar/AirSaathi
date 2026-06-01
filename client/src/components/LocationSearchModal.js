import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Text, 
  Platform, 
  TextInput, 
  FlatList, 
  ActivityIndicator,
  Keyboard,
  Animated,
  SafeAreaView
} from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';

const ResultItem = memo(({ item, theme, isDarkMode, onSelect }) => {
  const mainText = item.address?.city || item.address?.town || item.address?.suburb || item.name || 'Unknown';
  const subText = item.display_name;

  return (
    <TouchableOpacity 
      style={getStyles(theme, isDarkMode).resultItem} 
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      <View style={getStyles(theme, isDarkMode).resultIconWrap}>
        <Ionicons name="location" size={20} color={isDarkMode ? '#AAA' : '#666'} />
      </View>
      <View style={getStyles(theme, isDarkMode).resultTextWrap}>
        <Text style={getStyles(theme, isDarkMode).resultTitle} numberOfLines={1}>{mainText}</Text>
        <Text style={getStyles(theme, isDarkMode).resultSubtitle} numberOfLines={2}>{subText}</Text>
      </View>
    </TouchableOpacity>
  );
});

const ModernToggle = ({ active, onToggle, theme, isDarkMode }) => {
  const moveAnim = useRef(new Animated.Value(active ? 1 : 0)).current;
  
  useEffect(() => {
    Animated.spring(moveAnim, {
      toValue: active ? 1 : 0,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [active]);

  const translateX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 20],
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onToggle} style={[
      getStyles(theme, isDarkMode).toggleContainer, 
      { backgroundColor: active ? theme.colors.accent.primary : (isDarkMode ? '#333' : '#E0E0E0') }
    ]}>
      <Animated.View style={[getStyles(theme, isDarkMode).toggleCircle, { transform: [{ translateX }] }]} />
    </TouchableOpacity>
  );
};

export default function LocationSearchModal({ visible, onClose }) {
  const { theme, isDarkMode } = useAppTheme();
  const { setManualLocation, detectLocation, searchLocations, location, toggleAutoLocation } = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  const styles = getStyles(theme, isDarkMode);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await searchLocations(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  const handleSelect = (item) => {
    setManualLocation(item);
    onClose();
    setQuery('');
    setResults([]);
    Keyboard.dismiss();
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={28} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Select Your Location</Text>
          </View>

          {/* SEARCH BOX */}
          <View style={styles.searchContainer}>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="Search an area or address"
                placeholderTextColor={theme.colors.text.muted}
                value={query}
                onChangeText={setQuery}
                autoFocus={true}
                returnKeyType="search"
              />
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.accent.primary} />
              ) : query.length > 0 ? (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <MaterialIcons name="close" size={22} color={theme.colors.text.muted} />
                </TouchableOpacity>
              ) : (
                <Feather name="search" size={22} color={theme.colors.text.muted} />
              )}
            </View>
          </View>

          {/* RESULTS OR EMPTY STATE */}
          {query.length < 3 ? (
            <>
              {/* QUICK ACTIONS - Only show when not searching */}
              <View style={styles.quickActions}>
                <View style={styles.actionBtn}>
                  <ModernToggle 
                    active={location.isAuto} 
                    onToggle={() => toggleAutoLocation(!location.isAuto)} 
                    theme={theme}
                    isDarkMode={isDarkMode}
                  />
                  <Text style={styles.actionText}>Turn on Location</Text>
                </View>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  activeOpacity={0.7}
                  onPress={() => {}}
                >
                  <View style={styles.plusIconWrap}>
                    <Feather name="plus" size={18} color={theme.colors.accent.primary} />
                  </View>
                  <Text style={styles.actionText}>Add New Address</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.emptyContainer}>
                <View style={styles.illustrationWrap}>
                  <View style={styles.mapCircle}>
                    <Ionicons name="map-outline" size={120} color={isDarkMode ? '#222' : '#F0F0F0'} />
                    <View style={styles.magnifierWrap}>
                      <Ionicons name="search" size={60} color={isDarkMode ? '#444' : '#DDD'} />
                      <Text style={styles.questionMark}>?</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.emptyMuted}>You don't have any saved addresses</Text>
                <Text style={styles.emptyBold}>Add a new address and continue checking air quality</Text>
              </View>
            </>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item, index) => `${item.place_id}-${index}`}
              renderItem={({ item }) => (
                <ResultItem 
                  item={item} 
                  theme={theme} 
                  isDarkMode={isDarkMode} 
                  onSelect={handleSelect} 
                />
              )}
              ListHeaderComponent={() => (
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsHeaderText}>SEARCH RESULTS</Text>
                </View>
              )}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    marginBottom: 20,
  },
  backBtn: {
    marginRight: 16,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: theme.colors.text.primary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 1.5,
    borderColor: isDarkMode ? '#333' : '#EAEAEA',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.text.primary,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: isDarkMode ? '#333' : '#EAEAEA',
    gap: 10,
  },
  actionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: theme.colors.text.primary,
  },
  toggleContainer: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  plusIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 40,
  },
  illustrationWrap: {
    marginBottom: 40,
  },
  mapCircle: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  magnifierWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    position: 'absolute',
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: isDarkMode ? '#666' : '#999',
    top: 10,
  },
  emptyMuted: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyBold: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 10,
  },
  resultsHeaderText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 40,
  },
  resultItem: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#222' : '#F5F5F5',
  },
  resultIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: isDarkMode ? '#222' : '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resultTextWrap: {
    flex: 1,
  },
  resultTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
});
