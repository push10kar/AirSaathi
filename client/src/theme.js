export const theme = {
  colors: {
    'secondary-fixed-dim': '#adc7ff',
    'inverse-on-surface': '#eaf1ff',
    'surface-variant': '#d3e4fe',
    'outline-variant': '#bbcbb9',
    'surface-container-low': '#eff4ff',
    'primary-container': '#00d166',
    'on-secondary': '#ffffff',
    'outline': '#6c7b6c',
    'surface-container-high': '#dce9ff',
    'secondary-container': '#0070ea',
    'on-primary-container': '#005324',
    'on-background': '#0b1c30',
    'background': '#f8f9ff',
    'on-error-container': '#93000a',
    'inverse-primary': '#30e375',
    'surface-tint': '#006d32',
    'on-tertiary-fixed': '#131b2e',
    'on-secondary-container': '#fefcff',
    'secondary': '#0059bb',
    'on-primary-fixed-variant': '#005224',
    'surface-dim': '#cbdbf5',
    'tertiary-fixed-dim': '#bec6e0',
    'primary-fixed': '#64ff92',
    'on-primary-fixed': '#00210b',
    'primary': '#006d32',
    'on-surface': '#0b1c30',
    'error-container': '#ffdad6',
    'primary-fixed-dim': '#30e375',
    'surface-container-lowest': '#ffffff',
    'secondary-fixed': '#d8e2ff',
    'surface-container-highest': '#d3e4fe',
    'on-tertiary': '#ffffff',
    'error': '#ba1a1a',
    'surface': '#f8f9ff',
    'tertiary-container': '#aeb5cf',
    'on-primary': '#ffffff',
    'on-surface-variant': '#3c4a3d',
    'on-secondary-fixed-variant': '#004493',
    'on-tertiary-container': '#3f475c',
    'surface-container': '#e5eeff',
    'surface-bright': '#f8f9ff',
    'tertiary': '#565e74',
    'on-error': '#ffffff',
    'tertiary-fixed': '#dae2fd',
    'inverse-surface': '#213145',
    'on-secondary-fixed': '#001a41',
    'on-tertiary-fixed-variant': '#3f465c'
  },
  fonts: {
    headline: {
      light: 'SpaceGrotesk_300Light',
      regular: 'SpaceGrotesk_400Regular',
      medium: 'SpaceGrotesk_500Medium',
      semiBold: 'SpaceGrotesk_600SemiBold',
      bold: 'SpaceGrotesk_700Bold',
    },
    body: {
      light: 'Inter_300Light',
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semiBold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
    label: {
      light: 'Inter_300Light',
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semiBold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    }
  }
};

export const darkTheme = {
  colors: {
    background: {
      primary: '#090909',
      secondary: '#1E1E1D',
      elevated: '#2A2A29'
    },
    accent: {
      primary: '#c4ff01',
      hover: '#d2ff33'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9D9D9D',
      muted: '#616A5C'
    },
    support: {
      teal: '#1E655F',
      error: '#FF5449' // Suitable error color for dark mode
    }
  },
  fonts: theme.fonts
};

export const lightTheme = {
  colors: {
    background: {
      primary: '#f8f9ff',
      secondary: '#e5eeff',
      elevated: '#ffffff'
    },
    accent: {
      primary: '#006d32',
      hover: '#00d166'
    },
    text: {
      primary: '#0b1c30',
      secondary: '#6c7b6c',
      muted: '#3c4a3d'
    },
    support: {
      teal: '#0070ea',
      error: '#ba1a1a'
    }
  },
  fonts: theme.fonts
};
