import React, {useEffect} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import ProgressiveImage from './ProgressiveImage';
import {PokemonCard} from '@/api/pokemonTcg';

const SPARKLES = [
  {left: 24, top: 44, size: 5},
  {left: 118, top: 62, size: 3},
  {left: 184, top: 88, size: 5},
  {left: 54, top: 132, size: 4},
  {left: 154, top: 156, size: 3},
  {left: 206, top: 198, size: 4},
  {left: 34, top: 232, size: 3},
  {left: 132, top: 262, size: 5},
  {left: 178, top: 298, size: 3},
] as const;

const SPIN_RANGE = [0, 0.25, 0.5, 0.75, 1];
const SCALE_VALUES = [1, 1.025, 0.98, 1.025, 1];
const GLINT_RANGE = [0, 0.22, 0.5, 0.78, 1];
const GLINT_OPACITY_VALUES = [0.32, 0.9, 0.22, 0.86, 0.32];
const RAINBOW_RANGE = [0, 0.18, 0.34, 0.5, 0.66, 0.82, 1];
const RAINBOW_OPACITY_VALUES = [0.22, 0.48, 0.3, 0.42, 0.28, 0.5, 0.22];
const SHIMMER_RANGE = [0, 1];
const SHIMMER_TRANSLATE_X_VALUES = [-190, 190];
const SPARKLE_PULSE_RANGE = [0, 0.35, 0.7, 1];
const EVEN_SPARKLE_OPACITY_VALUES = [0.15, 1, 0.25, 0.8];
const ODD_SPARKLE_OPACITY_VALUES = [0.75, 0.2, 1, 0.1];
const AUTO_SPIN_DURATION = 7000;

type SparkleProps = {
  index: number;
  pulse: SharedValue<number>;
  sparkle: (typeof SPARKLES)[number];
};

function HolographicSparkle({index, pulse, sparkle}: SparkleProps) {
  const sparkleStyle = useAnimatedStyle(() => {
    const isEven = index % 2 === 0;

    return {
      height: sparkle.size,
      left: sparkle.left,
      opacity: interpolate(
        pulse.value,
        SPARKLE_PULSE_RANGE,
        isEven ? EVEN_SPARKLE_OPACITY_VALUES : ODD_SPARKLE_OPACITY_VALUES,
        Extrapolation.CLAMP,
      ),
      top: sparkle.top,
      transform: [
        {
          translateY: interpolate(
            pulse.value,
            [0, 1],
            [0, isEven ? -8 : 8],
            Extrapolation.CLAMP,
          ),
        },
        {rotateZ: '45deg'},
      ],
      width: sparkle.size,
    };
  }, [index, pulse, sparkle]);

  return (
    <Animated.View style={[styles.sparkle, sparkleStyle]}>
      <View style={styles.sparkleCrossHorizontal} />
      <View style={styles.sparkleCrossVertical} />
    </Animated.View>
  );
}

