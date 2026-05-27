import { View, Text } from 'react-native';
import React from 'react';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

const HomeScreen = () => {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text>HomeScreen</Text>
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <MaterialIcons name="home" size={28} color="#4F8EF7" />
        <MaterialIcons name="favorite" size={28} color="#E91E63" />
        <MaterialIcons name="settings" size={28} color="#555" />
      </View>
    </View>
  );
};

export default HomeScreen;
