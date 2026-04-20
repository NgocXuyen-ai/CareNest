import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemedColors } from '../../hooks/useThemedColors';

interface WithThemedBackgroundProps {
  children: React.ReactNode;
}

/**
 * HOC wrapper để áp dụng themed background color cho bất kỳ screen nào
 * Usage:
 * <WithThemedBackground>
 *   <YourScreen />
 * </WithThemedBackground>
 */
export function WithThemedBackground({ children }: WithThemedBackgroundProps) {
  const colors = useThemedColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
