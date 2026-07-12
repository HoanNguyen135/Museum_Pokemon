import {
  View,
  Text,
  Button,
  ScrollView,
  ImageBackground,
  Platform,
  Animated,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import InputField from '@/components/InputFields';
import icons from '@/assets/icons';
import CustomButton from '@/components/CuttomButton';
import images from '@/assets/images';
import {SafeAreaView} from 'react-native-safe-area-context';
import TextCustom from '@/components/TextCustom';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import OAuth from '@/components/OAuth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import checkUpdateCodePush from '@/utils/checkUpdateCodePush';

const LoginScreen = () => {
  const [form, setForm] = useState<{
    email: string;
    password: string;
  }>({
    email: '',
    password: '',
  });


  const {label,loading,handleCheckUpdate} = checkUpdateCodePush()

  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animated = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -20,
          duration: 1000,
          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    animated.start();

    return () => {
      animated.stop();
    };
  }, [translateY]);

  const onSignInPress = () => {
    GoogleSignin.signOut();
  };

  const handleGoRegister = () => {};

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ImageBackground
        style={{
          flex: 1,
        }}
        source={images.background}
        resizeMode="cover">
        <SafeAreaView style={{flex: 1}} edges={['left', 'right']}>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View
              style={{
                height: 50,
              }}
            />

            <Button
              disabled={loading}
              title={label}
              onPress={() => handleCheckUpdate()}
            />

            <View>
              <Animated.Image
                style={{
                  transform: [
                    {
                      translateY: translateY,
                    },
                  ],
                }}
                className="mt-10 w-[280px] h-[220px] self-center"
                resizeMode="contain"
                source={images.pokemon_header}
              />
            </View>

            <View>
              <View className="w-full items-center">
                <TextCustom className="text-4xl font-bold mt-8 text-white">
                  Welcome Back!
                </TextCustom>
                <TextCustom className="text-xl mt-3 ">
                  Login to your Poke Museum account
                </TextCustom>
              </View>

              <View className="p-5">
                <InputField
                  label="Email"
                  labelStyle={'text-primaryText'}
                  placeholder="Enter email"
                  icon={icons.email}
                  textContentType="emailAddress"
                  value={form.email}
                  onChangeText={value => setForm({...form, email: value})}
                />

                <InputField
                  label="Password"
                  placeholder="Enter password"
                  labelStyle={'text-primaryText'}
                  icon={icons.lock}
                  secureTextEntry={true}
                  textContentType="password"
                  value={form.password}
                  onChangeText={value => setForm({...form, password: value})}
                />

                <CustomButton
                  title="Sign In"
                  onPress={onSignInPress}
                  className="mt-6 bg-primaryButton"
                />

                <View className="w-full mt-10 flex-row  items-center justify-center">
                  <View className="h-[1px] flex-1 bg-primaryText" />

                  <View className="ml-2 mr-2 items-center justify-center self-center bg-transparent">
                    <TextCustom>Or countinue with</TextCustom>
                  </View>

                  <View className="h-[1px] flex-1 bg-primaryText" />
                </View>

                <OAuth />

                <Text
                  onPress={handleGoRegister}
                  className="text-lg text-center  text-primaryText mt-10">
                  Don't have an account?{' '}
                  <Text className="text-primaryButton">Sign Up</Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
