import React, { useState, useEffect, useRef, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated,
  TextInput,
  FlatList,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
  LayoutAnimation,
} from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

export default function LocationControlModal({ visible, onClose }) {
  const { theme, isDarkMode } = useAppTheme();
  const { 
    location, 
    detectLocation, 
    searchLocations, 
    setManualLocation, 
    toggleAutoLocation,
    savedAddresses,
    removeAddress
  } = useLocation();
  
  const [mode, setMode] = useState('compact'); // 'compact' or 'search'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dotCount, setDotCount] = useState(1);
  
  const debounceTimer = useRef(null);
  const searchInputRef = useRef(null);

  // Animation for loading dots (Peaceful & Slow)
  useEffect(() => {
    let interval;
    if (isDetecting) {
      interval = setInterval(() => {
        setDotCount(prev => (prev % 3) + 1);
      }, 600);
    } else {
      setDotCount(1);
    }
    return () => clearInterval(interval);
  }, [isDetecting]);

  // Focus search input when mode changes to 'search'
  useEffect(() => {
    if (mode === 'search' && visible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 600); // Wait for transition
    }
  }, [mode, visible]);

  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (visible) {
      setMode('compact');
      setQuery('');
      setResults([]);
      contentOpacity.setValue(1);
      setIsDetecting(false);
      setShowSuccess(false);
      // Animate In
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          tension: 40, // More peaceful spring
          friction: 12,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300, // Slower exit
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 400, // Slower exit
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  const handleModeTransition = (newMode) => {
    // Apple-like fluid layout transition
    LayoutAnimation.configureNext({
      duration: 600,
      create: { type: 'spring', springDamping: 0.8, property: 'opacity' },
      update: { type: 'spring', springDamping: 0.8 },
      delete: { type: 'spring', springDamping: 0.8, property: 'opacity' },
    });

    // Instead of fading to 0 first (which causes the white flash),
    // we switch mode and animate the new content in. 
    // LayoutAnimation handles the cross-dissolve of the elements themselves.
    setMode(newMode);
    
    // Animate the content opacity for a polished entrance
    contentOpacity.setValue(0);
    Animated.spring(contentOpacity, {
      toValue: 1,
      tension: 20,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleDetect = async () => {
    try {
      console.log('[LocationControlModal] Detect pressed');
      setIsDetecting(true);
      const success = await detectLocation();
      console.log('[LocationControlModal] Detection result:', success);
      
      if (success) {
        setIsDetecting(false);
        setShowSuccess(true);
        // Delay to show the success tick
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
        setIsDetecting(false);
        setShowSuccess(false);
      }
    } catch (err) {
      console.error('[LocationControlModal] Detection error:', err);
      setIsDetecting(false);
      setShowSuccess(false);
    }
  };

  const handleSelect = (item) => {
    setManualLocation(item);
    handleClose();
  };

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

  const isPermissionOff = location.permissionStatus === 'denied' || location.permissionStatus === 'undetermined';
  // Keep banner visible during detection and success phase to prevent flickering
  const showAutoOption = isPermissionOff || !location.isAuto || isDetecting || showSuccess;
  const styles = getStyles(theme, isDarkMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* BACKDROP */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity 
            activeOpacity={1} 
            style={{ flex: 1 }} 
            onPress={handleClose} 
          />
        </Animated.View>
        
        {/* UNIFIED SHEET */}
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ translateY: sheetTranslateY }] },
            mode === 'search' && styles.fullHeight
          ]}
        >
          <Animated.View style={{ opacity: contentOpacity, flex: mode === 'search' ? 1 : 0 }}>
            {mode === 'compact' ? (
              <View style={styles.compactContent}>
                {/* PERMISSION / DETECTION BANNER */}
                {showAutoOption && (
                  <View style={styles.permissionBanner}>
                    <View style={styles.bannerRow}>
                      <View style={styles.bannerLeft}>
                        <View style={styles.titleWithIcon}>
                          <Ionicons name="locate" size={24} color={isDarkMode ? '#000' : '#fff'} />
                          <Text style={styles.bannerTitle}>
                            {isPermissionOff ? "Location Permission is Off" : "Detect Current Location"}
                          </Text>
                        </View>
                        <Text style={styles.bannerSubtitle}>
                          {isPermissionOff 
                            ? "Granting location permission will ensure accurate data and local updates" 
                            : "Automatically find your nearest station for the most accurate air quality data"}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={[
                          styles.grantBtn, 
                          (isDetecting || showSuccess) && { width: 85, paddingHorizontal: 0 }
                        ]} 
                        onPress={handleDetect}
                        disabled={isDetecting || showSuccess}
                      >
                        {showSuccess ? (
                          <Feather name="check" size={24} color={theme.colors.accent.primary} />
                        ) : isDetecting ? (
                          <Text style={styles.dotsText}>
                            {dotCount === 1 ? '.' : dotCount === 2 ? '..' : '...'}
                          </Text>
                        ) : (
                          <Text style={styles.grantBtnText}>
                            {isPermissionOff ? "GRANT" : "ENABLE"}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* MANUAL SEARCH ROW (COMPACT) */}
                <TouchableOpacity 
                  style={styles.manualRow} 
                  onPress={() => handleModeTransition('search')}
                >
                  <View style={styles.manualContent}>
                    <Feather name="search" size={24} color={theme.colors.accent.primary} />
                    <Text style={styles.manualText}>Enter Location Manually</Text>
                  </View>
                </TouchableOpacity>

                {/* SAFE AREA SPACING FOR BOTTOM */}
                <View style={{ height: Platform.OS === 'ios' ? 40 : 24 }} />
              </View>
            ) : (
              <SafeAreaView style={styles.fullScreenContent}>
                {/* SEARCH HEADER */}
                <View style={styles.searchHeader}>
                  <TouchableOpacity onPress={() => handleModeTransition('compact')} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={28} color={theme.colors.text.primary} />
                  </TouchableOpacity>
                  <Text style={styles.searchTitle}>Select Your Location</Text>
                </View>

                {/* SEARCH BOX (FULL) */}
                <View style={styles.searchBoxContainer}>
                  <View style={styles.inputWrap}>
                    <TextInput
                      ref={searchInputRef}
                      style={styles.textInput}
                      placeholder="Search an area or address"
                      placeholderTextColor={theme.colors.text.muted}
                      value={query}
                      onChangeText={setQuery}
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

                {/* SEARCH ACTIONS & RESULTS */}
                {query.length < 3 ? (
                  <View style={{ flex: 1 }}>
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
                        onPress={() => searchInputRef.current?.focus()}
                      >
                        <View style={styles.plusIconWrap}>
                          <Feather name="plus" size={18} color={theme.colors.accent.primary} />
                        </View>
                        <Text style={styles.actionText}>Add New Address</Text>
                      </TouchableOpacity>
                    </View>

                    {savedAddresses.length > 0 ? (
                      <FlatList
                        data={savedAddresses}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                          <TouchableOpacity 
                            style={styles.recentItem} 
                            onPress={() => handleSelect(item)}
                          >
                            <View style={styles.recentLeft}>
                              <View style={styles.recentIconBox}>
                                <Ionicons name="time-outline" size={22} color={theme.colors.text.muted} />
                              </View>
                              <View style={styles.recentTextWrap}>
                                <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.recentAddr} numberOfLines={1}>{item.display_name}</Text>
                              </View>
                            </View>
                            <TouchableOpacity onPress={() => removeAddress(item.id)} style={styles.removeBtn}>
                              <MaterialIcons name="close" size={20} color={theme.colors.text.muted} />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        )}
                        ListHeaderComponent={() => (
                          <View style={styles.resultsListHeader}>
                            <Text style={styles.resultsListHeaderText}>RECENT ADDRESSES</Text>
                          </View>
                        )}
                        keyboardShouldPersistTaps="handled"
                      />
                    ) : (
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
                    )}
                  </View>
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
                      <View style={styles.resultsListHeader}>
                        <Text style={styles.resultsListHeaderText}>SEARCH RESULTS</Text>
                      </View>
                    )}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.listContent}
                  />
                )}
              </SafeAreaView>
            )}
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  compactContent: {
    width: '100%',
  },
  fullHeight: {
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  permissionBanner: {
    backgroundColor: theme.colors.accent.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bannerLeft: {
    flex: 1,
    gap: 6,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: isDarkMode ? '#000' : '#fff',
  },
  bannerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  grantBtn: {
    backgroundColor: isDarkMode ? '#1B3321' : '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  grantBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: isDarkMode ? '#c4ff01' : theme.colors.accent.primary,
  },
  dotsText: {
    fontFamily: 'Inter_900Black',
    fontSize: 28,
    color: theme.colors.accent.primary,
    lineHeight: 32,
    textAlign: 'center',
    letterSpacing: 2,
  },
  manualRow: {
    backgroundColor: theme.colors.background.primary,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  manualContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  manualText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  // Full screen styles
  fullScreenContent: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    marginBottom: 20,
  },
  backBtn: {
    marginRight: 16,
  },
  searchTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: theme.colors.text.primary,
  },
  searchBoxContainer: {
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
  resultsListHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 10,
  },
  resultsListHeaderText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: theme.colors.text.muted,
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
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#1A1A1A' : '#F5F5F5',
  },
  recentLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  recentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentTextWrap: {
    flex: 1,
    gap: 2,
  },
  recentName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  recentAddr: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: theme.colors.text.muted,
  },
  removeBtn: {
    padding: 8,
  },
});
