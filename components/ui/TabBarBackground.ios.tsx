import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
<<<<<<< HEAD
=======
import { useSafeAreaInsets } from 'react-native-safe-area-context';
>>>>>>> 90c8a52cb5a20bb1448955e8eda572e60dff39e8

export default function BlurTabBarBackground() {
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
<<<<<<< HEAD
  return useBottomTabBarHeight();
=======
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
>>>>>>> 90c8a52cb5a20bb1448955e8eda572e60dff39e8
}
