# HƯỚNG DẪN ÁP DỤNG DARK MODE CHO TOÀN BỘ APP

## Tóm tắt

Dark mode đã được implement với ThemeContext + useThemedColors hook. Tất cả screens đều có thể support dark mode bằng cách đơn giản là thêm 3 dòng code.

## 1. QUICK START - Thêm Dark Mode vào 1 Screen

### Bước 1: Import hook

```tsx
import { useThemedColors } from '../../hooks/useThemedColors';
```

### Bước 2: Gọi hook trong component

```tsx
export default function YourScreen() {
  const colors = useThemedColors(); // ← Add này

  return <View>{/* content */}</View>;
}
```

### Bước 3: Replace hardcoded colors

```tsx
// BEFORE (hardcoded):
<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>
</View>

// AFTER (themed):
<View style={[styles.container, { backgroundColor: colors.background }]}>
  <Text style={[styles.title, { color: colors.onBackground }]}>Hello</Text>
</View>
```

## 2. Color Tokens Reference

### Light Mode (Default)

```
background:           '#f7fafe'  - Nền chính của screen
onBackground:         '#181c1f'  - Text trên nền chính
surface:              '#f7fafe'  - Card/container backgrounds
onSurface:            '#181c1f'  - Text trên surface
onSurfaceVariant:     '#404751'  - Secondary text (labels, hints)
surfaceVariant:       '#e0e3e7'  - Dividers, borders
primary:              '#00629d'  - Primary actions, highlights
secondary:            '#526069'  - Secondary elements
error:                '#ba1a1a'  - Error states
outline:              '#707882'  - Outlines, borders
```

### Dark Mode

```
background:           '#0f1417'  - Dark nền chính
onBackground:         '#e3e7ea'  - Light text
surface:              '#0f1417'  - Dark card/container
onSurface:            '#e3e7ea'  - Light text trên surface
onSurfaceVariant:     '#c4ccd4'  - Light secondary text
surfaceVariant:       '#49525a'  - Dark dividers
primary:              '#99cbff'  - Light blue actions
secondary:            '#b7c7d1'  - Light secondary
error:                '#ffb4ab'  - Light error
outline:              '#8f9799'  - Light outlines
```

## 3. PATTERNS & BEST PRACTICES

### Pattern 1: Inline Styles (Simple)

```tsx
<View style={[styles.card, { backgroundColor: colors.surface }]}>
  <Text style={[styles.text, { color: colors.onSurface }]}>Content</Text>
</View>
```

### Pattern 2: Reusable Styles Function

```tsx
const getThemedStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    text: {
      color: colors.onSurface,
    },
  });

// In component:
const themedStyles = getThemedStyles(colors);
<View style={themedStyles.card}>
  <Text style={themedStyles.text}>Content</Text>
</View>;
```

### Pattern 3: useThemedStyles Hook (Advanced)

```tsx
import { useThemedStyles } from '../../hooks/useThemedStyles';

export default function YourScreen() {
  const styles = useThemedStyles(colors =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background,
      },
      card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
      },
      title: {
        color: colors.onSurface,
        fontSize: 18,
        fontWeight: '700',
      },
    }),
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Hello</Text>
      </View>
    </View>
  );
}
```

## 4. COMMON ELEMENTS TO UPDATE

### ScrollView

```tsx
<ScrollView
  style={[styles.scrollView, { backgroundColor: colors.background }]}
  contentContainerStyle={[styles.content]}
>
  {/* content */}
</ScrollView>
```

### Input Field (TextInput)

```tsx
<TextInput
  style={[
    styles.input,
    {
      backgroundColor: colors.surface,
      color: colors.onSurface,
      borderColor: colors.outline,
    },
  ]}
  placeholderTextColor={colors.onSurfaceVariant}
  placeholder="Enter text..."
/>
```

### Cards / Containers

```tsx
<View
  style={[
    styles.card,
    {
      backgroundColor: colors.surface,
      borderColor: colors.surfaceVariant,
    },
  ]}
>
  <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Title</Text>
  <Text style={[styles.cardText, { color: colors.onSurfaceVariant }]}>
    Description
  </Text>
</View>
```

### StatusBar

```tsx
<StatusBar
  barStyle={
    colors.onBackground === '#181c1f' ? 'dark-content' : 'light-content'
  }
  backgroundColor={colors.background}
/>
```

## 5. FILES THAT ALREADY HAVE DARK MODE

✅ UserProfileSettingsScreen.tsx - Full implementation
✅ LoginScreen.tsx - Background support
✅ HomeDashboardScreen.tsx - Partial implementation
✅ ThemeContext.tsx - Theme management
✅ themeColors.ts - Color definitions
✅ useThemedColors.ts - Hook to access colors
✅ useThemedStyles.ts - Hook to create themed styles

## 6. SCREENS NEEDING UPDATE

The following screens should be updated to support dark mode:

- RegisterScreen.tsx
- ForgotPasswordScreen.tsx
- FamilyManagementScreen.tsx
- MedicineScreen.tsx
- AiChatScreen.tsx
- And other screens in their respective folders

## 7. TOGGLE THEME

Users can toggle theme in:
Settings Screen → Ứng dụng section → Theme toggle switch

The theme preference is saved to AsyncStorage and persists across app restarts.

## 8. HOW IT WORKS

1. **ThemeProvider** wraps the entire app (in App.tsx)
2. **useTheme()** hook provides theme state and toggleTheme function
3. **useThemedColors()** hook returns the appropriate color palette based on current theme
4. Each screen can call useThemedColors() and apply colors as needed
5. When user toggles theme, ThemeProvider updates and all components using useThemedColors automatically update

## 9. TESTING

To test dark mode:

1. Navigate to Profile → Thông tin tài khoản
2. Scroll to "Ứng dụng" section
3. Toggle the theme switch
4. All screens should update colors instantly

## 10. ADDING NEW SCREENS

For new screens:

1. Import `useThemedColors` from `'../../hooks/useThemedColors'`
2. Call `const colors = useThemedColors()` in your component
3. Replace hardcoded color values with `colors.*` tokens
4. Test by toggling theme in settings

Simple as that! ✨
