import { View, Text, Dimensions, Pressable } from 'react-native';
import React from 'react';
import Animated from 'react-native-reanimated';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { PokemonSet } from '@/api/pokemonTcg';
import ProgressiveImage from '@/components/ProgressiveImage';
import { useScaleAnimation } from '@/utils/useScaleAnimation';
import { CARD_ENTRY_ANIMATION } from './CardPokemon';
import Colors from '@/constants/colors';

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
  Fossil: Colors.typeDragon,
  'Black & White': '#444444',
  XY: '#EC4899',
  'Sun & Moon': Colors.warning,
  'Sword & Shield': Colors.accentBlue,
  'Scarlet & Violet': Colors.accentPink,
  EX: Colors.accentPurple,
  'HeartGold & SoulSilver': Colors.rarityPromo,
  Platinum: Colors.textMuted,
  'Diamond & Pearl': Colors.accentGreen,
  Ruby: Colors.error,
  Sapphire: '#3B82F6',
  'Nintendo Black Star Promos': Colors.accentYellow,
};

// Reusable shadow offset
const SHADOW_OFFSET = { width: 0, height: 6 };

const SetCard = ({ data, index = 0, onPress }: Props) => {
  const { handlers, animatedStyle } = useScaleAnimation();

  const seriesColor = data.series ? (SERIES_COLORS[data.series] ?? Colors.typeDragon) : Colors.typeDragon;

  const releaseYear = data.releaseDate
    ? new Date(data.releaseDate).getFullYear()
    : null;

  return (
    <View style={{ width: SET_CARD_WIDTH, height: SET_CARD_HEIGHT }}>
      <Animated.View entering={CARD_ENTRY_ANIMATION(index)}>
        <Animated.View
          style={[
            {
              shadowColor: seriesColor,
              shadowOffset: SHADOW_OFFSET,
              shadowOpacity: 0.45,
              shadowRadius: 12,
              elevation: 10,
            },
            animatedStyle,
          ]}
        >
          <AnimatedPressable
            onPressIn={handlers.onPressIn}
            onPressOut={handlers.onPressOut}
            onPress={() => onPress?.(data)}
            style={{
              backgroundColor: Colors.cardBackground,
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
                      <MaterialIcons name="calendar-today" size={10} color={Colors.textMuted} />
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
                      style={{ backgroundColor: Colors.accentGreen }}
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
