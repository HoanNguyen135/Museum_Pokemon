import { WEB_CLIENT_ID } from "@/constants";
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import auth from '@react-native-firebase/auth';

export const handleSignUpOrSignUpWithGoogle = async (isRegister = true) => {
    try {

        GoogleSignin.configure({
            webClientId: WEB_CLIENT_ID,
            offlineAccess: true,
        });

        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();

        if (isSuccessResponse(response)) {
            const { idToken } = response?.data;


            if (idToken) {
                const googleCredential = auth.GoogleAuthProvider.credential(idToken);
                const userCredential = await auth().signInWithCredential(googleCredential);

                const isNewUser = userCredential.additionalUserInfo?.isNewUser ?? false;

                if (isRegister && !isNewUser) {
                    await auth().signOut();
                    await GoogleSignin.signOut();

                    return {
                        status: false,
                        message: 'Account already exists. Please sign in instead.'
                    }
                }

                return {
                    status: true,
                    data: response?.data,
                    isNewUser,
                    message: isNewUser ? 'Account created' : 'Signed in successfully'
                }
            } else {
                console.error('No idToken received');

                return {
                    status: false,
                    message: 'No idToken received'
                }
            }
        } else {
            console.log('Sign in was cancelled by user')

            return {
                status: false,
                message: 'Sign in was cancelled by user'
            }
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