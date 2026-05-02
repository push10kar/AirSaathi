import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const DailyCheckIn = ({ theme }) => {
  const [selected, setSelected] = useState(null);

  const options = [
    { id: 'low', label: 'Low', icon: 'smile', color: '#00d166' },
    { id: 'medium', label: 'Medium', icon: 'meh', color: '#FFB800' },
    { id: 'high', label: 'High', icon: 'frown', color: '#FF4B4B' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.elevated }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Daily Check-in</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>How was your exposure today?</Text>
      
      <View style={styles.optionsRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            activeOpacity={0.7}
            onPress={() => setSelected(opt.id)}
            style={[
              styles.optionBtn,
              { 
                backgroundColor: selected === opt.id ? opt.color + '20' : 'rgba(255,255,255,0.05)',
                borderColor: selected === opt.id ? opt.color : 'transparent',
              }
            ]}
          >
            <Feather 
              name={opt.icon} 
              size={24} 
              color={selected === opt.id ? opt.color : theme.colors.text.secondary} 
            />
            <Text style={[
              styles.optionLabel, 
              { color: selected === opt.id ? opt.color : theme.colors.text.secondary }
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  optionLabel: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
});

export default DailyCheckIn;
