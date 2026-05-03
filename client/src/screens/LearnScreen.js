import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { LEARN_TOPICS, CATEGORIES } from '../data/learnData';
import LearnDetailModal from '../components/LearnDetailModal';

const TopicCard = ({ topic, onPress, theme, isDarkMode }) => (
  <TouchableOpacity 
    style={styles.card} 
    onPress={() => onPress(topic)}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, { backgroundColor: theme.colors.background.secondary }]}>
      <MaterialIcons name={topic.icon} size={24} color={theme.colors.accent.primary} />
    </View>
    <View style={styles.cardContent}>
      <Text style={[styles.cardCategory, { color: theme.colors.accent.primary }]}>
        {topic.category.toUpperCase()}
      </Text>
      <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
        {topic.title}
      </Text>
      <Text style={[styles.cardShort, { color: theme.colors.text.secondary }]} numberOfLines={1}>
        {topic.short}
      </Text>
    </View>
    <Feather name="chevron-right" size={20} color={theme.colors.text.muted} />
  </TouchableOpacity>
);

export default function LearnScreen({ onNavigateToAction }) {
  const { theme, isDarkMode } = useAppTheme();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredTopics = useMemo(() => {
    return LEARN_TOPICS.filter(topic => {
      const matchesSearch = topic.title.toLowerCase().includes(search.toLowerCase()) ||
                          topic.short.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || topic.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const handleTopicPress = (topic) => {
    setSelectedTopic(topic);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Knowledge Hub</Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Master air quality in under 20 seconds.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBox, { backgroundColor: theme.colors.background.secondary }]}>
        <Feather name="search" size={20} color={theme.colors.text.muted} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.primary }]}
          placeholder="Search topics..."
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

      {/* Category Tabs */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.categoryChip,
                { backgroundColor: activeCategory === cat ? theme.colors.accent.primary : theme.colors.background.secondary }
              ]}
            >
              <Text style={[
                styles.categoryText,
                { color: activeCategory === cat ? (isDarkMode ? '#000' : '#fff') : theme.colors.text.secondary }
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Topics List */}
      <FlatList
        data={filteredTopics}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TopicCard 
            topic={item} 
            onPress={handleTopicPress}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="book-open" size={48} color={theme.colors.background.secondary} />
            <Text style={[styles.emptyText, { color: theme.colors.text.muted }]}>
              No topics found. Try another search.
            </Text>
          </View>
        }
      />

      <LearnDetailModal
        visible={modalVisible}
        topic={selectedTopic}
        onClose={() => setModalVisible(false)}
        onTakeAction={(actions) => {
          if (onNavigateToAction) {
            onNavigateToAction(actions);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 24,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 18,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  categoryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
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
