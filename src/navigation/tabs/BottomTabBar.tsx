import React, { PropsWithChildren } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView, BlurViewProps } from '@react-native-community/blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
// import { useHaptic, useScaleAnimation, useTabBarHeight } from '@/utils';

import { TabParamList } from './AppTabs';
import { useTabBarHeight } from '@/utils/common';
import { useScaleAnimation } from '@/utils/useScaleAnimation';
import SCREEN_NAME from '@/utils/screenName';
// import { useAppSelector } from '@/hooks';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const tabExitSpringConfig = { damping: 20, stiffness: 360, mass: 1 };
const tabEnterSpringConfig = { damping: 30, stiffness: 360, mass: 1 };

type TabBarIconsProps = {
  focused: boolean;
  route: RouteProp<TabParamList, keyof TabParamList>;
};

const TAB_ICON_SIZE = 29;
const TAB_ICON_COLOR_UNFOCUSED  = '#1F2937';
const TAB_ICON_COLOR_FOCUSED  = '#9CA3AF';

const TabBarIcons = ({ focused, route }: TabBarIconsProps) => {
  const color = focused ? TAB_ICON_COLOR_FOCUSED : TAB_ICON_COLOR_UNFOCUSED;
  switch (route.name) {
    case SCREEN_NAME.HOME_SCREEN:
      return <MaterialIcons name="home" size={TAB_ICON_SIZE} color={color} />;
    case SCREEN_NAME.PROFILE_SCREEN:
      return (
        <MaterialIcons
          name={focused ? 'person' : 'person-outline'}
          size={TAB_ICON_SIZE}
          color={color}
        />
      );
  }
};

type TabBarBackgroundProps = BlurViewProps & PropsWithChildren;

const TabBarBackground = (props: TabBarBackgroundProps) => {
  const { children, style, blurAmount, blurType } = props;

  return Platform.OS === 'ios' ? (
    <AnimatedBlurView {...{ blurAmount, blurType }} style={[style]}>
      {children}
    </AnimatedBlurView>
  ) : (
    <Animated.View style={[style]}>{children}</Animated.View>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TabItem = (props: any) => {
  const { handlers, animatedStyle } = useScaleAnimation();

  const { onPress, onLongPress, isFocused, options, route } = props;

  // Memoize hitSlop to prevent new object reference on every render
  const hitSlop = React.useMemo(
    () => ({ top: 2, left: 10, right: 10, bottom: 10 }),
    [],
  );

  // Use stable object reference for accessibilityState when not focused
  const accessibilityState = React.useMemo(
    () => (isFocused ? { selected: true } : {}),
    [isFocused],
  );

  return (
    <Animated.View style={[styles.tabItem, animatedStyle]}>
      <Pressable
        hitSlop={hitSlop}
        {...handlers}
        accessibilityRole="button"
        accessibilityState={accessibilityState}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <TabBarIcons focused={isFocused} route={route} />
      </Pressable>
    </Animated.View>
  );
};

export const BottomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const tabBarHeight = useTabBarHeight();

  // Memoize press handlers using useCallback
  const createPressHandler = React.useCallback(
    (
      route: { key: string; name: string; params?: object },
      isFocused: boolean,
    ) => {
      return () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
      };
    },
    [navigation],
  );

  // Memoize long press handler
  const createLongPressHandler = React.useCallback(
    (route: { key: string; name: string; params?: object }) => {
      return () => {
        navigation.emit({
          type: 'tabLongPress',
          target: route.key,
        });
      };
    },
    [navigation],
  );

  return (
    <TabBarBackground
      blurAmount={25}
      blurType="light"
      style={Platform.select({
        ios: [styles.tabBarBase, styles.tabBarIOS, { height: tabBarHeight }],
        android: [
          styles.tabBarBase,
          styles.tabBarAndroid,
          { height: tabBarHeight },
          {
            
          }
        ],
      })}
    >
      <Animated.View style={styles.topBorder} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        return (
          <TabItem
            key={route.key}
            options={options}
            onPress={createPressHandler(route, isFocused)}
            onLongPress={createLongPressHandler(route)}
            route={route}
            isFocused={isFocused}
          />
        );
      })}
    </TabBarBackground>
  );
};

const styles = StyleSheet.create({
  tabBarBase: {
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    bottom: 0,
    paddingLeft: 72,
    paddingRight: 71,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#313961'
  },
  tabBarIOS: {
    paddingTop: 11,
    paddingBottom: 32,
     backgroundColor: '#313961'
  },
  tabBarAndroid: {
    paddingTop: 11,
    paddingBottom: 11,
    backgroundColor: '#313961'
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.047)',
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
});
