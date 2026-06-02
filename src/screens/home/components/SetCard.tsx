import { View, Text, Dimensions, Pressable } from 'react-native';
import React from 'react';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { PokemonSet } from '@/api/pokemonTcg';
import ProgressiveImage from '@/components/ProgressiveImage';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SCREEN_WIDTH = Dimensions.get('screen').width;
export const SET_CARD_WIDTH = SCREEN_WIDTH * 0.45;
export const SET_LOGO_HEIGHT = SET_CARD_WIDTH * 0.56;
export const SET_CARD_HEIGHT = SET_LOGO_HEIGHT + 70;

type Props = {
  data: PokemonSet;
  index?: number;
  onPress?: (set: PokemonSet) => void;
};

const SERIES_COLORS: Record<string, string> = {
  Base: '#A8A878',
  Jungle: '#78C850',
  Fossil: '#7038F8',
  'Black & White': '#444444',
  XY: '#EC4899',
  'Sun & Moon': '#F59E0B',
  'Sword & Shield': '#60A5FA',
  'Scarlet & Violet': '#F472B6',
  EX: '#A78BFA',
  'HeartGold & SoulSilver': '#FBBF24',
  Platinum: '#9CA3AF',
  'Diamond & Pearl': '#34D399',
  Ruby: '#EF4444',
  Sapphire: '#3B82F6',
  'Nintendo Black Star Promos': '#FFCB05',
};

const SetCard = ({ data, index = 0, onPress }: Props) => {
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: -elevation.value }],
  }));

  const seriesColor = data.series ? (SERIES_COLORS[data.series] ?? '#7038F8') : '#7038F8';

  const releaseYear = data.releaseDate
    ? new Date(data.releaseDate).getFullYear()
    : null;

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 14, stiffness: 220 });
    elevation.value = withTiming(4, { duration: 180 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
    elevation.value = withTiming(0, { duration: 220 });
  };

  return (
    <View style={{ width: SET_CARD_WIDTH, height: SET_CARD_HEIGHT }}>
      <Animated.View
        entering={FadeInDown.delay(index * 70)
          .duration(380)
          .springify()
          .damping(16)}
      >
        <Animated.View
          style={[
            {
              shadowColor: seriesColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.45,
              shadowRadius: 12,
              elevation: 10,
            },
            animatedStyle,
          ]}
        >
          <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => onPress?.(data)}
            style={{
              backgroundColor: '#1f2438',
              borderWidth: 1,
              borderColor: `${seriesColor}55`,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {/* Logo area with gradient-like background */}
            <View
              style={{
                width: SET_CARD_WIDTH,
                height: SET_LOGO_HEIGHT,
                backgroundColor: `${seriesColor}22`,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {data.images?.logo ? (
                <ProgressiveImage
                  style={{
                    width: SET_CARD_WIDTH * 0.85,
                    height: SET_LOGO_HEIGHT * 0.7,
                  }}
                  source={{ uri: data.images.logo }}
                  resizeMode="contain"
                />
              ) : (
                <View className="items-center justify-center">
                  <MaterialIcons name="collections-bookmark" size={48} color={`${seriesColor}88`} />
                </View>
              )}

              {/* Series badge */}
              {data.series && (
                <View
                  className="absolute top-2 right-2 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${seriesColor}CC` }}
                >
                  <Text className="text-white font-bold text-[8px] uppercase tracking-wide">
                    {data.series}
                  </Text>
                </View>
              )}

              {/* Card count badge */}
              {data.printedTotal && (
                <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-full">
                  <Text className="text-white font-bold text-[9px]">
                    {data.total ?? data.printedTotal} cards
                  </Text>
                </View>
              )}
            </View>

            {/* Info section */}
            <View className="px-3 py-2.5">
              <Text
                numberOfLines={2}
                className="text-white font-bold text-[13px]"
              >
                {data.name}
              </Text>

              <View className="flex-row items-center justify-between mt-1.5">
                <View className="flex-row items-center">
                  {data.ptcgoCode && (
                    <View className="bg-gray-700 px-1.5 py-0.5 rounded mr-2">
                      <Text className="text-gray-300 text-[9px] font-bold">
                        {data.ptcgoCode}
                      </Text>
                    </View>
                  )}
                  {releaseYear && (
                    <View className="flex-row items-center">
                      <MaterialIcons name="calendar-today" size={10} color="#9CA3AF" />
                      <Text className="text-gray-400 text-[10px] ml-1">
                        {releaseYear}
                      </Text>
                    </View>
                  )}
                </View>
                {data.legalities && Object.keys(data.legalities).length > 0 && (
                  <View className="flex-row items-center">
                    <View
                      className="w-1.5 h-1.5 rounded-full mr-1"
                      style={{ backgroundColor: '#34D399' }}
                    />
                    <Text className="text-green-400 text-[9px] font-medium">
                      {Object.keys(data.legalities).length} formats
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </AnimatedPressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default SetCard;
