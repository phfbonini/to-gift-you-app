export const colors = {
  primary: '#8840c0',
  secondary: '#1d1d2e',
  background: '#ffffff',
  surface: '#1a1a20',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  onBackground: '#1a1a20',
  onSurface: '#ffffff',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',
  text: {
    primary: '#1a1a20',
    secondary: '#666666',
    disabled: '#999999',
  },
  border: '#e0e0e0',
  placeholder: '#999999',
} as const;

export type ColorTheme = typeof colors;
