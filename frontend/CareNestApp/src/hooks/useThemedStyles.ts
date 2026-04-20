import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useThemedColors } from './useThemedColors';

/**
 * Hook để tạo themed StyleSheet
 * Automatically override colors based on theme
 *
 * Example:
 * const styles = useThemedStyles((colors) => StyleSheet.create({
 *   container: { flex: 1, backgroundColor: colors.background },
 *   text: { color: colors.onBackground }
 * }));
 */
export function useThemedStyles<T extends Record<string, any>>(
  stylesFn: (colors: ReturnType<typeof useThemedColors>) => T,
): T {
  const colors = useThemedColors();

  return useMemo(() => {
    return stylesFn(colors);
  }, [colors]);
}