export function PokemonCardAnimation({data}: any) {
  const spin = useSharedValue(0);
  const autoRotate = useSharedValue(0);
  const dragRotate = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const sparklePulse = useSharedValue(0);

  const rotationDeg = useDerivedValue(
    () => autoRotate.value + dragRotate.value,
  );

  const cardScale = useDerivedValue(() =>
    interpolate(spin.value, SPIN_RANGE, SCALE_VALUES, Extrapolation.CLAMP),
  );
  const glintOpacity = useDerivedValue(() =>
    interpolate(
      spin.value,
      GLINT_RANGE,
      GLINT_OPACITY_VALUES,
      Extrapolation.CLAMP,
    ),
  );
  const rainbowOpacity = useDerivedValue(() =>
    interpolate(
      spin.value,
      RAINBOW_RANGE,
      RAINBOW_OPACITY_VALUES,
      Extrapolation.CLAMP,
    ),
  );
  const shimmerTranslateX = useDerivedValue(() =>
    interpolate(
      shimmer.value,
      SHIMMER_RANGE,
      SHIMMER_TRANSLATE_X_VALUES,
      Extrapolation.CLAMP,
    ),
  );

  const startAutoSpin = () => {
    'worklet';
    autoRotate.value = withRepeat(
      withTiming(autoRotate.value + 360, {
        duration: AUTO_SPIN_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  };

  useEffect(() => {
    startAutoSpin();
    // Nhịp ánh sáng holographic chạy theo easing (giống bản gốc)
    spin.value = withRepeat(
      withSequence(
        withTiming(0.45, {
          duration: 1850,
          easing: Easing.inOut(Easing.cubic),
        }),
        withTiming(1, {
          duration: 2350,
          easing: Easing.inOut(Easing.cubic),
        }),
      ),
      -1,
      false,
    );
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 2100,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      false,
    );
    sparklePulse.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(spin);
      cancelAnimation(autoRotate);
      cancelAnimation(shimmer);
      cancelAnimation(sparklePulse);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pan = Gesture.Pan()
    .onBegin(() => {
      cancelAnimation(autoRotate);
    })
    .onChange(event => {
      dragRotate.value += event.changeX * 0.6;
    })
    .onFinalize(() => {
      startAutoSpin();
    });

  const auraStyle = useAnimatedStyle(() => {
    return {
      opacity: glintOpacity.value,
      transform: [{scale: cardScale.value}],
    };
  }, [cardScale, glintOpacity]);

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {perspective: 900},
        {rotateY: `${rotationDeg.value}deg`},
        {scale: cardScale.value},
      ],
    };
  }, [cardScale, rotationDeg]);

  const rainbowStyle = useAnimatedStyle(() => {
    return {
      opacity: rainbowOpacity.value,
    };
  }, [rainbowOpacity]);

  const colorWashStyle = useAnimatedStyle(() => {
    return {
      opacity: glintOpacity.value,
    };
  }, [glintOpacity]);

  const beamStyle = useAnimatedStyle(() => {
    return {
      opacity: glintOpacity.value,
      transform: [{translateX: shimmerTranslateX.value}, {rotateZ: '18deg'}],
    };
  }, [glintOpacity, shimmerTranslateX]);

  const thinBeamStyle = useAnimatedStyle(() => {
    return {
      opacity: glintOpacity.value,
      transform: [{translateX: shimmerTranslateX.value}, {rotateZ: '-22deg'}],
    };
  }, [glintOpacity, shimmerTranslateX]);

  const glintStyle = useAnimatedStyle(() => {
    return {
      opacity: glintOpacity.value,
      transform: [{translateX: shimmerTranslateX.value}],
    };
  }, [glintOpacity, shimmerTranslateX]);

  return (
    <View style={styles.holoStage}>
      {/* <Animated.View style={[styles.holoAura, auraStyle]} /> */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.holoCard, cardStyle]}>
          {!!data.images ? (
            <ProgressiveImage
              source={{uri: data.images?.large ?? data.images?.small}}
              thumbnailSource={
                data.images?.small ? {uri: data.images.small} : undefined
              }
              resizeMode="cover"
              style={styles.holoCard}
            />
          ) : (
            <View style={[styles.holoImage, styles.imagePlaceholder]} />
          )}
          <Animated.View style={[styles.holoRainbowBlue, rainbowStyle]} />
          <Animated.View style={[styles.holoRainbowPink, rainbowStyle]} />
          <Animated.View style={[styles.holoColorWash, colorWashStyle]} />
          <Animated.View style={[styles.holoBeam, beamStyle]} />
          <Animated.View style={[styles.holoBeamThin, thinBeamStyle]} />
          <Animated.View style={[styles.holoGlint, glintStyle]} />
          {SPARKLES.map((sparkle, index) => (
            <HolographicSparkle
              index={index}
              key={`${sparkle.left}-${sparkle.top}`}
              pulse={sparklePulse}
              sparkle={sparkle}
            />
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  holoStage: {
    alignSelf: 'center',
    alignItems: 'center',
    height: 320,
    justifyContent: 'center',
    width: 230,
  },
  holoAura: {
    backgroundColor: 'rgba(125, 211, 252, 0.22)',
    borderRadius: 140,
    height: 268,
    position: 'absolute',
    width: 190,
  },
  holoCard: {
    backgroundColor: '#e2e8f0',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 13,
    borderWidth: 1,
    height: 320,
    overflow: 'hidden',
    width: 230,
  },
  holoImage: {
    height: '100%',
    width: '100%',
  },
  imagePlaceholder: {
    borderColor: '#d1d5db',
    borderWidth: 1,
  },
  holoColorWash: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  holoRainbowBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.28)',
    borderRadius: 999,
    height: 240,
    left: -42,
    position: 'absolute',
    top: 22,
    transform: [{rotateZ: '18deg'}],
    width: 118,
  },
  holoRainbowPink: {
    backgroundColor: 'rgba(244, 114, 182, 0.24)',
    borderRadius: 999,
    height: 280,
    position: 'absolute',
    right: -54,
    top: -12,
    transform: [{rotateZ: '-16deg'}],
    width: 130,
  },
  holoBeam: {
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    height: 420,
    left: 72,
    position: 'absolute',
    top: -52,
    width: 42,
  },
  holoBeamThin: {
    backgroundColor: 'rgba(167, 243, 208, 0.42)',
    height: 420,
    left: 132,
    position: 'absolute',
    top: -54,
    width: 18,
  },
  holoGlint: {
    backgroundColor: 'rgba(250, 204, 21, 0.34)',
    borderRadius: 999,
    height: 180,
    left: -52,
    position: 'absolute',
    top: 20,
    width: 92,
  },
  sparkle: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    position: 'absolute',
  },
  sparkleCrossHorizontal: {
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    height: 1,
    left: -5,
    position: 'absolute',
    right: -5,
    top: '45%',
  },
  sparkleCrossVertical: {
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    bottom: -5,
    left: '45%',
    position: 'absolute',
    top: -5,
    width: 1,
  },
});
