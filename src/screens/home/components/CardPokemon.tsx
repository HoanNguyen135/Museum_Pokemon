import { View, Text, Dimensions, Pressable } from 'react-native'
import React, { useMemo } from 'react'
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated'
import { PokemonCard } from '@/api/pokemonTcg'
import ProgressiveImage from '@/components/ProgressiveImage'

const TYPE_COLORS: Record<string, string> = {
    Fire: '#F08030',
    Water: '#6890F0',
    Grass: '#78C850',
    Lightning: '#F8D030',
    Psychic: '#A040A0',
    Fighting: '#C03028',
    Darkness: '#2F2F2F',
    Metal: '#A8A8B0',
    Fairy: '#EE99AC',
    Dragon: '#7038F8',
    Colorless: '#D6D6C2',
}

const RARITY_COLORS: Record<string, string> = {
    Common: '#9CA3AF',
    Uncommon: '#34D399',
    Rare: '#60A5FA',
    'Rare Holo': '#A78BFA',
    'Rare Ultra': '#F472B6',
    'Rare Holo GX': '#F59E0B',
    'Rare Holo EX': '#F59E0B',
    'Rare Secret': '#EF4444',
    'Rare Rainbow': '#EC4899',
    Promo: '#FBBF24',
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const SCREEN_WIDTH = Dimensions.get('screen').width
export const CARD_WIDTH = SCREEN_WIDTH * 0.4
export const IMAGE_HEIGHT = CARD_WIDTH * 1.35
export const CARD_HEIGHT = IMAGE_HEIGHT + 56

type Props = {
    data: PokemonCard
    index?: number
    onPress?: (card: PokemonCard) => void
}

const CardPokemon = ({ data, index = 0, onPress }: Props) => {
    const scale = useSharedValue(1)
    const elevation = useSharedValue(0)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { translateY: -elevation.value }],
    }))

    const marketPrice = useMemo(() => {
        const prices = data.tcgplayer?.prices
        if (!prices) return null
        const firstVariant = Object.values(prices)[0]
        return firstVariant?.market ?? firstVariant?.mid ?? firstVariant?.low ?? null
    }, [data.tcgplayer])

    const primaryType = data.types?.[0]
    const glowColor = primaryType ? TYPE_COLORS[primaryType] ?? '#7038F8' : '#7038F8'
    const rarityColor = (data.rarity && RARITY_COLORS[data.rarity]) ?? '#9CA3AF'

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 14, stiffness: 220 })
        elevation.value = withTiming(4, { duration: 180 })
    }

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 12, stiffness: 180 })
        elevation.value = withTiming(0, { duration: 220 })
    }

    return (
        <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
            <Animated.View
                // entering={FadeInDown.delay(index * 70)
                //     .duration(380)
                //     .springify()
                //     .damping(16)}
            >
                <Animated.View
                    style={[
                        {
                            shadowColor: glowColor,
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
                            {data.types?.slice(0, 3).map(type => (
                                <View
                                    key={type}
                                    className="px-1.5 py-0.5 rounded-full mr-1"
                                    style={{
                                        backgroundColor: `${TYPE_COLORS[type] ?? '#4B5563'}33`,
                                        borderWidth: 1,
                                        borderColor: TYPE_COLORS[type] ?? '#4B5563',
                                    }}
                                >
                                    <Text
                                        className="text-[8px] font-semibold"
                                        style={{ color: TYPE_COLORS[type] ?? '#9CA3AF' }}
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
    )
}

export default CardPokemon
