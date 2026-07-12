import React, {useState} from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  ImageSourcePropType,
  ImageResizeMode,
  StyleProp,
  ViewStyle,
  ImageStyle,
  StyleSheet,
} from 'react-native';

type ProgressiveImageProps = {
  source: ImageSourcePropType;
  thumbnailSource?: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
  placeholderColor?: string;
  showLoader?: boolean;
  loaderColor?: string;
};

const ProgressiveImage = ({
  source,
  thumbnailSource,
  style,
  containerStyle,
  resizeMode = 'cover',
  placeholderColor = '#2a3050',
  showLoader = true,
  loaderColor = '#ffffff',
}: ProgressiveImageProps) => {
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <View
      style={[
        {backgroundColor: placeholderColor, overflow: 'hidden'},
        style,
        containerStyle,
      ]}>
      {thumbnailSource && (
        <Image
          source={thumbnailSource}
          style={[StyleSheet.absoluteFill, {opacity: thumbnailLoaded ? 1 : 0}]}
          resizeMode={resizeMode}
          onLoad={() => setThumbnailLoaded(true)}
          blurRadius={2}
        />
      )}

      <Image
        source={source}
        style={[StyleSheet.absoluteFill, {opacity: imageLoaded ? 1 : 0}]}
        resizeMode={resizeMode}
        onLoad={() => setImageLoaded(true)}
      />

      {showLoader && !imageLoaded && !thumbnailLoaded && (
        <View style={[StyleSheet.absoluteFill, styles.loader]}>
          <ActivityIndicator size="small" color={loaderColor} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressiveImage;
