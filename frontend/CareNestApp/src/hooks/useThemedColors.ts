import { useTheme } from '../context/ThemeContext';
import { getThemeColors } from '../theme/themeColors';

export function useThemedColors() {
  const { theme } = useTheme();
  return getThemeColors(theme);
}
