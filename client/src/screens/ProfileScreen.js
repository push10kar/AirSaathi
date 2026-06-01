import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Platform
} from 'react-native';
import { MaterialIcons, Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import LogoutModal from '../components/LogoutModal';
import EditProfileModal from '../components/EditProfileModal';
import AvatarActionModal from '../components/AvatarActionModal';

const { width } = Dimensions.get('window');

const ProfileScreen = React.memo(function ProfileScreen({ onLogoutRequest }) {
  const { theme, isDarkMode } = useAppTheme();
  const { user, logout, updateProfile, requireAuth } = useAuth();
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAvatarMenuVisible, setIsAvatarMenuVisible] = useState(false);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setIsUploading(true);
      setIsAvatarMenuVisible(false);
      try {
        const success = await updateProfile({ avatar_url: selectedImage });
        if (!success) {
          alert('Failed to update avatar. Please try again.');
        }
      } catch (error) {
        console.error('Avatar update error:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    setIsAvatarMenuVisible(false);
    try {
      const success = await updateProfile({ avatar_url: null });
      if (!success) {
        alert('Failed to remove avatar.');
      }
    } catch (error) {
      console.error('Avatar remove error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);

  // Mock data for the "Impact" and "Stats" sections
  const mockStats = {
    greenScore: 240,
    currentStreak: 5,
    bestStreak: 12,
    actionsCompleted: 128,
    co2Reduced: 12,
    wasteAvoided: 6,
    weeklyProgress: [true, true, false, true, true, true, false],
    points: 240,
    consistency: 72
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContent}>
          <View style={styles.iconCircleLarge}>
            <MaterialIcons name="account-circle" size={100} color={theme.colors.background.elevated} />
          </View>
          <Text style={styles.emptyTitle}>Your AQI Journey</Text>
          <Text style={styles.emptyText}>
            Join AirSaathi to track your personal impact, build streaks, and contribute to the community.
          </Text>
          <TouchableOpacity 
            style={styles.loginBtn} 
            onPress={() => requireAuth(() => {})} 
          >
            <Text style={styles.loginBtnText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. IDENTITY BLOCK */}
        <View style={styles.identitySection}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={() => setIsAvatarMenuVisible(true)} activeOpacity={0.8}>
              {user.avatar_url ? (
                <Image 
                  source={{ uri: user.avatar_url }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={[styles.avatar, styles.placeholderAvatar]}>
                  <Feather name="user" size={40} color={theme.colors.text.muted} />
                </View>
              )}
              {isUploading && (
                <View style={styles.loadingOverlay}>
                  <Text style={styles.loadingText}>...</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editBadge, { backgroundColor: theme.colors.accent.primary }]} 
              onPress={() => setIsEditModalVisible(true)}
            >
              <Feather name="edit-2" size={14} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.city}>{user.city || 'Pune, India'}</Text>

          <View style={styles.topStatsRow}>
            <View style={styles.topStatItem}>
              <Text style={[styles.topStatValue, { color: theme.colors.accent.primary }]}>{mockStats.greenScore}</Text>
              <Text style={styles.topStatLabel}>Green Score</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.background.elevated }]} />
            <View style={styles.topStatItem}>
              <View style={styles.streakLabelRow}>
                <Text style={[styles.topStatValue, { color: '#FF9500' }]}>{mockStats.currentStreak}</Text>
                <Feather name="zap" size={18} color="#FF9500" style={{ marginLeft: 4, marginTop: 4 }} />
              </View>
              <Text style={styles.topStatLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* 2. IMPACT SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Your Impact</Text>
          <View style={styles.impactGrid}>
            <View style={[styles.impactCard, { backgroundColor: theme.colors.background.secondary }]}>
              <View style={[styles.impactIcon, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
                <Feather name="check-circle" size={20} color="#34C759" />
              </View>
              <Text style={styles.impactValue}>{mockStats.actionsCompleted}</Text>
              <Text style={styles.impactLabel}>Actions Done</Text>
            </View>
            
            <View style={[styles.impactCard, { backgroundColor: theme.colors.background.secondary }]}>
              <View style={[styles.impactIcon, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
                <Feather name="wind" size={20} color="#007AFF" />
              </View>
              <Text style={styles.impactValue}>{mockStats.co2Reduced} kg</Text>
              <Text style={styles.impactLabel}>CO₂ Reduced</Text>
            </View>

            <View style={[styles.impactCard, { backgroundColor: theme.colors.background.secondary }]}>
              <View style={[styles.impactIcon, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                <Feather name="trash-2" size={20} color="#FF3B30" />
              </View>
              <Text style={styles.impactValue}>{mockStats.wasteAvoided}</Text>
              <Text style={styles.impactLabel}>Waste Avoided</Text>
            </View>
          </View>
        </View>

        {/* 3. PROGRESS & HABITS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Progress & Habits</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.background.secondary }]}>
            <View style={styles.streakHeader}>
              <View>
                <Text style={styles.cardTitle}>Activity Streak</Text>
                <Text style={styles.cardSubtitle}>Best: {mockStats.bestStreak} days</Text>
              </View>
              <View style={[styles.streakCountBadge, { backgroundColor: theme.colors.background.primary }]}>
                <Text style={[styles.streakCountText, { color: theme.colors.text.primary }]}>{mockStats.currentStreak}</Text>
                <Feather name="zap" size={20} color={theme.colors.accent.primary} />
              </View>
            </View>
            
            <View style={styles.weekGrid}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <View key={i} style={styles.dayCol}>
                  <Text style={styles.dayLabel}>{day}</Text>
                  <View style={[
                    styles.statusBox, 
                    { 
                      backgroundColor: mockStats.weeklyProgress[i] ? 'rgba(196, 255, 1, 0.15)' : 'rgba(255, 75, 75, 0.1)',
                      borderColor: mockStats.weeklyProgress[i] ? theme.colors.accent.primary : 'rgba(255, 75, 75, 0.3)'
                    }
                  ]}>
                    <Feather 
                      name={mockStats.weeklyProgress[i] ? "check" : "x"} 
                      size={14} 
                      color={mockStats.weeklyProgress[i] ? theme.colors.accent.primary : "#FF4B4B"} 
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>18</Text>
                <Text style={styles.statBoxLabel}>Actions this week</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{mockStats.consistency}%</Text>
                <Text style={styles.statBoxLabel}>Consistency</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. REWARDS & ACHIEVEMENTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Rewards & Badges</Text>
            <View style={[styles.pointsBadge, { backgroundColor: theme.colors.accent.primary + '15' }]}>
              <FontAwesome5 name="seedling" size={12} color={theme.colors.accent.primary} />
              <Text style={[styles.pointsValue, { color: theme.colors.accent.primary }]}>{mockStats.points} pts</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <View style={[styles.rewardCard, { backgroundColor: theme.colors.background.secondary }]}>
              <View style={styles.rewardIcon}>
                <Ionicons name="gift-outline" size={32} color={theme.colors.accent.primary} />
              </View>
              <Text style={styles.rewardTitle}>Bamboo Bottle</Text>
              <Text style={styles.rewardCost}>200 pts</Text>
            </View>
            
            <View style={[styles.rewardCard, { backgroundColor: theme.colors.background.secondary }]}>
              <View style={styles.rewardIcon}>
                <Ionicons name="shirt-outline" size={32} color="#5856D6" />
              </View>
              <Text style={styles.rewardTitle}>Eco T-Shirt</Text>
              <Text style={styles.rewardCost}>300 pts</Text>
            </View>

            <View style={[styles.badgeCircle, { backgroundColor: theme.colors.background.secondary }]}>
              <MaterialIcons name="stars" size={40} color="#FFD700" />
              <Text style={styles.badgeLabel}>Warrior</Text>
            </View>

            <View style={[styles.badgeCircle, { backgroundColor: theme.colors.background.secondary }]}>
              <MaterialIcons name="local-fire-department" size={40} color="#FF9500" />
              <Text style={styles.badgeLabel}>7 Day</Text>
            </View>
          </ScrollView>
        </View>

        {/* 5. PERSONAL INSIGHTS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Personal Insights</Text>
          <View style={[styles.insightCard, { backgroundColor: theme.colors.accent.primary + '10', borderColor: theme.colors.accent.primary + '30' }]}>
            <Ionicons name="bulb-outline" size={24} color={theme.colors.accent.primary} style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.insightTitle, { color: theme.colors.text.primary }]}>Smart Tip</Text>
              <Text style={[styles.insightText, { color: theme.colors.text.secondary }]}>
                You reduce exposure by 40% when staying indoors on high AQI days. Great consistency!
              </Text>
            </View>
          </View>
        </View>

        {/* 6. SETTINGS & CONTROLS */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionHeader}>Settings & Controls</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.background.secondary }]}>
            <TouchableOpacity style={styles.settingsItem}>
              <Feather name="globe" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingsText}>Language (English)</Text>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.muted} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <Feather name="bell" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingsText}>Notifications</Text>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsItem} onPress={() => setIsEditModalVisible(true)}>
              <Feather name="user" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingsText}>Edit Profile</Text>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.muted} />
            </TouchableOpacity>

            <View style={styles.dividerLight} />

            <TouchableOpacity style={styles.logoutBtnRow} onPress={onLogoutRequest}>
              <Feather name="log-out" size={20} color={theme.colors.support.error} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>



      <EditProfileModal 
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        user={user}
        onUpdate={updateProfile}
        theme={theme}
        isDarkMode={isDarkMode}
      />

      {/* Avatar Action Menu */}
      <AvatarActionModal 
        visible={isAvatarMenuVisible}
        onClose={() => setIsAvatarMenuVisible(false)}
        onChange={handleImagePick}
        onRemove={handleRemoveAvatar}
        hasAvatar={!!user.avatar_url}
        theme={theme}
      />
      
      {/* Since the user asked for TWO options, I should actually use a more custom menu than LogoutModal */}
      {/* But I'll use a simple Modal for now that matches the app style */}
    </View>
  );
});

