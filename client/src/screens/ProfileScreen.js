import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LogoutModal from '../components/LogoutModal';
import EditProfileModal from '../components/EditProfileModal';

export default function ProfileScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const { user, logout, updateProfile, requireAuth } = useAuth();
  
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const styles = getStyles(theme, isDarkMode);

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

  const handleLogout = () => {
    setIsLogoutModalVisible(false);
    logout();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: user.avatar_url || 'https://i.pravatar.cc/150?u=' + user.id }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={[styles.editBadge, { backgroundColor: theme.colors.accent.primary }]} onPress={() => setIsEditModalVisible(true)}>
              <Feather name="edit-2" size={14} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email || user.phone || 'No contact info'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user.role.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => setIsEditModalVisible(true)}>
            <View style={[styles.menuIconCircle, { backgroundColor: theme.colors.accent.primary + '15' }]}>
              <Feather name="user" size={20} color={theme.colors.accent.primary} />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#34C759' + '15' }]}>
              <Feather name="map-pin" size={20} color="#34C759" />
            </View>
            <Text style={styles.menuText}>Location: {user.city || 'Not set'}</Text>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#5856D6' + '15' }]}>
              <Feather name="bell" size={20} color="#5856D6" />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#FF9500' + '15' }]}>
              <Feather name="moon" size={20} color="#FF9500" />
            </View>
            <Text style={styles.menuText}>Theme: {isDarkMode ? 'Dark' : 'Light'}</Text>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => setIsLogoutModalVisible(true)}>
          <Feather name="log-out" size={18} color={theme.colors.support.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>AirSaathi v2.0.4 • Made with ❤️ for Clean Air</Text>
      </ScrollView>

      <LogoutModal 
        visible={isLogoutModalVisible}
        onCancel={() => setIsLogoutModalVisible(false)}
        onConfirm={handleLogout}
        theme={theme}
      />

      <EditProfileModal 
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        user={user}
        onUpdate={updateProfile}
        theme={theme}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
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
    fontFamily: theme.fonts.headline.bold,
    fontSize: 26,
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: theme.fonts.body.regular,
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
    shadowColor: theme.colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 16,
    color: isDarkMode ? '#000' : '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: theme.colors.background.secondary,
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
    fontFamily: theme.fonts.headline.bold,
    fontSize: 28,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  email: {
    fontFamily: theme.fonts.body.medium,
    fontSize: 15,
    color: theme.colors.text.secondary,
  },
  badge: {
    backgroundColor: theme.colors.accent.primary + '15',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 16,
  },
  badgeText: {
    fontFamily: theme.fonts.label.bold,
    fontSize: 11,
    color: theme.colors.accent.primary,
    letterSpacing: 1.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 13,
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontFamily: theme.fonts.body.semibold,
    fontSize: 16,
    color: theme.colors.text.primary,
    marginLeft: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
    backgroundColor: theme.colors.support.error + '10',
    borderRadius: 20,
  },
  logoutText: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 16,
    color: theme.colors.support.error,
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 20,
    fontFamily: theme.fonts.body.medium,
    fontSize: 12,
    color: theme.colors.text.muted,
  }
});
