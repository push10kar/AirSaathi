import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import apiRequest from '../services/apiClient';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState({
    coords: { latitude: 18.5204, longitude: 73.8567 }, // Default: Pune
    city: 'Pune',
    address: 'Maharashtra, India',
    isAuto: true
  });
  const [aqiData, setAqiData] = useState(null);
  const [nearestStation, setNearestStation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch AQI data for current coordinates
  const fetchAqiData = async (lat, lng) => {
    try {
      const { data } = await apiRequest(`/aqi/current?lat=${lat}&lng=${lng}`);
      if (data.status === 'success' && data.data.length > 0) {
        // data.data[0] is the closest station
        const closest = data.data[0];
        setNearestStation({
          name: closest.station_name,
          distance: closest.distance_km,
          city: closest.city
        });
        setAqiData({
          aqi: closest.aqi,
          category: closest.aqi_category,
          pm25: closest.pm25,
          pm10: closest.pm10,
          no2: closest.no2,
          o3: closest.o3,
          updatedAt: closest.recorded_at
        });
      }
    } catch (err) {
      console.error('Failed to fetch AQI data:', err.message);
    }
  };

  // Function to get current location
  const detectLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let pos = await Location.getCurrentPositionAsync({});
      
      // Reverse geocode to get city name
      let reverse = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      });

      const city = reverse[0]?.city || reverse[0]?.district || 'Unknown Location';
      
      const newLoc = {
        coords: pos.coords,
        city: city,
        address: `${reverse[0]?.name || ''}, ${city}`,
        isAuto: true
      };
      
      setLocation(newLoc);
      fetchAqiData(pos.coords.latitude, pos.coords.longitude);
    } catch (error) {
      setErrorMsg('Could not detect location');
    } finally {
      setLoading(false);
    }
  };

  // Function to manually set location (from search)
  const setManualLocation = (data, details = null) => {
    if (details) {
      const newLoc = {
        coords: {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng
        },
        city: details.vicinity || data.description.split(',')[0],
        address: data.description,
        isAuto: false
      };
      setLocation(newLoc);
      fetchAqiData(newLoc.coords.latitude, newLoc.coords.longitude);
    }
  };

  const toggleAutoLocation = (val) => {
    if (val) {
      detectLocation();
    } else {
      setLocation(prev => ({ ...prev, isAuto: false }));
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ 
      location, 
      aqiData,
      nearestStation,
      errorMsg, 
      loading, 
      detectLocation, 
      setManualLocation,
      toggleAutoLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
