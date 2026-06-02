import { View, Text, Image, ScrollView, Modal, TouchableOpacity, Pressable, StatusBar, useWindowDimensions } from 'react-native';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import CustomButton from '@/components/CuttomButton';
import { logout } from '@/store/auth/authSlice';
import { selectUser } from '@/store/auth/authSelector';
import { COLORS } from '@/constants/colors';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const reduxUser = useSelector(selectUser);
  const firebaseUser = auth().currentUser;
  const { width: screenWidth } = useWindowDimensions();

  const [isAvatarModalVisible, setAvatarModalVisible] = useState(false);

  const avatarUrl = firebaseUser?.photoURL ?? reduxUser?.avatar_url ?? null;
  const displayName = firebaseUser?.displayName ?? reduxUser?.name ?? 'User';
  const email = firebaseUser?.email ?? reduxUser?.email ?? 'No email';
  const phoneNumber = firebaseUser?.phoneNumber ?? 'No phone number';

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

  const handleAvatarPress = () => {
    if (avatarUrl) {
      setAvatarModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primaryBackground }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="items-center pt-10 pb-8">
          {/* Avatar */}
          <TouchableOpacity
            className="relative mb-4"
            onPress={handleAvatarPress}
            activeOpacity={avatarUrl ? 0.8 : 1}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-28 h-28 rounded-full"
                style={{
                  borderWidth: 3,
                  borderColor: COLORS.primaryButton,
                }}
              />
            ) : (
              <View
                className="w-28 h-28 rounded-full items-center justify-center"
                style={{
                  backgroundColor: '#3b4165',
                  borderWidth: 3,
                  borderColor: COLORS.primaryButton,
                }}
              >
                <MaterialIcons name="person" size={48} color={COLORS.primaryText} />
              </View>
            )}

            {/* Edit avatar badge */}
            <View
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full items-center justify-center"
              style={{
                backgroundColor: COLORS.primaryButton,
                borderWidth: 3,
                borderColor: COLORS.primaryBackground,
              }}
            >
              <MaterialIcons name="photo-camera" size={16} color="#1a1f3d" />
            </View>
          </TouchableOpacity>

          {/* Name & Email headline */}
          <Text
            className="text-2xl font-bold mb-1"
            style={{ color: '#FFFFFF' }}
          >
            {displayName}
          </Text>
          <Text
            className="text-sm"
            style={{ color: COLORS.primaryText }}
          >
            {email}
          </Text>
        </View>

        {/* Info Cards Section */}
        <View className="px-5 gap-3">
          <Text
            className="text-sm font-semibold mb-1 ml-1"
            style={{ color: COLORS.primaryText }}
          >
            PERSONAL INFORMATION
          </Text>

          {/* Name Card */}
          <View
            className="flex-row items-center p-4 rounded-2xl"
            style={{ backgroundColor: '#2f3558' }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#3b4165' }}
            >
              <MaterialIcons name="badge" size={22} color={COLORS.primaryButton} />
            </View>
            <View className="flex-1">
              <Text className="text-xs mb-0.5" style={{ color: COLORS.primaryText }}>
                Full Name
              </Text>
              <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                {displayName}
              </Text>
            </View>
          </View>

          {/* Email Card */}
          <View
            className="flex-row items-center p-4 rounded-2xl"
            style={{ backgroundColor: '#2f3558' }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#3b4165' }}
            >
              <MaterialIcons name="email" size={22} color={COLORS.primaryButton} />
            </View>
            <View className="flex-1">
              <Text className="text-xs mb-0.5" style={{ color: COLORS.primaryText }}>
                Email
              </Text>
              <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                {email}
              </Text>
            </View>
          </View>

          {/* Phone Card */}
          <View
            className="flex-row items-center p-4 rounded-2xl"
            style={{ backgroundColor: '#2f3558' }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#3b4165' }}
            >
              <MaterialIcons name="phone" size={22} color={COLORS.primaryButton} />
            </View>
            <View className="flex-1">
              <Text className="text-xs mb-0.5" style={{ color: COLORS.primaryText }}>
                Phone Number
              </Text>
              <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                {phoneNumber}
              </Text>
            </View>
          </View>

          {/* Account type Card */}
          <View
            className="flex-row items-center p-4 rounded-2xl"
            style={{ backgroundColor: '#2f3558' }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#3b4165' }}
            >
              <MaterialIcons name="verified-user" size={22} color={COLORS.primaryButton} />
            </View>
            <View className="flex-1">
              <Text className="text-xs mb-0.5" style={{ color: COLORS.primaryText }}>
                Account Type
              </Text>
              <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                {firebaseUser?.providerData?.[0]?.providerId === 'google.com'
                  ? 'Google'
                  : 'Email'}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-5 mt-8">
          <CustomButton
            title="Logout"
            bgVariant="primaryButton"
            textVariant="primaryButton"
            onPress={handleLogout}
            IconLeft={() => (
              <MaterialIcons
                name="logout"
                size={20}
                color="#1a1f3d"
                style={{ marginRight: 8 }}
              />
            )}
          />
        </View>
      </ScrollView>

      {/* Avatar Modal */}
      <Modal
        visible={isAvatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.9)" />
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onPress={() => setAvatarModalVisible(false)}
        >
          {/* Close button */}
          <TouchableOpacity
            className="absolute top-12 right-5 z-10 w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            onPress={() => setAvatarModalVisible(false)}
          >
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Large Avatar */}
          {avatarUrl && (
            <Pressable onPress={e => e.stopPropagation()}>
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: screenWidth, height: screenWidth, borderRadius: 16 }}
                resizeMode="cover"
              />
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;
