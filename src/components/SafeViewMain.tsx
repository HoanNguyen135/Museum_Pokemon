import {View, Text} from 'react-native';
import React, {ReactNode} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';

const SafeViewMain = ({children}: {children: ReactNode}) => {
  return (
    <View className="flex-1 bg-primaryBackground">
      <SafeAreaView className="flex-1">{children}</SafeAreaView>
    </View>
  );
};

export default SafeViewMain;
