import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../theme';

const ThemeContext = createContext({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetDarkMode, setTargetDarkMode] = useState(isDarkMode);

  // Listen to system theme changes
  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
    setTargetDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setTargetDarkMode(nextMode); // Set the intended theme immediately
    setIsTransitioning(true);
    
    // We use a very short timeout to ensure the overlay starts its animation 
    // before the heavy global state update blocks the JS thread.
    setTimeout(() => {
      setIsDarkMode(nextMode);
      
      // Wait for the re-render to "settle" before hiding the overlay
      setTimeout(() => {
        setIsTransitioning(false);
      }, 700); 
    }, 50); // 50ms is enough to let the overlay mount but fast enough to feel instant
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = useMemo(() => ({
    theme,
    isDarkMode,
    isTransitioning,
    targetDarkMode, // Export target state for the overlay
    toggleTheme
  }), [isDarkMode, isTransitioning, targetDarkMode, theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
