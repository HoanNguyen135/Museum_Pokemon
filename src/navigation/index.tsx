import { StyleSheet, ActivityIndicator, StatusBar, ScrollView, View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../utils/navigationUtils';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AppTabs from './tabs/AppTabs';
import SplashScreen from 'react-native-splash-screen';
import messaging, { getMessaging, onMessage, setBackgroundMessageHandler, onNotificationOpenedApp } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

const AppNavigationContainer = () => {
  const linking = {
    prefixes: ['https://example.com', 'example://'],
  };

  const routeNameRef = useRef<string | undefined>(undefined);

  const onLayoutView = () => {
    SplashScreen.hide();
  };

     SplashScreen.hide();

  useEffect(() => {
    const app = getApp();
    const messagingInstance = getMessaging(app);

    const unsubscribeMessage = onMessage(messagingInstance, async remoteMessage => {
      console.log(remoteMessage);
    });

    setBackgroundMessageHandler(messagingInstance, async message => {
      console.log('Message handled in the background', message);
    });

    const unsubscribeNotification = onNotificationOpenedApp(messagingInstance, message => {
      if (message) {
        console.log('Notification opened app:', message);
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeNotification();
    };
  }, []);

  return (
    <NavigationContainer
      linking={linking}
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      fallback={<ActivityIndicator animating />}
    >
      <BottomSheetModalProvider>
        <View
          // edges={['top']}
          style={styles.navigationLayout}
          onLayout={onLayoutView}
        >
          <AppTabs />
        </View>
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
};

const AppNavigator = () => {
  return (
    <GestureHandlerRootView style={styles.navigationLayout}>
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <SafeAreaProvider>
           <AppNavigationContainer /> 
         </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  navigationLayout: {
    flex: 1,
  },
});
