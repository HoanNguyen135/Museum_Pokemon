import { StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../utils/navigationUtils';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AppTabs from './tabs/AppTabs';
import SplashScreen from 'react-native-splash-screen';
import messaging from '@react-native-firebase/messaging';

const AppNavigationContainer = () => {
  const linking = {
    prefixes: ['https://example.com', 'example://'],
  };

  const routeNameRef = useRef<string | undefined>(undefined);

  const onLayoutView = () => {
    SplashScreen.hide();
  };

  useEffect(() => {
    messaging().onMessage(async remoteMessage => {
      console.log(remoteMessage);
    });

    const unsubscribe = messaging().setBackgroundMessageHandler(
      async message => {
        console.log('Message handled in the background', message);
      },
    );

    const unsubscribeNotification = messaging().onNotificationOpenedApp(
      message => {
        if (message) {
          console.log(unsubscribeNotification);
        }
      },
    );

    return unsubscribe;
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
        <SafeAreaView
          edges={['top']}
          style={styles.navigationLayout}
          onLayout={onLayoutView}
        >
          <AppTabs />
        </SafeAreaView>
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
};

const AppNavigator = () => {
  return (
    <GestureHandlerRootView style={styles.navigationLayout}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <StatusBar
            animated
            translucent={false}
            backgroundColor="#FFFFFF"
            barStyle="dark-content"
          />
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
