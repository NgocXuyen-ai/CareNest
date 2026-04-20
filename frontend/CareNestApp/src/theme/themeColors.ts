import type { Theme } from '../context/ThemeContext';

export interface ColorScheme {
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;
  primaryFixed: string;
  primaryFixedDim: string;
  onPrimaryFixed: string;
  onPrimaryFixedVariant: string;

  secondary: string;
  secondaryContainer: string;
  onSecondary: string;
  onSecondaryContainer: string;
  secondaryFixed: string;
  secondaryFixedDim: string;
  onSecondaryFixed: string;
  onSecondaryFixedVariant: string;

  tertiary: string;
  tertiaryContainer: string;
  onTertiary: string;
  onTertiaryContainer: string;
  tertiaryFixed: string;
  tertiaryFixedDim: string;
  onTertiaryFixed: string;
  onTertiaryFixedVariant: string;

  error: string;
  errorContainer: string;
  onError: string;
  onErrorContainer: string;

  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  onSurfaceVariant: string;
  surfaceVariant: string;
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceContainerLowest: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceTint: string;

  outline: string;
  outlineVariant: string;
}

const lightColors: ColorScheme = {
  primary: '#00629d',
  primaryContainer: '#42a5f5',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#00395e',
  primaryFixed: '#cfe5ff',
  primaryFixedDim: '#99cbff',
  onPrimaryFixed: '#001d34',
  onPrimaryFixedVariant: '#004a78',

  secondary: '#526069',
  secondaryContainer: '#d3e2ed',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#56656e',
  secondaryFixed: '#d6e5ef',
  secondaryFixedDim: '#bac9d3',
  onSecondaryFixed: '#0f1d25',
  onSecondaryFixedVariant: '#3b4951',

  tertiary: '#005faf',
  tertiaryContainer: '#57a1ff',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#003769',
  tertiaryFixed: '#d4e3ff',
  tertiaryFixedDim: '#a5c8ff',
  onTertiaryFixed: '#001c3a',
  onTertiaryFixedVariant: '#004786',

  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  background: '#f7fafe',
  onBackground: '#181c1f',
  surface: '#f7fafe',
  onSurface: '#181c1f',
  onSurfaceVariant: '#404751',
  surfaceVariant: '#e0e3e7',
  surfaceContainer: '#ebeef2',
  surfaceContainerLow: '#f1f4f8',
  surfaceContainerHigh: '#e5e8ec',
  surfaceContainerHighest: '#e0e3e7',
  surfaceContainerLowest: '#ffffff',
  surfaceDim: '#d7dade',
  surfaceBright: '#f7fafe',
  surfaceTint: '#00629d',

  outline: '#707882',
  outlineVariant: '#bfc7d3',
};

const darkColors: ColorScheme = {
  primary: '#99cbff',
  primaryContainer: '#004a78',
  onPrimary: '#001d34',
  onPrimaryContainer: '#cfe5ff',
  primaryFixed: '#cfe5ff',
  primaryFixedDim: '#99cbff',
  onPrimaryFixed: '#001d34',
  onPrimaryFixedVariant: '#004a78',

  secondary: '#b7c7d1',
  secondaryContainer: '#3b4951',
  onSecondary: '#1f2d36',
  onSecondaryContainer: '#d3e2ed',
  secondaryFixed: '#d6e5ef',
  secondaryFixedDim: '#bac9d3',
  onSecondaryFixed: '#0f1d25',
  onSecondaryFixedVariant: '#3b4951',

  tertiary: '#a5c8ff',
  tertiaryContainer: '#004786',
  onTertiary: '#001c3a',
  onTertiaryContainer: '#d4e3ff',
  tertiaryFixed: '#d4e3ff',
  tertiaryFixedDim: '#a5c8ff',
  onTertiaryFixed: '#001c3a',
  onTertiaryFixedVariant: '#004786',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  background: '#0f1417',
  onBackground: '#e3e7ea',
  surface: '#0f1417',
  onSurface: '#e3e7ea',
  onSurfaceVariant: '#c4ccd4',
  surfaceVariant: '#49525a',
  surfaceContainer: '#191c20',
  surfaceContainerLow: '#191c20',
  surfaceContainerHigh: '#242a2f',
  surfaceContainerHighest: '#2f353a',
  surfaceContainerLowest: '#0a0d10',
  surfaceDim: '#0f1417',
  surfaceBright: '#353b40',
  surfaceTint: '#99cbff',

  outline: '#8f9799',
  outlineVariant: '#49525a',
};

export function getThemeColors(theme: Theme | 'light' | 'dark'): ColorScheme {
  return theme === 'dark' ? darkColors : lightColors;
}

export { lightColors, darkColors };
