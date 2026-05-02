import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const RewardItem = ({ item, theme }) => (
  <View style={[styles.rewardCard, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.border || 'rgba(0,0,0,0.05)' }]}>
    <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 209, 102, 0.1)' }]}>
      <Feather name={item.icon} size={24} color={theme.colors.accent.primary} />
    </View>
    <Text style={[styles.rewardName, { color: theme.colors.text.primary }]}>{item.name}</Text>
    <View style={styles.pointsRow}>
      <Text style={[styles.pointsValue, { color: theme.colors.accent.primary }]}>{item.cost}</Text>
      <Text style={[styles.pointsLabel, { color: theme.colors.text.secondary }]}> pts</Text>
    </View>
    <TouchableOpacity style={[styles.claimButton, { backgroundColor: theme.colors.accent.primary }]}>
      <Text style={styles.claimButtonText}>Claim</Text>
    </TouchableOpacity>
  </View>
);

const RewardSystem = ({ points, theme }) => {
  const rewards = [
    { id: 1, name: 'Eco Bottle', cost: 200, icon: 'droplet' },
    { id: 2, name: 'AirSaathi Tee', cost: 300, icon: 'shopping-bag' },
    { id: 3, name: 'Prime Badge', cost: 500, icon: 'award' },
    { id: 4, name: 'N95 Mask Pack', cost: 150, icon: 'shield' },
    { id: 5, name: 'Solar Powerbank', cost: 450, icon: 'zap' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.balanceHeader}>
        <View>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>YOUR BALANCE</Text>
          <View style={styles.pointsBalanceRow}>
            <Text style={[styles.balanceValue, { color: theme.colors.text.primary }]}>{points}</Text>
            <Text style={[styles.balanceUnit, { color: theme.colors.accent.primary }]}> 🌱 pts</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.historyBtn, { backgroundColor: theme.colors.background.elevated }]}>
          <Feather name="clock" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Rewards Store</Text>
      
      <FlatList
        data={rewards}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RewardItem item={item} theme={theme} />}
        contentContainerStyle={styles.rewardsScrollContent}
        decelerationRate="fast"
        snapToInterval={156}
        nestedScrollEnabled={true}
        removeClippedSubviews={false} // Important for small lists in pagers
      />

      <View style={[styles.milestoneCard, { backgroundColor: theme.colors.accent.primary + '15' }]}>
        <Feather name="gift" size={24} color={theme.colors.accent.primary} style={styles.milestoneIcon} />
        <View style={styles.milestoneTextContainer}>
          <Text style={[styles.milestoneTitle, { color: theme.colors.text.primary }]}>Next Milestone</Text>
          <Text style={[styles.milestoneDesc, { color: theme.colors.text.secondary }]}>Earn 60 more points to unlock a $5 Coupon!</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  pointsBalanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  balanceValue: {
    fontSize: 42,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  balanceUnit: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
    marginLeft: 4,
  },
  historyBtn: {
    padding: 8,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 16,
  },
  rewardsScrollContent: {
    paddingVertical: 8,
    marginBottom: 16,
    paddingRight: 16,
  },
  rewardCard: {
    width: 140,
    borderRadius: 24,
    padding: 16,
    marginRight: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsValue: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  pointsLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  claimButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  claimButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#000',
  },
  milestoneCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  milestoneIcon: {
    marginRight: 16,
  },
  milestoneTextContainer: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  milestoneDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
});

export default RewardSystem;
