import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getFeed, getGroups } from '../services/mockCommunityDB';

import PostCard from '../components/Community/PostCard';
import CreatePostModal from '../components/Community/CreatePostModal';
import CommentModal from '../components/Community/CommentModal';
import ReportModal from '../components/Community/ReportModal';

const FILTERS = ['All', 'Actions', 'Complaints', 'Achievements', 'Events', 'Tips', 'Discussions'];

const CommunityScreen = React.memo(function CommunityScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const { requireAuth } = useAuth();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);

  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Modal States
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportTargetType, setReportTargetType] = useState('post');

  const loadData = useCallback(async () => {
    try {
      const [feedData, groupsData] = await Promise.all([
        getFeed({ post_type: activeFilter }),
        getGroups()
      ]);
      setPosts(feedData);
      setGroups(groupsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePostOptions = (post) => {
    setReportTarget(post);
    setReportTargetType('post');
    setReportModalVisible(true);
  };

  const handleCommentPress = (post) => {
    setSelectedPostForComment(post);
    setCommentModalVisible(true);
  };

  const handleReportComment = (comment) => {
    setCommentModalVisible(false);
    setTimeout(() => {
      setReportTarget(comment);
      setReportTargetType('comment');
      setReportModalVisible(true);
    }, 400); // Wait for CommentModal to close before opening ReportModal
  };

  const handlePostCreated = (newPost) => {
    // Optimistically add to feed if it matches current filter
    if (activeFilter === 'All' || newPost.post_type.toLowerCase() === activeFilter.replace('s', '').toLowerCase()) {
      // Need to fetch full feed to get populated user data easily
      loadData();
    }
  };

  const renderGroup = ({ item }) => (
    <TouchableOpacity style={styles.groupItem}>
      <Image source={{ uri: item.image }} style={styles.groupImage} />
      <Text style={styles.groupName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.locationRow}>
        <Text style={styles.sectionTitle}>My Community</Text>
        <TouchableOpacity style={styles.locationSelector}>
          <Text style={styles.locationText}>Pune</Text>
          <Feather name="chevron-down" size={16} color={theme.colors.accent.primary} />
        </TouchableOpacity>
      </View>

      {/* Groups / Stories */}
      <View style={styles.groupsSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.groupsScroll}
          nestedScrollEnabled={true}
          bounces={true}
          overScrollMode="always"
        >
          <TouchableOpacity style={styles.addGroupBtn}>
            <View style={styles.addGroupIcon}>
              <Feather name="plus" size={24} color={theme.colors.accent.primary} />
            </View>
            <Text style={styles.groupName}>Add</Text>
          </TouchableOpacity>
          {groups.map(g => (
            <TouchableOpacity key={g.id} style={styles.groupItem}>
              <Image source={{ uri: g.image }} style={styles.groupImage} />
              <Text style={styles.groupName} numberOfLines={1}>{g.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersScroll} 
        contentContainerStyle={styles.filtersContent}
        nestedScrollEnabled={true}
        bounces={true}
        overScrollMode="always"
      >
        {FILTERS.map(filter => (
          <TouchableOpacity 
            key={filter} 
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.accent.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PostCard 
              post={item} 
              onOptionsPress={handlePostOptions}
              onCommentPress={handleCommentPress}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.accent.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color={theme.colors.text.secondary} />
              <Text style={styles.emptyText}>No posts found in this category.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => requireAuth(() => setCreateModalVisible(true))}>
        <Feather name="edit-2" size={24} color={isDarkMode ? '#000' : '#fff'} />
      </TouchableOpacity>

      {/* Modals */}
      <CreatePostModal 
        visible={isCreateModalVisible} 
        onClose={() => setCreateModalVisible(false)} 
        onPostCreated={handlePostCreated}
      />

      <CommentModal 
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        post={selectedPostForComment}
        onReportComment={handleReportComment}
      />

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        target={reportTarget}
        targetType={reportTargetType}
      />
    </View>
  );
});

export default CommunityScreen;

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 140, // Space for BottomNavBar
  },
  headerContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 20,
    color: theme.colors.text.primary,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.elevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationText: {
    fontFamily: theme.fonts.label.bold,
    fontSize: 14,
    color: theme.colors.accent.primary,
    marginRight: 4,
  },
  groupsSection: {
    marginBottom: 20,
  },
  groupsScroll: {
    paddingRight: 16,
  },
  addGroupBtn: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  addGroupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 64,
  },
  groupImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: theme.colors.accent.primary,
  },
  groupName: {
    fontFamily: theme.fonts.label.medium,
    fontSize: 12,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  filtersScroll: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.text.secondary,
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primary,
  },
  filterText: {
    fontFamily: theme.fonts.label.medium,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  filterTextActive: {
    color: isDarkMode ? '#000' : '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 76, // Closer to bottom nav
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  }
});
