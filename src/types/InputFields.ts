import { StyleProp, TextInputProps, TextStyle, ViewStyle, ImageStyle } from "react-native";

export interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  className?: string;
}