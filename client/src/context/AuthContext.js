import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../config';
import apiRequest, { registerLogoutCallback } from '../services/apiClient';



const AuthContext = createContext(null);



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Kept as 'token' for backward compat (= access token)
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);





  // Register logout callback for apiClient auto-logout on refresh failure
  useEffect(() => {
    registerLogoutCallback(logout);
  }, []);

  // ─── Persist Session on App Start ─────────────────────────────
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('access_token');
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

  const saveAuthData = async (accessToken, refreshToken, userData) => {
    setToken(accessToken);
    setUser(userData);
    await AsyncStorage.setItem('access_token', accessToken);
    await AsyncStorage.setItem('refresh_token', refreshToken);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
  };

  // Helper for error formatting
  const formatErrorMessage = (message) => {
    if (!message) return '';
    try {
      const parsed = typeof message === 'string' ? JSON.parse(message) : message;
      if (Array.isArray(parsed) && parsed[0]?.message) {
        return parsed[0].message;
      }
    } catch (e) {
      // Not a JSON string or doesn't match expected structure, return as is
    }
    return message;
  };

  // ─── Email / Password Auth ─────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { response, data } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.status === 'success') {
        await saveAuthData(data.accessToken, data.refreshToken, data.data.user);
        return { success: true };
      }
      return { success: false, message: formatErrorMessage(data.message) };
    } catch (e) {
      return { success: false, message: 'Connection error' };
    }
  };

  const signup = async (userData) => {
    try {
      const { response, data } = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (data.status === 'success') {
        await saveAuthData(data.accessToken, data.refreshToken, data.data.user);
        return { success: true };
      }
      return { success: false, message: formatErrorMessage(data.message) };
    } catch (e) {
      return { success: false, message: 'Connection error' };
    }
  };



  // ─── OTP Auth ──────────────────────────────────────────────────
  const requestOtp = async (phone) => {
    try {
      const { data } = await apiRequest('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      return { success: data.status === 'success', message: formatErrorMessage(data.message), code: data.code };
    } catch (e) {
      return { success: false, message: 'Connection error' };
    }
  };

  const verifyOtp = async (phone, code) => {
    try {
      const { data } = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      });
      if (data.status === 'success') {
        await saveAuthData(data.accessToken, data.refreshToken, data.data.user);
        return { success: true, isNewUser: data.isNewUser };
      }
      return { success: false, message: formatErrorMessage(data.message) };
    } catch (e) {
      return { success: false, message: 'Connection error' };
    }
  };

  // ─── Profile Update ────────────────────────────────────────────
  const updateProfile = async (profileData) => {
    try {
      const { data } = await apiRequest('/auth/update-me', {
        method: 'PATCH',
        body: JSON.stringify(profileData),
      });
      if (data.status === 'success') {
        setUser(data.data.user);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
        return { success: true };
      }
      return { success: false, message: formatErrorMessage(data.message) };
    } catch (e) {
      return { success: false, message: 'Connection error' };
    }
  };

  // ─── Logout ────────────────────────────────────────────────────
  const logout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        // Revoke the session on the server (fire and forget)
        fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {}); // Don't block UI on network failure
      }
    } catch (e) {}

    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
  };

  // ─── Soft Gate ─────────────────────────────────────────────────
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


  const value = useMemo(() => ({
    user,
    token,       // = access token (kept for backward compat)
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
    onAuthSuccess,
  }), [user, token, isLoading, isAuthModalVisible, pendingAction]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
