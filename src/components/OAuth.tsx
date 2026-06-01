import { Image, Text, View } from "react-native";
import CustomButton from "./CuttomButton";
import icons from "@/assets/icons";
import { showToast } from "@/utils/toastUtils";
import { handleSignUpOrSignUpWithGoogle } from "@/hooks/authGoogle";
import { useAppDispatch } from "@/hook";
import { User } from "@/types/User";
import { setDataUser } from "@/store/auth/authSlice";


const OAuth = () => {
  const dispatch = useAppDispatch();

  const handleGoogleSignIn = async () => {
    const data = await handleSignUpOrSignUpWithGoogle(false);

    if(data?.status == true){
      const googleUser = data?.data?.user;

      const user: User = {
        id: 0,
        account_id: 0,
        name: googleUser?.name ?? '',
        email: googleUser?.email ?? '',
        avatar_url: googleUser?.photo ?? '',
        thumbnail: googleUser?.photo ?? '',
        available_name: googleUser?.givenName ?? googleUser?.name ?? '',
        pubsub_token: '',
        identifier_hash: googleUser?.id ?? '',
        availability: 'online',
        type: 'google',
      };

      dispatch(setDataUser(user));
      showToast({ message: data?.message ?? 'Signed in successfully' });
    } else if (data?.message) {
      showToast({ message: data.message });
    }
  };

  return (
    <View>
      <View className="flex flex-row justify-center items-center gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>

      <CustomButton
        title="Log In with Google"
        className="w-full shadow-none bg-white"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default OAuth;