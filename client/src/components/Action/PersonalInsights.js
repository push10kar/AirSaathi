import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PersonalInsights = ({ theme }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Insights & Impact</Text>
      
      <View style={[styles.insightCard, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border || 'rgba(0,0,0,0.05)' }]}>
        <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 75, 75, 0.1)' }]}>
          <Feather name="activity" size={20} color="#FF4B4B" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.insightTitle, { color: theme.colors.text.primary }]}>Exposure Insight</Text>
          <Text style={[styles.insightDesc, { color: theme.colors.text.secondary }]}>
            Your exposure was high today due to peak hour travel. Use a mask tomorrow!
          </Text>
        </View>
      </View>

      <View style={[styles.insightCard, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border || 'rgba(0,0,0,0.05)' }]}>
        <View style={[styles.iconWrapper, { backgroundColor: 'rgba(0, 209, 102, 0.1)' }]}>
          <Feather name="trending-up" size={20} color={theme.colors.accent.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.insightTitle, { color: theme.colors.text.primary }]}>Weekly Summary</Text>
          <Text style={[styles.insightDesc, { color: theme.colors.text.secondary }]}>
            You completed 18 actions this week and avoided high pollution for 3 days.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  insightDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    lineHeight: 18,
  },
});

export default PersonalInsights;
