import { Text, TextProps } from "react-native";

interface TextCustomProps extends TextProps {
  className?: string;
}

const TextCustom = ({ className, style, children, ...props }: TextCustomProps) => {
  return (
    <Text
      className={`text-primaryText font-JakartaSemiBold text-xl ${className ?? ""}`}
      style={[style]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default TextCustom;
