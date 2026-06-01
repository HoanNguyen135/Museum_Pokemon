import { View, Text } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SCREEN_NAME from '../../utils/screenName';
import LoginScreen from '../../screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';

export type AuthStackParamList = {
  LoginScreen: undefined;
  ResetPassword: undefined;
  ConfigureURL: undefined;
  MFAScreen: undefined;
  Tabs: undefined;
  RegisterScreen: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={SCREEN_NAME.LOGIN_SCREEN}
        component={LoginScreen}
      />

      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerBackVisible: true,
          headerShadowVisible: false,
          title: '',
        }}
        name={SCREEN_NAME.REGISTER_SCREEN}
        component={RegisterScreen}
      />

      {/* <Stack.Screen name="Tabs" component={Tabs} /> */}
      {/* <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerBackVisible: true,
          headerShadowVisible: false,
          title: '',
        }}
        name={SCREEN_NAME.LOGIN_SCREEN}
        component={LoginScreen}
      /> */}
    </Stack.Navigator>
  );
};

export default AuthStack;
