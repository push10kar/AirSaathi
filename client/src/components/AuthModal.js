import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Animated
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { theme, isDarkMode } = useAppTheme();
  const { 
    isAuthModalVisible, 
    closeAuthModal, 
    login, 
    signup, 
    requestOtp, 
    verifyOtp,
    updateProfile,
    onAuthSuccess 
  } = useAuth();

  // Auth Views: 'CHOICE', 'EMAIL_LOGIN', 'EMAIL_SIGNUP', 'PHONE_INPUT', 'OTP_INPUT', 'NAME_INPUT'
  const [view, setView] = useState('CHOICE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchView = (newView) => {
    setError('');
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setView(newView);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleEmailAuth = async () => {
    setLoading(true);
    setError('');
    let result;
    if (view === 'EMAIL_LOGIN') {
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

  const handleRequestOtp = async () => {
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    const result = await requestOtp(phone);
    if (result.success) {
      switchView('OTP_INPUT');
      if (result.code) console.log(`[DEV] OTP Code: ${result.code}`);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    const result = await verifyOtp(phone, otp);
    if (result.success) {
      if (result.isNewUser) {
        switchView('NAME_INPUT');
      } else {
        onAuthSuccess();
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleCompleteProfile = async () => {
    if (name.length < 2) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');
    const result = await updateProfile({ name });
    if (result.success) {
      onAuthSuccess();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const renderChoice = () => (
    <View style={styles.viewContainer}>
      <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? 'rgba(196, 255, 1, 0.1)' : 'rgba(0, 109, 50, 0.1)' }]}>
        <Feather name="shield" size={32} color={theme.colors.accent.primary} />
      </View>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Welcome to AirSaathi</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Join thousands of citizens taking action for cleaner air.</Text>
      
      <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.accent.primary }]} onPress={() => switchView('PHONE_INPUT')}>
        <Feather name="phone" size={20} color={isDarkMode ? '#000' : '#fff'} />
        <Text style={[styles.primaryBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>Continue with Phone</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.background.elevated }]} onPress={() => switchView('EMAIL_LOGIN')}>
        <Feather name="mail" size={20} color={theme.colors.text.primary} />
        <Text style={[styles.secondaryBtnText, { color: theme.colors.text.primary }]}>Continue with Email</Text>
      </TouchableOpacity>

      <Text style={[styles.termsText, { color: theme.colors.text.muted }]}>
        By continuing, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>.
      </Text>
    </View>
  );

  const renderPhoneInput = () => (
    <View style={styles.viewContainer}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Your Phone Number</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>We'll send you a 6-digit verification code.</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.background.elevated }]}>
        <View style={[styles.countryCode, { borderRightColor: theme.colors.background.elevated }]}>
          <Text style={[styles.countryCodeText, { color: theme.colors.text.primary }]}>+91</Text>
        </View>
        <TextInput
          style={[styles.phoneInput, { color: theme.colors.text.primary }]}
          placeholder="00000 00000"
          placeholderTextColor={theme.colors.text.muted}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          autoFocus
        />
      </View>

      <TouchableOpacity 
        style={[styles.primaryBtn, { backgroundColor: theme.colors.accent.primary }, loading && { opacity: 0.7 }]} 
        onPress={handleRequestOtp}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={isDarkMode ? '#000' : '#fff'} /> : <Text style={[styles.primaryBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>Send Code</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => switchView('CHOICE')}>
        <Text style={[styles.backBtnText, { color: theme.colors.text.muted }]}>Change method</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOtpInput = () => (
    <View style={styles.viewContainer}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Verify it's you</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Enter the code sent to +91 {phone}</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={[styles.otpInput, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.background.elevated, color: theme.colors.text.primary }]}
        placeholder="000000"
        placeholderTextColor={theme.colors.text.muted}
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        autoFocus
      />

      <TouchableOpacity 
        style={[styles.primaryBtn, { backgroundColor: theme.colors.accent.primary }, loading && { opacity: 0.7 }]} 
        onPress={handleVerifyOtp}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={isDarkMode ? '#000' : '#fff'} /> : <Text style={[styles.primaryBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>Verify & Continue</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => switchView('PHONE_INPUT')}>
        <Text style={[styles.backBtnText, { color: theme.colors.text.muted }]}>Resend code</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNameInput = () => (
    <View style={styles.viewContainer}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>What's your name?</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Help us personalize your experience.</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.background.elevated }]}>
        <Feather name="user" size={20} color={theme.colors.text.muted} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: theme.colors.text.primary }]}
          placeholder="Full Name"
          placeholderTextColor={theme.colors.text.muted}
          value={name}
          onChangeText={setName}
          autoFocus
        />
      </View>

      <TouchableOpacity 
        style={[styles.primaryBtn, { backgroundColor: theme.colors.accent.primary }, loading && { opacity: 0.7 }]} 
        onPress={handleCompleteProfile}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={isDarkMode ? '#000' : '#fff'} /> : <Text style={[styles.primaryBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>Complete Signup</Text>}
      </TouchableOpacity>
    </View>
  );

  const renderEmailAuth = () => (
    <View style={styles.viewContainer}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>{view === 'EMAIL_LOGIN' ? 'Welcome Back' : 'Create Account'}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Use your email to access your AirSaathi profile.</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {view === 'EMAIL_SIGNUP' && (
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.background.elevated }]}>
          <Feather name="user" size={20} color={theme.colors.text.muted} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: theme.colors.text.primary }]}
            placeholder="Full Name"
            placeholderTextColor={theme.colors.text.muted}
            value={name}
            onChangeText={setName}
          />
        </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.background.elevated }]}>
        <Feather name="mail" size={20} color={theme.colors.text.muted} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: theme.colors.text.primary }]}
          placeholder="Email Address"
          placeholderTextColor={theme.colors.text.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.background.elevated }]}>
        <Feather name="lock" size={20} color={theme.colors.text.muted} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: theme.colors.text.primary }]}
          placeholder="Password"
          placeholderTextColor={theme.colors.text.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity 
        style={[styles.primaryBtn, { backgroundColor: theme.colors.accent.primary }, loading && { opacity: 0.7 }]} 
        onPress={handleEmailAuth}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={isDarkMode ? '#000' : '#fff'} /> : <Text style={[styles.primaryBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>{view === 'EMAIL_LOGIN' ? 'Login' : 'Sign Up'}</Text>}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.toggleBtn} 
        onPress={() => switchView(view === 'EMAIL_LOGIN' ? 'EMAIL_SIGNUP' : 'EMAIL_LOGIN')}
      >
        <Text style={[styles.toggleText, { color: theme.colors.text.secondary }]}>
          {view === 'EMAIL_LOGIN' ? "Don't have an account? " : "Already have an account? "}
          <Text style={[styles.toggleTextBold, { color: theme.colors.accent.primary }]}>{view === 'EMAIL_LOGIN' ? 'Sign Up' : 'Login'}</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => switchView('CHOICE')}>
        <Text style={[styles.backBtnText, { color: theme.colors.text.muted }]}>Back to options</Text>
      </TouchableOpacity>
    </View>
  );

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
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background.primary }]}>
          <View style={[styles.handle, { backgroundColor: theme.colors.background.elevated }]} />
          <TouchableOpacity onPress={closeAuthModal} style={styles.closeBtn}>
            <MaterialIcons name="close" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
            {view === 'CHOICE' && renderChoice()}
            {view === 'PHONE_INPUT' && renderPhoneInput()}
            {view === 'OTP_INPUT' && renderOtpInput()}
            {view === 'NAME_INPUT' && renderNameInput()}
            {(view === 'EMAIL_LOGIN' || view === 'EMAIL_SIGNUP') && renderEmailAuth()}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 16,
    marginRight: 8,
  },
  viewContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
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
    fontSize: 24,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: 64,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  countryCode: {
    paddingHorizontal: 16,
    borderRightWidth: 1,
    height: '100%',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  otpInput: {
    width: '100%',
    height: 80,
    borderRadius: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 32,
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 10,
    borderWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    height: 56,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  primaryBtn: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  secondaryBtn: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  backBtn: {
    padding: 16,
  },
  backBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  toggleBtn: {
    marginTop: 8,
    padding: 8,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  toggleTextBold: {
    fontFamily: 'Inter_700Bold',
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: 'underline',
  }
});