export default ProfileScreen;

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 140,
  },
  identitySection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: theme.colors.background.secondary,
  },
  placeholderAvatar: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderColor: theme.colors.text.muted,
  },
  addIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.accent.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background.primary,
  },
  name: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  city: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: theme.colors.text.muted,
    marginBottom: 24,
  },
  topStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: '100%',
    justifyContent: 'space-between',
  },
  topStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  topStatValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
  },
  topStatLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: theme.colors.text.muted,
    marginTop: 2,
  },
  streakLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 30,
    marginHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactCard: {
    width: (width - 60) / 3,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  impactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  impactLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 24,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: theme.colors.text.primary,
  },
  cardSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: theme.colors.text.muted,
    marginTop: 2,
  },
  streakCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
  },
  streakCountText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayCol: {
    alignItems: 'center',
  },
  dayLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: theme.colors.text.muted,
    marginBottom: 10,
  },
  statusBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: theme.colors.text.primary,
  },
  statBoxLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: theme.colors.text.muted,
    marginTop: 2,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  pointsValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  rewardCard: {
    width: 140,
    padding: 16,
    borderRadius: 24,
    marginRight: 12,
    alignItems: 'center',
  },
  rewardIcon: {
    marginBottom: 12,
  },
  rewardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: theme.colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  rewardCost: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  badgeCircle: {
    width: 100,
    height: 120,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: theme.colors.text.muted,
    marginTop: 8,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  insightTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    marginBottom: 4,
  },
  insightText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  settingsCard: {
    borderRadius: 24,
    padding: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  settingsText: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  dividerLight: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
  },
  logoutBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  logoutText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: theme.colors.support.error,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconCircleLarge: {
    marginBottom: 32,
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  loginBtn: {
    backgroundColor: theme.colors.accent.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: isDarkMode ? '#000' : '#fff',
  }
});
