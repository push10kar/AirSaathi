import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

// API URL Configuration
// Use '10.0.2.2' for Android Emulator, or your computer's local IP (e.g. 192.168.1.5) for physical devices
const API_URL = 'http://10.0.2.2:5000/api'; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user_data');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load auth data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        await saveAuthData(data.token, data.data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (e) {
      return { success: false, message: 'Connection error' };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        await saveAuthData(data.token, data.data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (e) {
      return { success: false, message: 'Connection error' };
    }
  };

  const requestOtp = async (phone) => {
    try {
      const response = await fetch(`${API_URL}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      
      const data = await response.json();
      return { success: data.status === 'success', message: data.message, code: data.code };
    } catch (e) {
      return { success: false, message: 'Connection error' };
    }
  };

  const verifyOtp = async (phone, code) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        await saveAuthData(data.token, data.data.user);
        return { success: true, isNewUser: data.isNewUser };
      } else {
        return { success: false, message: data.message };
      }
    } catch (e) {
      return { success: false, message: 'Connection error' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_URL}/auth/update-me`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setUser(data.data.user);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (e) {
      return { success: false, message: 'Connection error' };
    }
  };

  const saveAuthData = async (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    await AsyncStorage.setItem('auth_token', newToken);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  };

  /**
   * THE SOFT GATE TRIGGER
   * Use this function to wrap any gated action.
   * Example: onPress={() => requireAuth(() => handleLike())}
   */
  const requireAuth = (action) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      setIsAuthModalVisible(true);
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalVisible(false);
    setPendingAction(null);
  };

  const onAuthSuccess = () => {
    setIsAuthModalVisible(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      signup, 
      requestOtp,
      verifyOtp,
      updateProfile,
      logout,
      requireAuth,
      isAuthModalVisible,
      closeAuthModal,
      onAuthSuccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
