import { View, Text } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SCREEN_NAME from '../../utils/screenName';
import HomeScreen from '../../screens/home/HomeScreen';
import AuthStack from '../stacks/AuthStack';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { BottomTabBar } from './BottomTabBar';
import { useAppDispatch, useAppSelector } from '@/hook';
import { selectUser } from '@/store/auth/authSelector';
import * as Sentry from '@sentry/react-native';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import { settingsActions } from '@/store/settings/settingsActions';

export type TabBarExcludedScreenParamList = {
  Tab: undefined;
};

export type TabParamList = {
  HomeScreen: undefined;
  ProfileScreen: undefined;
};

const Stack = createNativeStackNavigator<TabBarExcludedScreenParamList>();

const CustomTabBar = (props: BottomTabBarProps) => <BottomTabBar {...props} />;

const Tab = createBottomTabNavigator<TabParamList>();

const Tabs = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);

  const initSentry = useCallback(async () => {
    Sentry.setUser({
      id: user?.id,
      email: user?.email,
      account_id: user?.account_id,
      name: user?.name,
    });
  }, []);

  const checkVersionApp = () => {
    //call to server to get version app
  };

  useEffect(() => {
    dispatch(settingsActions.saveDeviceDetails());
    initSentry();
  }, []);

  useEffect(() => {
    checkVersionApp();
  }, []);

  return (
    <Tab.Navigator
      tabBar={CustomTabBar}
      initialRouteName={SCREEN_NAME.HOME_SCREEN}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name={SCREEN_NAME.HOME_SCREEN} component={HomeScreen} />
      <Tab.Screen name={SCREEN_NAME.PROFILE_SCREEN} component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppTabs = () => {


    const user = useAppSelector(selectUser);


  const isLoggedIn = !!user;

  if (isLoggedIn) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={SCREEN_NAME.TAB} component={Tabs} />
      </Stack.Navigator>
    );
  } else {
    return <AuthStack />;
  }
};

export default AppTabs;
