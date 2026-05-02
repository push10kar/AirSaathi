import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, BlurView } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function LogoutModal({ visible, onCancel, onConfirm, theme }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background.primary }]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.support.error + '15' }]}>
            <Feather name="log-out" size={32} color={theme.colors.support.error} />
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Logout</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Are you sure you want to log out? You will need to verify your phone number again.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.background.secondary }]} 
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton, { backgroundColor: theme.colors.support.error }]} 
              onPress={onConfirm}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Yes, Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  }
});
