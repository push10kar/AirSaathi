import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState({
    coords: { latitude: 18.5204, longitude: 73.8567 }, // Default: Pune
    city: 'Pune',
    address: 'Maharashtra, India',
    isAuto: true
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

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
      
      setLocation({
        coords: pos.coords,
        city: city,
        address: `${reverse[0]?.name || ''}, ${city}`,
        isAuto: true
      });
    } catch (error) {
      setErrorMsg('Could not detect location');
    } finally {
      setLoading(false);
    }
  };

  // Function to manually set location (from search)
  const setManualLocation = (data, details = null) => {
    if (details) {
      setLocation({
        coords: {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng
        },
        city: details.vicinity || data.description.split(',')[0],
        address: data.description,
        isAuto: false
      });
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ 
      location, 
      errorMsg, 
      loading, 
      detectLocation, 
      setManualLocation 
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
