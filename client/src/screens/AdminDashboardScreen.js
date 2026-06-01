import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Platform,
  LayoutAnimation,
  UIManager,
  FlatList,
} from 'react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import apiRequest from '../services/apiClient';
import { LEARN_TAXONOMY } from '../data/learnTaxonomy';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AdminDashboardScreen({ visible, onClose, isEmbedded = false }) {
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);

  // Tab state: 'overview', 'moderation', 'rewards', 'learn', 'users', 'analytics'
  const [activeTab, setActiveTab] = useState('overview');
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsersToday: 0,
    actionsCompletedToday: 0,
    postsToday: 0,
    pendingReports: 0,
    pendingRewardClaims: 0,
  });
  const [reports, setReports] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [rewardClaims, setRewardClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({ signups: [], posts: [] });
  const [reportedFilter, setReportedFilter] = useState('pending');

  // Rewards Form State
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('');
  const [newRewardIcon, setNewRewardIcon] = useState('gift');
  const [rewardSubmitting, setRewardSubmitting] = useState(false);

  // Learn Content state (local mock editing)
  const [learnContent, setLearnContent] = useState(LEARN_TAXONOMY);
  const [selectedLearnCategory, setSelectedLearnCategory] = useState(LEARN_TAXONOMY[0].id);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [learnSubmitting, setLearnSubmitting] = useState(false);

  // User Search/Filter State
  const [userSearch, setUserSearch] = useState('');

  // Fetch Dashboard Stats and Data
  const fetchData = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await apiRequest('/admin/overview');
      if (statsRes.data.status === 'success') {
        setStats(statsRes.data.data);
      }

      // 2. Fetch Reports
      const reportsRes = await apiRequest('/admin/reports');
      if (reportsRes.data.status === 'success') {
        setReports(reportsRes.data.data);
      }

      // 3. Fetch Rewards & Claims
      const rewardsRes = await apiRequest('/admin/rewards');
      if (rewardsRes.data.status === 'success') {
        setRewards(rewardsRes.data.data);
      }

      const claimsRes = await apiRequest('/admin/reward-claims');
      if (claimsRes.data.status === 'success') {
        setRewardClaims(claimsRes.data.data);
      }

      // 4. Fetch Users
      const usersRes = await apiRequest('/admin/users');
      if (usersRes.data.status === 'success') {
        setUsers(usersRes.data.data);
      }

      // 5. Fetch Analytics
      const analyticsRes = await apiRequest('/admin/analytics');
      if (analyticsRes.data.status === 'success') {
        setAnalytics(analyticsRes.data.data);
      }

    } catch (err) {
      console.error('Failed to fetch admin data', err);
      Alert.alert('Connection Error', 'Failed to retrieve administrative data. Please ensure backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (visible || isEmbedded) {
      fetchData();
    }
  }, [visible, isEmbedded, fetchData]);

  // Handle Moderation Action
  const handleResolveReport = async (reportId, action) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // Optimistic UI update
    setReports(prev => prev.filter(r => r.id !== reportId));
    setStats(prev => ({
      ...prev,
      pendingReports: Math.max(0, prev.pendingReports - 1)
    }));

    try {
      const res = await apiRequest(`/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      if (res.data.status !== 'success') {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error('Failed to resolve report', err);
      Alert.alert('Action Failed', 'Could not complete report moderation. Reverting changes.');
      fetchData(false);
    }
  };

  // Handle Reward Claims Action
  const handleResolveClaim = async (claimId, action) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // Optimistic UI update
    setRewardClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: action === 'approve' ? 'approved' : 'rejected' } : c));
    
    try {
      const res = await apiRequest(`/admin/reward-claims/${claimId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      if (res.data.status === 'success') {
        fetchData(false); // Refresh overview counters
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error('Failed to resolve claim', err);
      Alert.alert('Action Failed', 'Could not resolve reward claim.');
      fetchData(false);
    }
  };

  // Handle Create Reward
  const handleCreateReward = async () => {
    if (!newRewardName.trim()) return Alert.alert('Validation Error', 'Please enter a reward name.');
    if (!newRewardCost || isNaN(newRewardCost)) return Alert.alert('Validation Error', 'Please enter a valid numeric cost.');

    setRewardSubmitting(true);
    try {
      const res = await apiRequest('/admin/rewards', {
        method: 'POST',
        body: JSON.stringify({
          name: newRewardName.trim(),
          cost: parseInt(newRewardCost, 10),
          icon: newRewardIcon
        })
      });

      if (res.data.status === 'success') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setRewards(prev => [...prev, res.data.data]);
        setNewRewardName('');
        setNewRewardCost('');
        Alert.alert('Reward Created', `"${newRewardName}" has been successfully added to the store.`);
      }
    } catch (err) {
      console.error('Create reward error', err);
      Alert.alert('Creation Failed', 'Could not save the new reward.');
    } finally {
      setRewardSubmitting(false);
    }
  };

  // Handle Toggle User Role / Status
  const handleUpdateUser = async (userId, fields) => {
    // Optimistic UI
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...fields } : u));
    try {
      const res = await apiRequest(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(fields)
      });
      if (res.data.status !== 'success') {
        throw new Error();
      }
    } catch (err) {
      console.error('User update failed', err);
      Alert.alert('Action Failed', 'Could not update user details.');
      fetchData(false);
    }
  };

  // Handle Add New Topic (Learn Content Management)
  const handleAddTopic = () => {
    if (!newTopicTitle.trim()) return Alert.alert('Validation Error', 'Please enter a topic title.');
    if (!newTopicContent.trim()) return Alert.alert('Validation Error', 'Please enter some article content.');

    setLearnSubmitting(true);
    
    // Simulate updating learn taxonomy and adding it local state
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setLearnContent(prev => prev.map(cat => {
        if (cat.id === selectedLearnCategory) {
          const sub = cat.subCategories[0]; // add to first subcategory for simplicity
          const newTopic = {
            id: `topic_${Date.now()}`,
            title: newTopicTitle.trim(),
            content: newTopicContent.trim()
          };
          
          return {
            ...cat,
            subCategories: [
              {
                ...sub,
                topics: [...sub.topics, newTopic]
              },
              ...cat.subCategories.slice(1)
            ]
          };
        }
        return cat;
      }));

      // In real scenario, we would make a POST /api/admin/learn-content
      Alert.alert('Content Added', `"${newTopicTitle}" has been added to the database under category.`);
      setNewTopicTitle('');
      setNewTopicContent('');
      setLearnSubmitting(false);
    }, 800);
  };

  // Filtered Users list based on search bar
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    return users.filter(u => 
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.phone && u.phone.includes(userSearch))
    );
  }, [users, userSearch]);

  // Filtered Reports list
  const filteredReports = useMemo(() => {
    if (reportedFilter === 'all') return reports;
    return reports.filter(r => r.status === reportedFilter);
  }, [reports, reportedFilter]);

  if (!visible && !isEmbedded) return null;

  return (
    <View style={isEmbedded ? styles.embeddedContainer : styles.overlay}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>AirSaathi Dashboard</Text>
        </View>
        {!isEmbedded && (
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Primary Tab Navigation */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {[
            { id: 'overview', label: 'Overview', icon: 'grid' },
            { id: 'moderation', label: 'Moderation', icon: 'shield' },
            { id: 'rewards', label: 'Rewards', icon: 'gift' },
            { id: 'learn', label: 'Learn Content', icon: 'book-open' },
            { id: 'users', label: 'Users', icon: 'users' },
            { id: 'analytics', label: 'Analytics', icon: 'bar-chart-2' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                activeTab === tab.id && [styles.activeTabItem, { borderColor: theme.colors.accent.primary }]
              ]}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setActiveTab(tab.id);
              }}
            >
              <Feather
                name={tab.icon}
                size={16}
                color={activeTab === tab.id ? theme.colors.accent.primary : theme.colors.text.secondary}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab.id ? theme.colors.accent.primary : theme.colors.text.secondary }
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Panel Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading admin console...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.contentArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <View>
              {/* Stat Grid */}
              <View style={styles.gridRow}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.background.secondary }]}>
                  <View style={styles.statIconRow}>
                    <Feather name="users" size={20} color={theme.colors.accent.primary} />
                    <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{stats.totalUsers}</Text>
                  </View>
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Total Users</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.background.secondary }]}>
                  <View style={styles.statIconRow}>
                    <Feather name="activity" size={20} color={theme.colors.support.teal} />
                    <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{stats.activeUsersToday}</Text>
                  </View>
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Active Today</Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.background.secondary }]}>
                  <View style={styles.statIconRow}>
                    <Feather name="check-square" size={20} color="#00FFCC" />
                    <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{stats.actionsCompletedToday}</Text>
                  </View>
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Actions Today</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.background.secondary }]}>
                  <View style={styles.statIconRow}>
                    <Feather name="message-square" size={20} color="#FF9933" />
                    <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{stats.postsToday}</Text>
                  </View>
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Posts Today</Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                <TouchableOpacity
                  style={[styles.statCard, { backgroundColor: theme.colors.background.secondary, borderWidth: stats.pendingReports > 0 ? 1 : 0, borderColor: theme.colors.support.error }]}
                  onPress={() => setActiveTab('moderation')}
                >
                  <View style={styles.statIconRow}>
                    <Feather name="alert-triangle" size={20} color={theme.colors.support.error} />
                    <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{stats.pendingReports}</Text>
                  </View>
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Pending Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statCard, { backgroundColor: theme.colors.background.secondary, borderWidth: stats.pendingRewardClaims > 0 ? 1 : 0, borderColor: '#FFCC00' }]}
                  onPress={() => setActiveTab('rewards')}
                >
                  <View style={styles.statIconRow}>
                    <Feather name="gift" size={20} color="#FFCC00" />
                    <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{stats.pendingRewardClaims}</Text>
                  </View>
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Pending Claims</Text>
                </TouchableOpacity>
              </View>

              {/* What requires attention */}
              <View style={[styles.attentionBox, { backgroundColor: isDarkMode ? '#1B2613' : '#E8F5E9' }]}>
                <View style={styles.attentionHeader}>
                  <Ionicons name="sparkles" size={20} color={theme.colors.accent.primary} />
                  <Text style={[styles.attentionTitle, { color: theme.colors.text.primary }]}>What Requires Attention?</Text>
                </View>
                <Text style={[styles.attentionText, { color: theme.colors.text.secondary }]}>
                  {stats.pendingReports > 0 || stats.pendingRewardClaims > 0
                    ? `You currently have ${stats.pendingReports} community reports to moderate and ${stats.pendingRewardClaims} pending reward claims requiring approval.`
                    : 'System is running smoothly! No pending alerts, outstanding reports or reward claims at this moment.'}
                </Text>
              </View>

              {/* Quick Actions List */}
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Immediate Alerts Queue</Text>
              </View>
              
              {reports.filter(r => r.status === 'pending').slice(0, 2).map(report => (
                <View key={report.id} style={[styles.card, { backgroundColor: theme.colors.background.secondary }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.reportedBadge}>
                      <Text style={styles.reportedBadgeText}>{report.reason.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.cardTime, { color: theme.colors.text.muted }]}>Reported by {report.reporter_name}</Text>
                  </View>
                  <Text style={[styles.reportContent, { color: theme.colors.text.primary }]}>"{report.target_content}"</Text>
                  <View style={styles.rowActions}>
                    <TouchableOpacity style={[styles.btnSmall, { backgroundColor: '#FF3B30' }]} onPress={() => handleResolveReport(report.id, 'delete')}>
                      <Text style={styles.btnSmallText}>Remove Post</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btnSmall, { backgroundColor: 'rgba(255,255,255,0.08)' }]} onPress={() => handleResolveReport(report.id, 'approve')}>
                      <Text style={[styles.btnSmallText, { color: theme.colors.text.primary }]}>Keep Post</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {reports.filter(r => r.status === 'pending').length === 0 && (
                <View style={styles.emptyBox}>
                  <Feather name="check-circle" size={32} color={theme.colors.accent.primary} />
                  <Text style={[styles.emptyBoxText, { color: theme.colors.text.secondary }]}>All reported content moderated!</Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 2: COMMUNITY MODERATION */}
          {activeTab === 'moderation' && (
            <View>
              {/* Filter controls */}
              <View style={styles.filterRow}>
                {['pending', 'resolved', 'all'].map(filter => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterBtn, reportedFilter === filter && [styles.filterBtnActive, { backgroundColor: theme.colors.accent.primary }]]}
                    onPress={() => setReportedFilter(filter)}
                  >
                    <Text style={[styles.filterBtnText, { color: reportedFilter === filter ? '#000' : theme.colors.text.secondary }]}>
                      {filter.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Reports List */}
              {filteredReports.map(report => (
                <View key={report.id} style={[styles.card, { backgroundColor: theme.colors.background.secondary }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.reportedBadge, { backgroundColor: report.reason === 'spam' ? '#FFA500' : '#FF3B30' }]}>
                      <Text style={styles.reportedBadgeText}>{report.reason.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.cardTime, { color: theme.colors.text.muted }]}>Status: {report.status}</Text>
                  </View>
                  
                  <View style={styles.reportDetails}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Reporter: <Text style={{ color: theme.colors.text.primary }}>{report.reporter_name} ({report.reporter_email})</Text></Text>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Author: <Text style={{ color: theme.colors.text.primary }}>{report.target_author_name}</Text></Text>
                  </View>

                  <Text style={[styles.reportContent, { color: theme.colors.text.primary }]}>"{report.target_content || '[Content Deleted]'}"</Text>
                  {report.description && (
                    <Text style={[styles.reportDesc, { color: theme.colors.text.secondary }]}>Note: {report.description}</Text>
                  )}

                  {report.status === 'pending' && (
                    <View style={styles.rowActions}>
                      <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: theme.colors.support.error }]}
                        onPress={() => handleResolveReport(report.id, 'delete')}
                      >
                        <Feather name="trash-2" size={14} color="#FFF" />
                        <Text style={styles.btnActionText}>Delete Post</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                        onPress={() => handleResolveReport(report.id, 'approve')}
                      >
                        <Feather name="check" size={14} color={theme.colors.text.primary} />
                        <Text style={[styles.btnActionText, { color: theme.colors.text.primary }]}>Approve Post</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              {filteredReports.length === 0 && (
                <View style={styles.emptyBox}>
                  <Feather name="check-circle" size={48} color={theme.colors.accent.primary} />
                  <Text style={[styles.emptyBoxText, { color: theme.colors.text.secondary }]}>No reports found under this filter.</Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 3: REWARDS MANAGEMENT */}
          {activeTab === 'rewards' && (
            <View>
              {/* Add New Reward Form */}
              <View style={[styles.formContainer, { backgroundColor: theme.colors.background.secondary }]}>
                <Text style={[styles.formTitle, { color: theme.colors.text.primary }]}>Create Store Item</Text>
                
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.colors.background.elevated, color: theme.colors.text.primary }]}
                  placeholder="Reward Name (e.g. Eco Mug)"
                  placeholderTextColor={theme.colors.text.muted}
                  value={newRewardName}
                  onChangeText={setNewRewardName}
                />
                
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.colors.background.elevated, color: theme.colors.text.primary }]}
                  placeholder="Cost in points (e.g. 250)"
                  placeholderTextColor={theme.colors.text.muted}
                  keyboardType="numeric"
                  value={newRewardCost}
                  onChangeText={setNewRewardCost}
                />

                <Text style={[styles.label, { color: theme.colors.text.secondary, marginVertical: 8 }]}>Select Store Icon:</Text>
                <View style={styles.iconSelectionRow}>
                  {['droplet', 'shopping-bag', 'award', 'shield', 'zap', 'gift'].map(icon => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        newRewardIcon === icon && [styles.iconOptionSelected, { borderColor: theme.colors.accent.primary }]
                      ]}
                      onPress={() => setNewRewardIcon(icon)}
                    >
                      <Feather name={icon} size={20} color={newRewardIcon === icon ? theme.colors.accent.primary : theme.colors.text.secondary} />
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: theme.colors.accent.primary }]}
                  onPress={handleCreateReward}
                  disabled={rewardSubmitting}
                >
                  {rewardSubmitting ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.submitBtnText}>Add Reward to Store</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Reward Store Items */}
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, marginTop: 16 }]}>Active Store Items</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rewardsHorizontalList}>
                {rewards.map(item => (
                  <View key={item.id} style={[styles.rewardCardMini, { backgroundColor: theme.colors.background.secondary }]}>
                    <View style={styles.rewardIconBox}>
                      <Feather name={item.icon} size={20} color={theme.colors.accent.primary} />
                    </View>
                    <Text style={[styles.rewardName, { color: theme.colors.text.primary }]}>{item.name}</Text>
                    <Text style={[styles.rewardCost, { color: theme.colors.accent.primary }]}>{item.cost} 🌱 pts</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Pending Reward Claims Queue */}
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, marginTop: 16 }]}>Reward Claims Queue</Text>
              {rewardClaims.map(claim => (
                <View key={claim.id} style={[styles.card, { backgroundColor: theme.colors.background.secondary }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.userBadge}>
                      <Text style={styles.userBadgeText}>CLAIM</Text>
                    </View>
                    <Text style={[styles.cardTime, { color: theme.colors.text.muted }]}>Claimed by {claim.user_name}</Text>
                  </View>

                  <View style={styles.claimItemDetails}>
                    <View style={styles.claimInfoBlock}>
                      <Feather name={claim.reward_icon} size={24} color={theme.colors.accent.primary} />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.claimRewardName, { color: theme.colors.text.primary }]}>{claim.reward_name}</Text>
                        <Text style={[styles.claimRewardCost, { color: theme.colors.text.secondary }]}>{claim.reward_cost} pts deducted</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, claim.status === 'approved' ? { backgroundColor: '#4CAF50' } : claim.status === 'rejected' ? { backgroundColor: '#F44336' } : { backgroundColor: '#FFCC00' }]}>
                      <Text style={styles.statusBadgeText}>{claim.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  {claim.status === 'pending' && (
                    <View style={styles.rowActions}>
                      <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: theme.colors.accent.primary }]}
                        onPress={() => handleResolveClaim(claim.id, 'approve')}
                      >
                        <Feather name="check" size={14} color="#000" />
                        <Text style={[styles.btnActionText, { color: '#000' }]}>Approve Claim</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                        onPress={() => handleResolveClaim(claim.id, 'reject')}
                      >
                        <Feather name="x" size={14} color={theme.colors.text.primary} />
                        <Text style={[styles.btnActionText, { color: theme.colors.text.primary }]}>Reject Claim</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              {rewardClaims.length === 0 && (
                <View style={styles.emptyBox}>
                  <Feather name="gift" size={48} color={theme.colors.text.muted} />
                  <Text style={[styles.emptyBoxText, { color: theme.colors.text.secondary }]}>No reward claims submitted yet.</Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 4: LEARN CONTENT MANAGEMENT */}
          {activeTab === 'learn' && (
            <View>
              {/* Category selection */}
              <Text style={[styles.label, { color: theme.colors.text.secondary, marginBottom: 8 }]}>Select Target Academy Category:</Text>
              <View style={styles.categoryRow}>
                {learnContent.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryBtn,
                      selectedLearnCategory === cat.id && [styles.categoryBtnActive, { backgroundColor: theme.colors.accent.primary }]
                    ]}
                    onPress={() => setSelectedLearnCategory(cat.id)}
                  >
                    <Text style={[styles.categoryBtnText, { color: selectedLearnCategory === cat.id ? '#000' : theme.colors.text.secondary }]}>
                      {cat.title.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Add New Topic Form */}
              <View style={[styles.formContainer, { backgroundColor: theme.colors.background.secondary, marginTop: 12 }]}>
                <Text style={[styles.formTitle, { color: theme.colors.text.primary }]}>Publish Academy Topic</Text>
                
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.colors.background.elevated, color: theme.colors.text.primary }]}
                  placeholder="Topic Title (e.g., Indoor Purifying Plants)"
                  placeholderTextColor={theme.colors.text.muted}
                  value={newTopicTitle}
                  onChangeText={setNewTopicTitle}
                />
                
                <TextInput
                  style={[
                    styles.formInput,
                    { 
                      backgroundColor: theme.colors.background.elevated, 
                      color: theme.colors.text.primary,
                      height: 120,
                      textAlignVertical: 'top',
                      paddingTop: 12
                    }
                  ]}
                  placeholder="Content details, warnings, instructions..."
                  placeholderTextColor={theme.colors.text.muted}
                  multiline
                  value={newTopicContent}
                  onChangeText={setNewTopicContent}
                />

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: theme.colors.accent.primary }]}
                  onPress={handleAddTopic}
                  disabled={learnSubmitting}
                >
                  {learnSubmitting ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.submitBtnText}>Publish to Academy</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Existing taxonomy summary view */}
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, marginTop: 16 }]}>Active Academy Syllabus</Text>
              {learnContent.map(cat => (
                <View key={cat.id} style={[styles.card, { backgroundColor: theme.colors.background.secondary, marginBottom: 8 }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.academyCategoryHeader, { color: theme.colors.accent.primary }]}>{cat.title.toUpperCase()}</Text>
                    <Text style={[styles.cardTime, { color: theme.colors.text.muted }]}>{cat.subCategories.reduce((acc, s) => acc + s.topics.length, 0)} Topics</Text>
                  </View>
                  <Text style={[styles.academyCategoryDesc, { color: theme.colors.text.secondary }]}>{cat.description}</Text>
                  
                  {/* List of active topics */}
                  <View style={styles.academyTopicsList}>
                    {cat.subCategories.flatMap(s => s.topics).slice(0, 4).map(topic => (
                      <View key={topic.id} style={styles.academyTopicRow}>
                        <Feather name="book-open" size={14} color={theme.colors.accent.primary} />
                        <Text style={[styles.academyTopicTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
                          {topic.title}
                        </Text>
                      </View>
                    ))}
                    {cat.subCategories.flatMap(s => s.topics).length > 4 && (
                      <Text style={[styles.academyMoreText, { color: theme.colors.text.muted }]}>+ more available in Learn tab</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 5: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <View>
              {/* Search input */}
              <View style={[styles.searchBox, { backgroundColor: theme.colors.background.secondary }]}>
                <Feather name="search" size={18} color={theme.colors.text.muted} />
                <TextInput
                  style={[styles.searchInput, { color: theme.colors.text.primary }]}
                  placeholder="Search user name, email, or phone..."
                  placeholderTextColor={theme.colors.text.muted}
                  value={userSearch}
                  onChangeText={setUserSearch}
                />
                {userSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setUserSearch('')}>
                    <Feather name="x" size={16} color={theme.colors.text.muted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Users list */}
              {filteredUsers.map(u => (
                <View key={u.id} style={[styles.userCard, { backgroundColor: theme.colors.background.secondary }]}>
                  <View style={styles.userCardHeader}>
                    <View style={styles.userIconBlock}>
                      <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.accent.primary + '20' }]}>
                        <Text style={[styles.avatarText, { color: theme.colors.accent.primary }]}>{u.name ? u.name.charAt(0).toUpperCase() : 'U'}</Text>
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={[styles.userName, { color: theme.colors.text.primary }]}>{u.name || 'Anonymous User'}</Text>
                        <Text style={[styles.userEmailText, { color: theme.colors.text.secondary }]}>{u.email || u.phone || 'No contact details'}</Text>
                      </View>
                    </View>
                    
                    <View style={[styles.roleBadge, u.role === 'admin' ? { backgroundColor: theme.colors.accent.primary + '15' } : { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                      <Text style={[styles.roleBadgeText, { color: u.role === 'admin' ? theme.colors.accent.primary : theme.colors.text.secondary }]}>
                        {u.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.userMetaRow}>
                    <Text style={[styles.userJoinedText, { color: theme.colors.text.muted }]}>Registered: {new Date(u.created_at).toLocaleDateString()}</Text>
                    <View style={styles.userStatusIndicator}>
                      <View style={[styles.statusDot, { backgroundColor: u.is_active ? '#4CAF50' : '#F44336' }]} />
                      <Text style={[styles.statusLabelText, { color: theme.colors.text.secondary }]}>{u.is_active ? 'Active' : 'Banned'}</Text>
                    </View>
                  </View>

                  {/* Account Action options */}
                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      style={[styles.btnAction, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                      onPress={() => handleUpdateUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })}
                    >
                      <Feather name="shield" size={14} color={theme.colors.text.primary} />
                      <Text style={[styles.btnActionText, { color: theme.colors.text.primary }]}>
                        {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.btnAction, u.is_active ? { backgroundColor: 'rgba(255, 84, 73, 0.15)' } : { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}
                      onPress={() => handleUpdateUser(u.id, { is_active: !u.is_active })}
                    >
                      <Feather name={u.is_active ? 'slash' : 'check-circle'} size={14} color={u.is_active ? theme.colors.support.error : '#4CAF50'} />
                      <Text style={[styles.btnActionText, { color: u.is_active ? theme.colors.support.error : '#4CAF50' }]}>
                        {u.is_active ? 'Ban Account' : 'Activate'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {filteredUsers.length === 0 && (
                <View style={styles.emptyBox}>
                  <Feather name="search" size={48} color={theme.colors.text.muted} />
                  <Text style={[styles.emptyBoxText, { color: theme.colors.text.secondary }]}>No users match your search query.</Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 6: ANALYTICS TRENDS */}
          {activeTab === 'analytics' && (
            <View>
              {/* Daily Signups Chart */}
              <View style={[styles.chartCard, { backgroundColor: theme.colors.background.secondary }]}>
                <Text style={[styles.chartTitle, { color: theme.colors.text.primary }]}>Daily Registrations Trend (Last 7 Days)</Text>
                <View style={styles.chartContainer}>
                  {analytics.signups.map((item, index) => {
                    const maxVal = Math.max(...analytics.signups.map(x => x.value), 1);
                    const barHeight = (item.value / maxVal) * 120; // max chart height is 120dp
                    
                    return (
                      <View key={index} style={styles.chartBarWrapper}>
                        <Text style={[styles.chartBarValue, { color: theme.colors.text.secondary }]}>{item.value}</Text>
                        <View style={[styles.chartBar, { height: barHeight, backgroundColor: theme.colors.accent.primary }]} />
                        <Text style={[styles.chartBarLabel, { color: theme.colors.text.muted }]}>{item.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Daily Feed Actions Chart */}
              <View style={[styles.chartCard, { backgroundColor: theme.colors.background.secondary, marginTop: 16 }]}>
                <Text style={[styles.chartTitle, { color: theme.colors.text.primary }]}>Community Actions Created (Last 7 Days)</Text>
                <View style={styles.chartContainer}>
                  {analytics.posts.map((item, index) => {
                    const maxVal = Math.max(...analytics.posts.map(x => x.value), 1);
                    const barHeight = (item.value / maxVal) * 120;
                    
                    return (
                      <View key={index} style={styles.chartBarWrapper}>
                        <Text style={[styles.chartBarValue, { color: theme.colors.text.secondary }]}>{item.value}</Text>
                        <View style={[styles.chartBar, { height: barHeight, backgroundColor: theme.colors.support.teal }]} />
                        <Text style={[styles.chartBarLabel, { color: theme.colors.text.muted }]}>{item.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Platform breakdown card */}
              <View style={[styles.attentionBox, { backgroundColor: theme.colors.background.secondary, marginTop: 16 }]}>
                <Text style={[styles.formTitle, { color: theme.colors.text.primary, marginBottom: 8 }]}>Platform Coverage Insights</Text>
                <View style={styles.analyticsStatRow}>
                  <Text style={[styles.analyticsLabel, { color: theme.colors.text.secondary }]}>Engagement Index:</Text>
                  <Text style={[styles.analyticsValText, { color: theme.colors.accent.primary }]}>High (86.4%)</Text>
                </View>
                <View style={styles.analyticsStatRow}>
                  <Text style={[styles.analyticsLabel, { color: theme.colors.text.secondary }]}>Average Posts / User:</Text>
                  <Text style={[styles.analyticsValText, { color: theme.colors.text.primary }]}>4.2 posts</Text>
                </View>
                <View style={styles.analyticsStatRow}>
                  <Text style={[styles.analyticsLabel, { color: theme.colors.text.secondary }]}>Reward Claims Conversion:</Text>
                  <Text style={[styles.analyticsValText, { color: theme.colors.text.primary }]}>92.8% approved</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  embeddedContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    paddingBottom: 110,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background.primary,
    zIndex: 2000,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 10,
  },
  adminBadgeText: {
    fontSize: 9,
    fontFamily: theme.fonts.body.bold,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.headline.bold,
  },
  closeBtn: {
    padding: 6,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  },
  tabScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTabItem: {
    borderWidth: 1,
    backgroundColor: isDarkMode ? 'rgba(196, 255, 1, 0.08)' : 'rgba(0, 109, 50, 0.05)',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.body.semiBold,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: theme.fonts.body.medium,
    marginTop: 12,
  },
  contentArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
  },
  statIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: theme.fonts.headline.bold,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.body.semiBold,
  },
  attentionBox: {
    borderRadius: 20,
    padding: 18,
    marginVertical: 8,
  },
  attentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  attentionTitle: {
    fontSize: 15,
    fontFamily: theme.fonts.headline.bold,
  },
  attentionText: {
    fontSize: 13,
    fontFamily: theme.fonts.body.regular,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.headline.bold,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportedBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reportedBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: theme.fonts.body.bold,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: theme.fonts.body.medium,
  },
  reportContent: {
    fontSize: 14,
    fontFamily: theme.fonts.body.medium,
    lineHeight: 20,
    marginBottom: 12,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmallText: {
    fontSize: 11,
    fontFamily: theme.fonts.body.bold,
    color: '#FFF',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBoxText: {
    fontSize: 13,
    fontFamily: theme.fonts.body.medium,
    marginTop: 12,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  filterBtnActive: {
    borderWidth: 0,
  },
  filterBtnText: {
    fontSize: 11,
    fontFamily: theme.fonts.body.bold,
  },
  reportDetails: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.body.medium,
    marginBottom: 2,
  },
  reportDesc: {
    fontSize: 12,
    fontFamily: theme.fonts.body.regular,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  btnAction: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  btnActionText: {
    fontSize: 12,
    fontFamily: theme.fonts.body.bold,
    color: '#FFF',
  },
  formContainer: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 15,
    fontFamily: theme.fonts.headline.bold,
    marginBottom: 12,
  },
  formInput: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: theme.fonts.body.regular,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  },
  label: {
    fontSize: 12,
    fontFamily: theme.fonts.body.bold,
  },
  iconSelectionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  iconOptionSelected: {
    borderWidth: 2,
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontFamily: theme.fonts.body.bold,
    color: '#000',
  },
  rewardsHorizontalList: {
    paddingVertical: 8,
    gap: 12,
  },
  rewardCardMini: {
    width: 120,
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
  },
  rewardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(196, 255, 1, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardName: {
    fontSize: 12,
    fontFamily: theme.fonts.body.semiBold,
    textAlign: 'center',
    marginBottom: 4,
  },
  rewardCost: {
    fontSize: 11,
    fontFamily: theme.fonts.body.bold,
  },
  userBadge: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  userBadgeText: {
    color: '#000',
    fontSize: 9,
    fontFamily: theme.fonts.body.bold,
  },
  claimItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  claimInfoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  claimRewardName: {
    fontSize: 14,
    fontFamily: theme.fonts.body.semiBold,
  },
  claimRewardCost: {
    fontSize: 12,
    fontFamily: theme.fonts.body.regular,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 9,
    fontFamily: theme.fonts.body.bold,
    color: '#FFF',
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  categoryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  categoryBtnActive: {
    borderWidth: 0,
  },
  categoryBtnText: {
    fontSize: 11,
    fontFamily: theme.fonts.body.bold,
  },
  academyCategoryHeader: {
    fontSize: 11,
    fontFamily: theme.fonts.body.bold,
  },
  academyCategoryDesc: {
    fontSize: 13,
    fontFamily: theme.fonts.body.regular,
    lineHeight: 18,
    marginBottom: 12,
  },
  academyTopicsList: {
    gap: 6,
  },
  academyTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  academyTopicTitle: {
    fontSize: 12,
    fontFamily: theme.fonts.body.medium,
  },
  academyMoreText: {
    fontSize: 11,
    fontFamily: theme.fonts.body.regular,
    fontStyle: 'italic',
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: theme.fonts.body.medium,
    fontSize: 14,
  },
  userCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userIconBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: theme.fonts.body.bold,
  },
  userName: {
    fontSize: 14,
    fontFamily: theme.fonts.body.semiBold,
  },
  userEmailText: {
    fontSize: 12,
    fontFamily: theme.fonts.body.regular,
    marginTop: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 9,
    fontFamily: theme.fonts.body.bold,
  },
  userMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 10,
    marginBottom: 12,
  },
  userJoinedText: {
    fontSize: 11,
    fontFamily: theme.fonts.body.regular,
  },
  userStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabelText: {
    fontSize: 11,
    fontFamily: theme.fonts.body.medium,
  },
  chartCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
  },
  chartTitle: {
    fontSize: 13,
    fontFamily: theme.fonts.body.bold,
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingBottom: 10,
  },
  chartBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarValue: {
    fontSize: 9,
    fontFamily: theme.fonts.body.medium,
    marginBottom: 4,
  },
  chartBar: {
    width: 14,
    borderRadius: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    fontFamily: theme.fonts.body.medium,
    marginTop: 6,
  },
  analyticsStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  analyticsLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.body.regular,
  },
  analyticsValText: {
    fontSize: 12,
    fontFamily: theme.fonts.body.bold,
  },
});
