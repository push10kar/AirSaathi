import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const CommunityPreview = ({ theme }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Community Highlights</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: theme.colors.accent.primary }]}>View Community</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        activeOpacity={0.9}
        style={[styles.card, { backgroundColor: theme.colors.background.elevated }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.background.secondary }]}>
              <Feather name="user" size={20} color={theme.colors.text.secondary} />
            </View>
            <View>
              <Text style={[styles.userName, { color: theme.colors.text.primary }]}>Arun Kumar</Text>
              <Text style={[styles.time, { color: theme.colors.text.secondary }]}>2 hours ago • Pune</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: 'rgba(0, 209, 102, 0.2)' }]}>
            <Text style={[styles.badgeText, { color: theme.colors.accent.primary }]}>Top Action</Text>
          </View>
        </View>

        <Text style={[styles.postText, { color: theme.colors.text.primary }]}>
          "Just finished planting 3 saplings in our society garden. Small steps for better air! 🌱"
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.interaction}>
            <Feather name="heart" size={18} color="#FF4B4B" />
            <Text style={[styles.interactionText, { color: theme.colors.text.secondary }]}>24</Text>
          </View>
          <View style={styles.interaction}>
            <Feather name="message-square" size={18} color={theme.colors.text.secondary} />
            <Text style={[styles.interactionText, { color: theme.colors.text.secondary }]}>5</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  viewAll: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  card: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  time: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
  },
  postText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  interaction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  interactionText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 4,
  },
});

export default CommunityPreview;
