import { useThemedColors } from './useThemedColors';

/**
 * Hook này cung cấp tất cả themedColors cho một screen
 * Thay vì phải import và dùng useThemedColors() trong từng component
 */
export function useScreenColors() {
  return useThemedColors();
}
