import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const { user, logout, requireAuth } = useAuth();
  const styles = getStyles(theme, isDarkMode);

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContent}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="account-circle" size={80} color={theme.colors.background.elevated} />
          </View>
          <Text style={styles.emptyTitle}>Your AQI Journey</Text>
          <Text style={styles.emptyText}>
            Join AirSaathi to track your personal impact, build streaks, and contribute to the community.
          </Text>
          <TouchableOpacity 
            style={styles.loginBtn} 
            onPress={() => requireAuth(() => {})} // Just triggers modal
          >
            <Text style={styles.loginBtnText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Image 
          source={{ uri: user.avatar_url || 'https://i.pravatar.cc/150?u=' + user.id }} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user.role.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="person-outline" size={24} color={theme.colors.text.primary} />
          <Text style={styles.menuText}>Edit Profile</Text>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="location-on" size={24} color={theme.colors.text.primary} />
          <Text style={styles.menuText}>Location: {user.city || 'Pune'}</Text>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <MaterialIcons name="logout" size={20} color={theme.colors.support.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    padding: 24,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconCircle: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 24,
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loginBtn: {
    backgroundColor: theme.colors.accent.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 16,
    color: isDarkMode ? '#000' : '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: theme.colors.accent.primary,
  },
  name: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  email: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  badge: {
    backgroundColor: 'rgba(196, 255, 1, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
  },
  badgeText: {
    fontFamily: theme.fonts.label.bold,
    fontSize: 10,
    color: theme.colors.accent.primary,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 12,
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    fontFamily: theme.fonts.body.medium,
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
  },
  logoutText: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 16,
    color: theme.colors.support.error,
    marginLeft: 8,
  }
});
