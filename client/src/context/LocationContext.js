import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiRequest from '../services/apiClient';

const LocationContext = createContext(null);

// Maharashtra bounding box for Nominatim
const MAHARASHTRA_BBOX = '72.6,22.1,80.9,15.6';

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState({
    coords: null,
    city: 'Select Location',
    address: 'Tap to set your location',
    isAuto: false,
    permissionStatus: 'undetermined'
  });
  const [aqiData, setAqiData] = useState(null);
  const [nearestStation, setNearestStation] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load saved addresses on mount
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const saved = await AsyncStorage.getItem('@saved_addresses');
        if (saved) setSavedAddresses(JSON.parse(saved));
      } catch (err) {
        console.error('[LocationContext] Error loading addresses:', err);
      }
    };
    loadSaved();
  }, []);

  const saveAddress = async (item) => {
    try {
      const city = item.address?.city || item.address?.town || item.address?.suburb || item.name || 'Unknown';
      const newAddr = {
        id: item.place_id || Date.now().toString(),
        name: city,
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        timestamp: Date.now()
      };

      setSavedAddresses(prev => {
        const filtered = prev.filter(a => a.display_name !== item.display_name);
        const updated = [newAddr, ...filtered].slice(0, 10); // Keep last 10
        AsyncStorage.setItem('@saved_addresses', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('[LocationContext] Error saving address:', err);
    }
  };

  const removeAddress = async (id) => {
    setSavedAddresses(prev => {
      const updated = prev.filter(a => a.id !== id);
      AsyncStorage.setItem('@saved_addresses', JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch AQI data for current coordinates using WAQI API
  const fetchAqiData = async (lat, lng, cityName) => {
    try {
      console.log(`[LocationContext] Fetching AQI for ${cityName || 'current coords'} (${lat}, ${lng})`);
      const WAQI_TOKEN = '7171a8e4a1a447d22ec11b41122c517fb68b978f';
      
      let targetData = null;
      let usedSearch = false;

      // 1. Try to search for stations in the specific city first for better relevance
      if (cityName && cityName !== 'Unknown Location' && cityName !== 'Select Location') {
        const searchRes = await fetch(
          `https://api.waqi.info/search/?token=${WAQI_TOKEN}&keyword=${encodeURIComponent(cityName)}`
        );
        const searchJson = await searchRes.json();
        
        if (searchJson.status === 'ok' && searchJson.data.length > 0) {
          // Find first active station in this city (updated in last 48 hours)
          const now = new Date();
          const activeStation = searchJson.data.find(s => {
            if (!s.time?.stime) return false;
            const stationDate = new Date(s.time.stime.replace(' ', 'T'));
            return (now - stationDate) < (48 * 60 * 60 * 1000); // 48 hours
          });

          if (activeStation) {
            // Fetch full details for this specific station
            const detailRes = await fetch(`https://api.waqi.info/feed/@${activeStation.uid}/?token=${WAQI_TOKEN}`);
            const detailJson = await detailRes.json();
            if (detailJson.status === 'ok') {
              targetData = detailJson.data;
              usedSearch = true;
              console.log(`[LocationContext] Found active city-matched station: ${targetData.city.name}`);
            }
          }
        }
      }

      // 2. Fallback to GEO API if no active city-matched station was found
      if (!targetData) {
        const geoRes = await fetch(
          `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${WAQI_TOKEN}`
        );
        const geoJson = await geoRes.json();
        if (geoJson.status === 'ok') {
          targetData = geoJson.data;
        }
      }
      
      if (targetData) {
        const aqi = targetData.aqi;
        const iaqi = targetData.iaqi;
        const isNearby = usedSearch || (cityName && targetData.city.name.toLowerCase().includes(cityName.toLowerCase()));

        // Standard Indian/EPA AQI Categories
        let category = 'Good';
        let color = '#00d166';
        if (aqi > 300) { category = 'Hazardous'; color = '#93000a'; }
        else if (aqi > 200) { category = 'Very Unhealthy'; color = '#FF4B4B'; }
        else if (aqi > 150) { category = 'Unhealthy'; color = '#FF7A00'; }
        else if (aqi > 100) { category = 'Poor'; color = '#FFB800'; }
        else if (aqi > 50) { category = 'Moderate'; color = '#FFD600'; }

        setAqiData({
          aqi: aqi,
          displayAqi: aqi,
          category: category,
          color: color,
          pm25: iaqi.pm25?.v,
          pm10: iaqi.pm10?.v,
          no2: iaqi.no2?.v,
          so2: iaqi.so2?.v,
          co: iaqi.co?.v,
          o3: iaqi.o3?.v,
          temp: iaqi.t?.v || 28,
          humidity: iaqi.h?.v || 65,
          updatedAt: targetData.time.s || new Date().toISOString()
        });

        // --- SYNC WITH BACKEND ---
        // Fetch the nearest internal station from our own backend to get a valid UUID for history
        try {
          const backendRes = await apiRequest(`/aqi/nearest?lat=${lat}&lng=${lng}`);
          if (backendRes.data.status === 'success') {
            const internalStation = backendRes.data.data;
            console.log(`[LocationContext] Synced with backend station: ${internalStation.name} (${internalStation.id})`);
            
            setNearestStation({
              id: internalStation.id, // This is now a UUID!
              name: cityName || internalStation.name,
              distance: `${internalStation.distance_km.toFixed(1)} km away`,
              city: internalStation.city,
              isInternal: true
            });
          } else {
            throw new Error('Backend station not found');
          }
        } catch (backendErr) {
          console.warn('[LocationContext] Backend sync failed, falling back to WAQI ID:', backendErr.message);
          setNearestStation({
            id: targetData.idx, // Fallback to WAQI ID
            name: cityName || targetData.city.name,
            distance: isNearby ? 'Local Station' : 'Regional Coverage',
            city: cityName || targetData.city.name,
            isInternal: false
          });
        }
      } else {
        setErrorMsg('Air quality data not available for this area');
      }
    } catch (err) {
      console.error('[LocationContext] WAQI Fetch Error:', err.message);
      setErrorMsg(`AQI Error: ${err.message}`);
    }
  };

  // Nominatim Reverse Geocode
  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        {
          headers: {
            'User-Agent': 'AirSaathi/1.0',
            'Accept-Language': 'en',
          },
        }
      );
      return await res.json();
    } catch (error) {
      console.error('[LocationContext] Reverse Geocode Error:', error);
      return null;
    }
  };

  // Nominatim Search
  const searchLocations = async (query) => {
    if (!query || query.trim().length < 3) return [];
    
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Maharashtra')}&format=json&addressdetails=1&limit=10&countrycodes=in&viewbox=${MAHARASHTRA_BBOX}&bounded=1`;
    
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'AirSaathi/1.0',
          'Accept-Language': 'en',
        },
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('[LocationContext] Search Error:', error);
      return [];
    }
  };

  // Function to get current location
  const detectLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      console.log('[LocationContext] Starting location detection...');
      
      // Check if location services are enabled on the device
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        console.warn('[LocationContext] Location services are disabled');
        setErrorMsg('Location services are disabled on your device.');
        setLoading(false);
        return false;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocation(prev => ({ ...prev, permissionStatus: status }));

      if (status !== 'granted') {
        console.warn('[LocationContext] Location permission denied');
        setErrorMsg('Location permission denied. Please enable it in settings.');
        setLoading(false);
        return false;
      }

      let pos = null;
      try {
        // Try fresh position first with a reasonable timeout
        pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch (e) {
        console.warn('[LocationContext] Fresh GPS failed, trying last known position...');
        pos = await Location.getLastKnownPositionAsync({});
      }

      if (!pos) {
        throw new Error('GPS signal not found. Please try again or search manually.');
      }
      
      console.log('[LocationContext] Position acquired:', pos.coords);

      // Use Nominatim for better reverse geocoding results
      const data = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      
      const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.district || 'Unknown Location';
      const address = data?.display_name || `${city}, Maharashtra`;
      
      const newLoc = {
        coords: pos.coords,
        city: city,
        address: address,
        isAuto: true,
        permissionStatus: status
      };
      
      setLocation(newLoc);
      await fetchAqiData(pos.coords.latitude, pos.coords.longitude, city);
      return true;
    } catch (error) {
      console.error('[LocationContext] Detection Error:', error.message);
      setErrorMsg('Location unavailable. Please check GPS settings or enter manually.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to manually set location (from search)
  const setManualLocation = async (item) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const city = item.address?.city || item.address?.town || item.address?.suburb || item.name || 'Unknown';
      const newLoc = {
        coords: {
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon)
        },
        city: city,
        address: item.display_name,
        isAuto: false,
        permissionStatus: location.permissionStatus
      };
      setLocation(newLoc);
      await saveAddress(item);
      await fetchAqiData(newLoc.coords.latitude, newLoc.coords.longitude, city);
    } catch (error) {
      console.error('[LocationContext] Set Manual Location Error:', error);
      setErrorMsg('Failed to set manual location.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoLocation = (val) => {
    if (val) {
      detectLocation();
    } else {
      setLocation(prev => ({ ...prev, isAuto: false }));
    }
  };

  // Function to refresh AQI for current location without re-detecting GPS
  const refreshAqi = async () => {
    if (!location.coords) return false;
    setLoading(true);
    try {
      await fetchAqiData(location.coords.latitude, location.coords.longitude, location.city);
      return true;
    } catch (error) {
      console.error('[LocationContext] Refresh Error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ONLY sync permission status on mount, do NOT auto-detect
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocation(prev => ({ ...prev, permissionStatus: status }));
    })();
  }, []);


  const value = useMemo(() => ({ 
    location, 
    aqiData,
    nearestStation,
    errorMsg, 
    loading, 
    savedAddresses,
    detectLocation, 
    setManualLocation,
    searchLocations,
    toggleAutoLocation,
    refreshAqi,
    removeAddress
  }), [location, aqiData, nearestStation, errorMsg, loading, savedAddresses, detectLocation, setManualLocation, searchLocations, toggleAutoLocation, refreshAqi, removeAddress]);

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
