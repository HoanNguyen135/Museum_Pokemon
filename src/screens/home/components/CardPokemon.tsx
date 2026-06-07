import { View, Text, Dimensions, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { PokemonCard } from '@/api/pokemonTcg';
import ProgressiveImage from '@/components/ProgressiveImage';
import { navigate } from '@/utils/navigationUtils';
import SCREEN_NAME from '@/utils/screenName';
import { useScaleAnimation } from '@/utils/useScaleAnimation';
import Colors from '@/constants/colors';

const TYPE_COLORS: Record<string, string> = {
  Fire: Colors.typeFire,
  Water: Colors.typeWater,
  Grass: Colors.typeGrass,
  Lightning: Colors.typeLightning,
  Psychic: Colors.typePsychic,
  Fighting: Colors.typeFighting,
  Darkness: Colors.typeDarkness,
  Metal: Colors.typeMetal,
  Fairy: Colors.typeFairy,
  Dragon: Colors.typeDragon,
  Colorless: Colors.typeColorless,
};

const TYPE_ICONS = {
  Fire: 'local-fire-department',
  Water: 'water-drop',
  Grass: 'grass',
  Lightning: 'bolt',
  Psychic: 'psychology',
  Fighting: 'sports-martial-arts',
  Darkness: 'dark-mode',
  Metal: 'hardware',
  Fairy: 'auto-awesome',
  Dragon: 'rocket-launch',
  Colorless: 'circle',
} as const;

const RARITY_COLORS: Record<string, string> = {
  Common: Colors.rarityCommon,
  Uncommon: Colors.rarityUncommon,
  Rare: Colors.rarityRare,
  'Rare Holo': Colors.rarityRareHolo,
  'Rare Ultra': Colors.rarityRareUltra,
  'Rare Holo GX': Colors.warning,
  'Rare Holo EX': Colors.warning,
  'Rare Secret': Colors.rarityRareSecret,
  'Rare Rainbow': Colors.rarityRareRainbow,
  Promo: Colors.rarityPromo,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SCREEN_WIDTH = Dimensions.get('screen').width;
export const CARD_WIDTH = SCREEN_WIDTH * 0.4;
export const IMAGE_HEIGHT = CARD_WIDTH * 1.35;
export const CARD_HEIGHT = IMAGE_HEIGHT + 56;

// Reusable shadow offset — avoids inline object creation on every render
const SHADOW_OFFSET = { width: 0, height: 6 };

// Shared entry animation config
export const CARD_ENTRY_ANIMATION = (index: number) =>
  FadeInDown.delay(index * 70).duration(380).springify().damping(16);

type Props = {
  data: PokemonCard;
  index?: number;
  onPress?: (card: PokemonCard) => void;
};

const CardPokemon = ({ data, index = 0, onPress }: Props) => {
  const { handlers, animatedStyle } = useScaleAnimation();

  const marketPrice = useMemo(() => {
    const prices = data.tcgplayer?.prices;
    if (!prices) return null;
    const firstVariant = Object.values(prices)[0];
    return firstVariant?.market ?? firstVariant?.mid ?? firstVariant?.low ?? null;
  }, [data.tcgplayer]);

  const primaryType = data.types?.[0];
  const glowColor = primaryType ? (TYPE_COLORS[primaryType] ?? Colors.typeDragon) : Colors.typeDragon;
  const rarityColor = (data.rarity && RARITY_COLORS[data.rarity]) ?? Colors.rarityCommon;

  const handlePress = () => {
    onPress?.(data);
    navigate(SCREEN_NAME.DETAIL_POKEMON, { data });
  };

  return (
    <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
      <Animated.View entering={CARD_ENTRY_ANIMATION(index)}>
        <Animated.View
          style={[
            {
              shadowColor: glowColor,
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
            onPress={handlePress}
            style={{
              backgroundColor: Colors.cardBackground,
              borderWidth: 1,
              borderColor: `${glowColor}55`,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <View style={{ position: 'relative' }}>
              <ProgressiveImage
                style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}
                source={{ uri: data.images?.large ?? data.images?.small }}
                thumbnailSource={
                  data.images?.small ? { uri: data.images.small } : undefined
                }
                resizeMode="cover"
              />

              {data.hp && (
                <View className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded-full flex-row items-center">
                  <Text className="text-red-400 font-bold text-[9px] mr-1">HP</Text>
                  <Text className="text-white font-bold text-[11px]">{data.hp}</Text>
                </View>
              )}

              {data.rarity && (
                <View
                  className="absolute top-2 right-2 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${rarityColor}E6` }}
                >
                  <Text className="text-white font-bold text-[8px] uppercase tracking-wide">
                    {data.rarity.replace('Rare ', '')}
                  </Text>
                </View>
              )}

              {marketPrice !== null && (
                <View className="absolute bottom-2 right-2 bg-yellow-400 px-2 py-0.5 rounded-md flex-row items-center">
                  <Text className="text-black font-extrabold text-[10px]">
                    ${marketPrice.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            <View className="px-2.5 py-2">
              <Text
                numberOfLines={1}
                className="text-white font-bold text-[13px]"
              >
                {data.name}
              </Text>

              <View className="flex-row items-center justify-between mt-1.5">
                <View className="flex-row flex-1">
                  {data.types?.map(type => (
                    <View
                      key={type}
                      className="flex-row items-center px-1.5 py-0.5 rounded-full mr-1"
                      style={{
                        backgroundColor: `${TYPE_COLORS[type] ?? '#4B5563'}33`,
                        borderWidth: 1,
                        borderColor: TYPE_COLORS[type] ?? '#4B5563',
                      }}
                    >
                      <MaterialIcons
                        name={TYPE_ICONS[type as keyof typeof TYPE_ICONS] ?? 'help-outline'}
                        size={8}
                        color={TYPE_COLORS[type] ?? Colors.textMuted}
                      />
                      <Text
                        className="text-[8px] font-semibold ml-0.5"
                        style={{ color: TYPE_COLORS[type] ?? Colors.textMuted }}
                      >
                        {type}
                      </Text>
                    </View>
                  ))}
                </View>
                {data.number && data.set?.printedTotal && (
                  <Text className="text-gray-400 text-[9px] font-medium">
                    #{data.number}/{data.set.printedTotal}
                  </Text>
                )}
              </View>
            </View>
          </AnimatedPressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default CardPokemon;
