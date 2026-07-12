import React, {useCallback} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {MaterialIcons} from '@react-native-vector-icons/material-icons';
import {FlashList} from '@shopify/flash-list';

import {
  getPokemonCards,
  getPokemonSets,
  PokemonCard,
  PokemonSet,
} from '@/api/pokemonTcg';
import CardPokemon from '@/screens/home/components/CardPokemon';
import SetCard from '@/screens/home/components/SetCard';
import LoadingScreen from '@/components/LoadingScreen';
import SafeViewMain from '@/components/SafeViewMain';
import {CARD_SELECT_FIELDS} from '@/constants';
import {usePaginatedFetch} from '@/utils/usePaginatedFetch';
import {navigate} from '@/utils/navigationUtils';
import SCREEN_NAME from '@/utils/screenName';
import Colors from '@/constants/colors';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const NUM_COLUMNS = 2;
const GRID_PADDING = 12;
const ITEM_SPACING = 12;
const ITEM_WIDTH =
  (SCREEN_WIDTH - GRID_PADDING * 2 - ITEM_SPACING) / NUM_COLUMNS;
const PAGE_SIZE = 20;

export type FullListMode = 'MostValuable' | 'LatestSets';

type FullListScreenProps = {
  navigation: {goBack: () => void};
  route: {
    params?: {
      mode?: FullListMode;
      title?: string;
    };
  };
};

const FullListScreen = ({navigation, route}: FullListScreenProps) => {
  const mode = route.params?.mode ?? 'MostValuable';
  const title =
    route.params?.title ??
    (mode === 'MostValuable' ? 'Most Valuable Cards' : 'Latest Sets');

  const isCardMode = mode === 'MostValuable';

  // Fetcher — card mode now properly passes the search query
  const fetcher = useCallback(
    (params: {page: number; pageSize: number; query?: string}) => {
      if (isCardMode) {
        const queryParts: string[] = ['tcgplayer.prices.*:*'];
        if (params.query) {
          queryParts.push(`name:"${params.query}"*`);
        }
        return getPokemonCards({
          apiKey: process.env.POKEMON_TCG_API_KEY,
          page: params.page,
          pageSize: params.pageSize,
          query: queryParts.join(' AND '),
          orderBy: '-tcgplayer.prices.holofoil.mid',
          select: CARD_SELECT_FIELDS,
        });
      }
      return getPokemonSets({
        apiKey: process.env.POKEMON_TCG_API_KEY,
        page: params.page,
        pageSize: params.pageSize,
        query: params.query ? `name:"${params.query}"*` : undefined,
        orderBy: '-releaseDate',
      });
    },
    [isCardMode],
  );

  const {
    data,
    loading,
    error,
    isLoadMore,
    hasMore,
    searchText,
    setSearchText,
    loadMore,
  } = usePaginatedFetch<PokemonCard | PokemonSet>(fetcher as any, {
    pageSize: PAGE_SIZE,
  });

  const onCardPress = useCallback((card: PokemonCard) => {
    navigate(SCREEN_NAME.DETAIL_POKEMON, {data: card});
  }, []);

  const onSetPress = useCallback((set: PokemonSet) => {
    navigate(SCREEN_NAME.SET_CARDS, {data: set});
  }, []);

  const dataCount = data.length;

  if (loading && dataCount === 0) {
    return <LoadingScreen />;
  }

  return (
    <SafeViewMain>
      {/* Header */}
      <View className="flex-row items-center px-[18px] py-3">
        <Pressable
          onPress={navigation.goBack}
          className="w-9 h-9 rounded-full bg-[#1F2438] border border-[#37415F] items-center justify-center">
          <MaterialIcons
            name="arrow-back"
            size={22}
            color={Colors.textPrimary}
          />
        </Pressable>
        <View className="flex-1 ml-3">
          <Text className="text-white font-bold text-lg" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-gray-400 text-[11px] mt-0.5">
            {isCardMode ? `${dataCount} cards` : `${dataCount} sets`}
          </Text>
        </View>
      </View>

      {/* Search bar */}
      <View className="mx-4 mb-3">
        <View className="flex-row items-center bg-[#1F2438] border border-[#37415F] rounded-xl px-3 h-11">
          <MaterialIcons
            name="search"
            size={20}
            color={Colors.textPlaceholder}
          />
          <TextInput
            className="flex-1 ml-2 text-white text-sm"
            placeholder={
              isCardMode ? 'Search cards by name...' : 'Search sets by name...'
            }
            placeholderTextColor={Colors.textPlaceholder}
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <Pressable
              onPress={() => setSearchText('')}
              className="w-6 h-6 rounded-full bg-gray-600 items-center justify-center">
              <MaterialIcons
                name="close"
                size={14}
                color={Colors.textPrimary}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Error banner */}
      {error ? (
        <View className="mx-4 mb-2 bg-red-900/30 border border-red-500 rounded-lg px-4 py-3">
          <Text className="text-red-300 text-sm">{error}</Text>
        </View>
      ) : null}

      {/* Grid list */}
      <FlashList
        data={data}
        keyExtractor={(item: {id: string}) => `full-${item.id}`}
        contentContainerStyle={{
          paddingHorizontal: GRID_PADDING,
          paddingBottom: 24,
        }}
        numColumns={NUM_COLUMNS}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => (
          <View
            style={{
              width: ITEM_WIDTH,
              marginRight: index % NUM_COLUMNS === 0 ? ITEM_SPACING : 0,
              marginBottom: ITEM_SPACING,
              alignItems: 'center',
            }}>
            {isCardMode ? (
              <CardPokemon
                data={item as PokemonCard}
                index={index}
                onPress={onCardPress}
              />
            ) : (
              <SetCard
                data={item as PokemonSet}
                index={index}
                onPress={onSetPress}
              />
            )}
          </View>
        )}
        ListEmptyComponent={() =>
          !error && !loading ? (
            <View className="items-center justify-center py-20">
              <MaterialIcons name="search-off" size={48} color="#4B5563" />
              <Text className="text-gray-500 text-sm mt-3">
                No results found
              </Text>
              {searchText.length > 0 && (
                <Text className="text-gray-600 text-xs mt-1">
                  Try a different search term
                </Text>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={() =>
          isLoadMore ? (
            <View className="py-6 items-center">
              <ActivityIndicator color={Colors.accentYellow} />
            </View>
          ) : dataCount > 0 && !hasMore ? (
            <View className="py-6 items-center">
              <Text className="text-gray-500 text-xs">
                {isCardMode ? 'All cards loaded' : 'All sets loaded'}
              </Text>
            </View>
          ) : (
            <View className="h-6" />
          )
        }
      />
    </SafeViewMain>
  );
};

export default FullListScreen;
