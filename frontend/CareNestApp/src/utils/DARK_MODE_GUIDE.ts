/**
 * HƯỚNG DẪN APPLY DARK MODE CHO CÁC SCREENS
 *
 * ==============================================
 * BƯỚC 1: Import hooks cần thiết
 * ==============================================
 * import { useThemedColors } from '../../hooks/useThemedColors';
 *
 * ==============================================
 * BƯỚC 2: Sử dụng trong component
 * ==============================================
 * export default function YourScreen() {
 *   const colors = useThemedColors();
 *
 *   return (
 *     <View style={[styles.container, { backgroundColor: colors.background }]}>
 *       <Text style={[styles.title, { color: colors.onBackground }]}>Title</Text>
 *       <View style={[styles.card, { backgroundColor: colors.surface }]}>
 *         <Text style={[styles.text, { color: colors.onSurface }]}>Content</Text>
 *       </View>
 *     </View>
 *   );
 * }
 *
 * ==============================================
 * BƯỚC 3: Cập nhật StyleSheet colors
 * ==============================================
 * const styles = StyleSheet.create({
 *   container: {
 *     flex: 1,
 *     backgroundColor: '#f7fafe' // Light mode default
 *   },
 *   title: {
 *     color: '#181c1f' // Light mode default
 *   },
 *   card: {
 *     backgroundColor: '#f7fafe' // Light mode default
 *   },
 *   text: {
 *     color: '#181c1f' // Light mode default
 *   }
 * });
 *
 * ==============================================
 * CÁC COLOR TOKENS CÓ SẴN:
 * ==============================================
 * Light Mode:
 * - background: '#f7fafe' (nền chính)
 * - onBackground: '#181c1f' (text trên nền)
 * - surface: '#f7fafe' (card/container)
 * - onSurface: '#181c1f' (text trên surface)
 * - onSurfaceVariant: '#404751' (text phụ)
 * - surfaceVariant: '#e0e3e7' (divider/border)
 * - primary: '#00629d' (màu chính)
 * - error: '#ba1a1a' (lỗi)
 *
 * Dark Mode:
 * - background: '#0f1417' (nền chính)
 * - onBackground: '#e3e7ea' (text trên nền)
 * - surface: '#0f1417' (card/container)
 * - onSurface: '#e3e7ea' (text trên surface)
 * - onSurfaceVariant: '#c4ccd4' (text phụ)
 * - surfaceVariant: '#49525a' (divider/border)
 * - primary: '#99cbff' (màu chính)
 * - error: '#ffb4ab' (lỗi)
 *
 * ==============================================
 * EXAMPLE: Simple Screen
 * ==============================================
 * export default function ExampleScreen() {
 *   const colors = useThemedColors();
 *
 *   return (
 *     <View style={[styles.root, { backgroundColor: colors.background }]}>
 *       <ScrollView>
 *         <View style={[styles.card, shadows.sm, { backgroundColor: colors.surface }]}>
 *           <Text style={[styles.title, { color: colors.onSurface }]}>
 *             Tiêu đề
 *           </Text>
 *           <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
 *             Mô tả
 *           </Text>
 *         </View>
 *       </ScrollView>
 *     </View>
 *   );
 * }
 *
 * const styles = StyleSheet.create({
 *   root: { flex: 1 },
 *   card: { borderRadius: 12, padding: 16 },
 *   title: { fontSize: 18, fontWeight: '700' },
 *   subtitle: { fontSize: 14, marginTop: 4 }
 * });
 */

export const DARK_MODE_GUIDE = {
  step1: 'Import useThemedColors from ../../hooks/useThemedColors',
  step2: 'Call const colors = useThemedColors() in component',
  step3: 'Replace hardcoded colors with colors.* tokens',
  step4:
    'Use inline styles: [styles.className, { backgroundColor: colors.background }]',
};
