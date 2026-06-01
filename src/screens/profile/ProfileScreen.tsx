import { View, Text } from 'react-native';
import React from 'react';
import { useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import CustomButton from '@/components/CuttomButton';
import { logout } from '@/store/auth/authSlice';

const ProfileScreen = () => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      if (await GoogleSignin.getCurrentUser()) {
        await GoogleSignin.signOut();
      }
      if (auth().currentUser) {
        await auth().signOut();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 p-5 justify-between">
        <Text>ProfileScreen</Text>

        <CustomButton
          title="Logout"
          bgVariant="danger"
          onPress={handleLogout}
          className="mb-5"
        />
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
