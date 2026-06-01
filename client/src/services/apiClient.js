import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

// ─────────────────────────────────────────────────────────────
// Centralized API Client with Auto Token Refresh
// ─────────────────────────────────────────────────────────────
// On any 401 TOKEN_EXPIRED response, it automatically:
//   1. Fetches a new access token using the stored refresh token
//   2. Saves the new access token
//   3. Retries the original request once
// On refresh failure → logs the user out cleanly (no crash)
// ─────────────────────────────────────────────────────────────

let _logoutCallback = null;

export const registerLogoutCallback = (fn) => {
  _logoutCallback = fn;
};

const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token');

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();
  if (!response.ok || data.status !== 'success') {
    throw new Error(data.message || 'Token refresh failed');
  }

  await AsyncStorage.setItem('access_token', data.accessToken);
  return data.accessToken;
};

const apiRequest = async (url, options = {}, retry = true) => {
  const accessToken = await AsyncStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${url}`, { ...options, headers });
    
    // Read response text first to handle potential non-JSON responses
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error(`[API Client] Failed to parse JSON from ${url}. Response starts with: ${responseText.substring(0, 50)}`);
      throw new Error(`Invalid server response (Not JSON). Response: ${responseText.substring(0, 100)}`);
    }

    // Auto-refresh on token expiry
    if (response.status === 401 && data.code === 'TOKEN_EXPIRED' && retry) {
      try {
        const newToken = await refreshAccessToken();
        return apiRequest(url, {
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
        }, false); // retry=false prevents infinite loop
      } catch (refreshError) {
        // Refresh failed — force logout
        if (_logoutCallback) _logoutCallback();
        throw new Error('Session expired. Please log in again.');
      }
    }

    return { response, data };
  } catch (error) {
    console.error(`[API Client Error] ${url}:`, error.message);
    throw error;
  }
};

export default apiRequest;
