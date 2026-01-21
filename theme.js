import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

const lightColors = {
  background: '#0B1220',
  surface: '#111827',
  primary: '#60A5FA',
  primaryDark: '#3B82F6',
  text: '#E5E7EB',
  muted: '#9CA3AF',
  border: '#1F2937',
  success: '#16A34A',
  warning: '#D97706',
};

const darkColors = {
  background: '#0B1220',
  surface: '#111827',
  primary: '#60A5FA',
  primaryDark: '#3B82F6',
  text: '#E5E7EB',
  muted: '#9CA3AF',
  border: '#1F2937',
  success: '#16A34A',
  warning: '#D97706',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
};

function createTypography(colors) {
  return {
    title: { fontSize: 22, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 14, color: colors.muted },
    label: { fontSize: 16, fontWeight: '600', color: colors.text },
  };
}

const ThemeContext = createContext({ colors: darkColors, typography: createTypography(darkColors), mode: 'dark', setMode: () => {} });

export function ThemeProvider({ children }) {
  const systemScheme = Appearance.getColorScheme();
  const [mode, setMode] = useState(systemScheme || 'dark');

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setMode(colorScheme || 'dark');
    });
    return () => sub.remove();
  }, []);

  const colors = mode === 'dark' ? darkColors : lightColors;
  const typography = useMemo(() => createTypography(colors), [colors]);

  const value = useMemo(() => ({ colors, typography, mode, setMode }), [colors, typography, mode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Backwards-compatible named exports for legacy imports
export const colors = darkColors;
export const typography = createTypography(darkColors);



