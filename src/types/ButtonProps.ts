import {TouchableOpacityProps} from 'react-native';

export interface ButtonCustomProps extends TouchableOpacityProps {
  title: string;
  bgVariant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'outline'
    | 'success'
    | 'primaryButton';
  textVariant?:
    | 'primary'
    | 'default'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'primaryButton';
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  className?: string;
}
