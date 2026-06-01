import { View, Text, Image } from 'react-native';
import React, { useState } from 'react';
import CustomButton from '@/components/CuttomButton';
import icons from '@/assets/icons';

import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import auth from '@react-native-firebase/auth';
import { showToast } from '@/utils/toastUtils';




const RegisterScreen = () => {



  


   const handleSignUpWithGoogle = async () => {
    try {

      GoogleSignin.configure({
        webClientId: '18599345259-4iu7giaj2cddhk5ihcbsb6kjf5ldkft9.apps.googleusercontent.com',
        offlineAccess: true,
      });

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response?.data;


        if (idToken) {
          const googleCredential = auth.GoogleAuthProvider.credential(idToken);
          await auth().signInWithCredential(googleCredential);
          showToast({message: "Signed in with Firebase successfully!"});
        } else {
          console.error('No idToken received');
        }
      } else {
        console.log('Sign in was cancelled by user');
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log('Sign in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play services not available or outdated');
            break;
          default:
            console.error('Google Sign-In error:', error);
        }
      } else {
        console.error('Error:', error);
      }
    }
  }


    // const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  return (
      <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>


      

      <CustomButton
        title="Log In with Google"
        className="mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleSignUpWithGoogle}
      />
    </View>
  );
};

export default RegisterScreen;
