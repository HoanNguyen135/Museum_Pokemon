import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useAppSelector } from '@/hook';
import { selectUser } from '@/store/auth/authSelector';
import TextCustom from '@/components/TextCustom';
import SafeViewMain from '@/components/SafeViewMain';
import CardPokemon, { CARD_HEIGHT, CARD_WIDTH } from './components/CardPokemon';
import SetCard, { SET_CARD_HEIGHT, SET_CARD_WIDTH } from './components/SetCard';
import HorizontalCardList from './components/HorizontalCardList';
import { getPokemonCards, getPokemonSets, PokemonCard, PokemonSet } from '@/api/pokemonTcg';
import { CARD_SELECT_FIELDS } from '@/constants';
import { usePaginatedFetch } from '@/utils/usePaginatedFetch';
import { navigate } from '@/utils/navigationUtils';
import SCREEN_NAME from '@/utils/screenName';
import Colors from '@/constants/colors';

// ─── Section header ────────────────────────────────────────────────────
type SectionHeaderProps = {
  label: string;
  badge: string;
  badgeIcon: string;
  accentColor: string;
  onSeeAll: () => void;
};

const SectionHeader = ({ label, badge, badgeIcon, accentColor, onSeeAll }: SectionHeaderProps) => (
  <View className="px-5 flex-row items-center justify-between mb-2">
    <View className="flex-row items-center">
      <View className="w-1 h-5 rounded-full mr-2" style={{ backgroundColor: accentColor }} />
      <TextCustom className="text-white font-extrabold text-lg">{label}</TextCustom>
      <View
        className="ml-2 px-2 py-0.5 rounded-full flex-row items-center"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <MaterialIcons name={badgeIcon as any} size={12} color={accentColor} />
        <Text className="text-[10px] font-bold ml-0.5" style={{ color: accentColor }}>
          {badge}
        </Text>
      </View>
    </View>
    <TouchableOpacity className="flex-row items-center" onPress={onSeeAll}>
      <Text className="text-xs font-semibold mr-1" style={{ color: accentColor }}>
        See all
      </Text>
      <MaterialIcons name="chevron-right" size={16} color={accentColor} />
    </TouchableOpacity>
  </View>
);

// ─── Most Valuable Cards fetcher ────────────────────────────────────────
const valuableCardsFetcher = (params: { page: number; pageSize: number; query?: string }) => {
  const queryParts: string[] = ['tcgplayer.prices.*:*'];
  if (params.query) {
    queryParts.push(`name:"${params.query}"*`);
  }
  return getPokemonCards({
    apiKey: process.env.POKEMON_TCG_API_KEY,
    page: params.page,
    pageSize: params.pageSize,
    orderBy: '-tcgplayer.prices.holofoil.mid',
    select: CARD_SELECT_FIELDS,
  });
};

// ─── Latest Sets fetcher ────────────────────────────────────────────────
const latestSetsFetcher = (params: { page: number; pageSize: number; query?: string }) =>
  getPokemonSets({
    apiKey: process.env.POKEMON_TCG_API_KEY,
    page: params.page,
    pageSize: params.pageSize,
    query: params.query ? `name:"${params.query}"*` : undefined,
    orderBy: '-releaseDate',
  });

// ─── HomeScreen ─────────────────────────────────────────────────────────
const HomeScreen = () => {
  const userData = useAppSelector(selectUser);

  // Most Valuable Cards
  const valuableCards = usePaginatedFetch(valuableCardsFetcher, { pageSize: 10 });

  // Latest Sets
  const latestSets = usePaginatedFetch(latestSetsFetcher, { pageSize: 10 });

  return (
    <SafeViewMain>
      {/* Header Profile */}
      <View className="p-6 flex-row justify-between items-center">
        <View className="flex-row">
          <Image
            className="w-[50px] h-[50px] rounded-full border border-cyan-50"
            source={{ uri: userData?.avatar_url }}
          />
          <View className="self-center">
            <TextCustom className="ml-5 text-white font-bold">{userData?.name}</TextCustom>
            <TextCustom className="ml-5 text-sm">Level 01</TextCustom>
          </View>
        </View>

        <TouchableOpacity className="border-white border rounded-full p-[2px]">
          <MaterialIcons name="token" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Section: Most Valuable Cards */}
      <Animated.View
        entering={FadeInDown.delay(150).duration(500).springify()}
        className="mt-4"
      >
        <SectionHeader
          label="Most Valuable"
          badge="HIGH VALUE"
          badgeIcon="monetization-on"
          accentColor={Colors.accentYellow}
          onSeeAll={() => navigate(SCREEN_NAME.FULL_LIST, { mode: 'MostValuable', title: 'Most Valuable Cards' })}
        />
        <HorizontalCardList
          data={valuableCards.data}
          itemWidth={CARD_WIDTH}
          itemHeight={CARD_HEIGHT}
          keyExtractor={(item: PokemonCard) => item.id}
          renderItem={(item, index) => <CardPokemon data={item} index={index} />}
          isLoadMore={valuableCards.isLoadMore}
          error={valuableCards.error}
          onLoadMore={valuableCards.loadMore}
        />
      </Animated.View>

      {/* Section: Latest Sets */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(500).springify()}
        className="mt-6"
      >
        <SectionHeader
          label="Latest Sets"
          badge="NEW"
          badgeIcon="new-releases"
          accentColor={Colors.accentGreen}
          onSeeAll={() => navigate(SCREEN_NAME.FULL_LIST, { mode: 'LatestSets', title: 'Latest Sets' })}
        />
        <HorizontalCardList
          data={latestSets.data}
          itemWidth={SET_CARD_WIDTH}
          itemHeight={SET_CARD_HEIGHT}
          keyExtractor={(item: PokemonSet) => item.id}
          renderItem={(item, index) => (
            <SetCard
              data={item}
              index={index}
              onPress={set => navigate(SCREEN_NAME.SET_CARDS, { data: set })}
            />
          )}
          isLoadMore={latestSets.isLoadMore}
          error={latestSets.error}
          onLoadMore={latestSets.loadMore}
        />
      </Animated.View>
    </SafeViewMain>
  );
};

export default HomeScreen;
