import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  FlatList,
} from 'react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { LEARN_TAXONOMY } from '../data/learnTaxonomy';

const { width: SCREEN_WIDTH } = Dimensions.get('window');



// ─────────────────────────────────────────────────────────────
// Sub-Component: Common Card Component
// ─────────────────────────────────────────────────────────────
const LearnCard = React.memo(({ title, subtitle, category, icon, color, onPress, theme, isDarkMode }) => {
  const styles = getStyles(theme, isDarkMode);
  // In dark mode, we use the neon green theme consistently as per user request
  const accentColor = isDarkMode ? theme.colors.accent.primary : (color || theme.colors.accent.primary);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(196, 255, 1, 0.1)' : accentColor + '15' }]}>
        <MaterialIcons name={icon || 'book'} size={24} color={accentColor} />
      </View>
      <View style={styles.cardContent}>
        {category && (
          <Text style={[styles.cardCategory, { color: accentColor }]}>
            {category.toUpperCase()}
          </Text>
        )}
        <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.cardShort, { color: theme.colors.text.secondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      <Feather name="chevron-right" size={20} color={isDarkMode ? theme.colors.accent.primary : theme.colors.text.muted} />
    </TouchableOpacity>
  );
});

// ─────────────────────────────────────────────────────────────
// Main Component: LearnScreen
// ─────────────────────────────────────────────────────────────
const LearnScreen = React.memo(function LearnScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);
  const [viewStack, setViewStack] = useState([{ type: 'categories', data: null }]);
  const [search, setSearch] = useState('');
  const scrollRef = useRef(null);

  const currentView = viewStack[viewStack.length - 1];

  // Search Logic (Searches across all topics in all categories)
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const results = [];
    LEARN_TAXONOMY.forEach(cat => {
      cat.subCategories.forEach(sub => {
        sub.topics.forEach(topic => {
          if (topic.title.toLowerCase().includes(search.toLowerCase()) ||
            topic.content.toLowerCase().includes(search.toLowerCase())) {
            results.push({ ...topic, subId: sub.id, parentColor: cat.color });
          }
        });
      });
    });
    return results;
  }, [search]);

  const navigateTo = useCallback((type, data) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewStack(prev => [...prev, { type, data }]);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const goBack = useCallback(() => {
    if (viewStack.length > 1) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setViewStack(prev => prev.slice(0, -1));
    }
  }, [viewStack]);

  const renderHeader = () => {
    if (currentView.type === 'categories') {
      return (
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Knowledge Hub</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Master air quality and health science.
          </Text>

          <View style={[styles.searchBox, { backgroundColor: theme.colors.background.secondary }]}>
            <Feather name="search" size={20} color={theme.colors.text.muted} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text.primary }]}
              placeholder="Search all topics..."
              placeholderTextColor={theme.colors.text.muted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={18} color={theme.colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.navInfo}>
          <Text style={[styles.navTag, { color: theme.colors.text.muted }]}>
            {currentView.type === 'subcategories' ? 'CATEGORY' : 'TOPIC'}
          </Text>
          <Text style={[styles.navTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
            {currentView.data.title}
          </Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (search.trim()) {
      return (
        <View style={styles.listContent}>
          {searchResults.map((item, idx) => (
            <LearnCard
              key={idx}
              title={item.title}
              subtitle={item.content}
              category="Search Result"
              color={item.parentColor}
              theme={theme}
              isDarkMode={isDarkMode}
              onPress={() => {
                setSearch('');
                navigateTo('article', { topics: [item], title: item.title, parentColor: item.parentColor });
              }}
            />
          ))}
          {searchResults.length === 0 && (
            <View style={styles.emptyContainer}>
              <Feather name="search" size={48} color={theme.colors.background.secondary} />
              <Text style={[styles.emptyText, { color: theme.colors.text.muted }]}>No results found.</Text>
            </View>
          )}
        </View>
      );
    }

    if (currentView.type === 'categories') {
      return (
        <View style={styles.listContent}>
          {LEARN_TAXONOMY.map(cat => (
            <LearnCard
              key={cat.id}
              title={cat.title}
              subtitle={cat.description}
              category={`Level ${cat.id}`}
              icon={cat.icon}
              color={cat.color}
              theme={theme}
              isDarkMode={isDarkMode}
              onPress={() => navigateTo('subcategories', cat)}
            />
          ))}

          <View style={[styles.missionBox, { backgroundColor: theme.colors.background.secondary }]}>
            <Ionicons name="shield-checkmark" size={24} color={theme.colors.support.teal} />
            <Text style={[styles.missionText, { color: theme.colors.text.secondary }]}>
              AirSaathi Academy: Educating, warning, and guiding action.
            </Text>
          </View>
        </View>
      );
    }

    if (currentView.type === 'subcategories') {
      const category = currentView.data;
      return (
        <View style={styles.listContent}>
          {category.subCategories.map(sub => (
            <LearnCard
              key={sub.id}
              title={sub.title}
              subtitle={`${sub.topics.length} Sections`}
              category={sub.id}
              color={category.color}
              theme={theme}
              isDarkMode={isDarkMode}
              onPress={() => navigateTo('article', { ...sub, parentColor: category.color })}
            />
          ))}
        </View>
      );
    }

    if (currentView.type === 'article') {
      const sub = currentView.data;
      return (
        <View style={styles.articleContainer}>
          {sub.topics.map((topic, index) => (
            <View key={topic.id} style={styles.topicSection}>
              <View style={styles.topicLabel}>
                <View style={[styles.topicDot, { backgroundColor: isDarkMode ? theme.colors.accent.primary : (sub.parentColor || theme.colors.accent.primary) }]} />
                <Text style={[styles.topicTitle, { color: theme.colors.text.primary }]}>
                  {topic.title}
                </Text>
              </View>
              <Text style={[styles.topicText, { color: theme.colors.text.secondary }]}>
                {topic.content}
              </Text>
              {index < sub.topics.length - 1 && <View style={styles.divider} />}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: isDarkMode ? theme.colors.accent.primary : (sub.parentColor || theme.colors.accent.primary) }]}
            onPress={goBack}
          >
            <Text style={[styles.doneBtnText, { color: isDarkMode ? '#000' : '#FFF' }]}>Completed</Text>
            <Feather name="check" size={20} color={isDarkMode ? '#000' : '#FFF'} />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderContent()}
      </ScrollView>
    </View>
  );
});

export default LearnScreen;

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 12,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 18,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  navInfo: {
    flex: 1,
  },
  navTag: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  navTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 28,
    backgroundColor: isDarkMode ? theme.colors.background.secondary : theme.colors.background.elevated,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    marginBottom: 4,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  cardCategory: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    marginBottom: 2,
  },
  cardShort: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  missionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 28,
    marginTop: 12,
    gap: 16,
    backgroundColor: theme.colors.background.secondary,
  },
  missionText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  articleContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  topicSection: {
    marginBottom: 32,
  },
  topicLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  topicDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topicTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    flex: 1,
  },
  topicText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 28,
  },
  divider: {
    height: 1,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    marginTop: 32,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
    marginBottom: 40,
  },
  doneBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFF',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    marginTop: 16,
  }
});
