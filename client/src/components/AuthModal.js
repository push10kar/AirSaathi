import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { theme, isDarkMode } = useAppTheme();
  const { isAuthModalVisible, closeAuthModal, login, signup, onAuthSuccess } = useAuth();
  const styles = getStyles(theme, isDarkMode);

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async () => {
    setLoading(true);
    setError('');
    
    let result;
    if (isLoginView) {
      result = await login(email, password);
    } else {
      result = await signup({ name, email, password });
    }

    if (result.success) {
      onAuthSuccess();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <Modal
      visible={isAuthModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeAuthModal}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Handle for aesthetic */}
          <View style={styles.handle} />

          <View style={styles.header}>
            <TouchableOpacity onPress={closeAuthModal} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <MaterialIcons 
                name={isLoginView ? "lock-outline" : "person-add-alt"} 
                size={32} 
                color={theme.colors.accent.primary} 
              />
            </View>

            <Text style={styles.title}>
              {isLoginView ? 'Welcome Back' : 'Join EcoSync'}
            </Text>
            <Text style={styles.subtitle}>
              {isLoginView 
                ? 'Login to track your progress and build streaks.' 
                : 'Save your impact and join the community.'}
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {!isLoginView && (
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color={theme.colors.text.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={theme.colors.text.muted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color={theme.colors.text.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="vpn-key" size={20} color={theme.colors.text.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.colors.text.muted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
              onPress={handleAction}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={isDarkMode ? '#000' : '#fff'} />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {isLoginView ? 'Login' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.socialBtn}>
              <MaterialIcons name="smartphone" size={20} color={theme.colors.text.primary} />
              <Text style={styles.socialBtnText}>Continue with Phone</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.toggleBtn} 
              onPress={() => setIsLoginView(!isLoginView)}
            >
              <Text style={styles.toggleText}>
                {isLoginView ? "Don't have an account? " : "Already have an account? "}
                <Text style={styles.toggleTextBold}>
                  {isLoginView ? 'Sign Up' : 'Login'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDarkMode ? 'rgba(196, 255, 1, 0.1)' : 'rgba(0, 109, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 24,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  errorText: {
    color: theme.colors.support.error,
    fontFamily: theme.fonts.body.medium,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.body.regular,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  primaryBtn: {
    backgroundColor: theme.colors.accent.primary,
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: theme.colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 16,
    color: isDarkMode ? '#000' : '#fff',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.background.elevated,
  },
  dividerText: {
    fontFamily: theme.fonts.body.medium,
    fontSize: 12,
    color: theme.colors.text.muted,
    marginHorizontal: 16,
  },
  socialBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.background.elevated,
  },
  socialBtnText: {
    fontFamily: theme.fonts.body.semiBold,
    fontSize: 14,
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
  toggleBtn: {
    marginTop: 8,
    padding: 16,
  },
  toggleText: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  toggleTextBold: {
    fontFamily: theme.fonts.body.bold,
    color: theme.colors.accent.primary,
  }
});
