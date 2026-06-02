import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { FlashList } from '@shopify/flash-list';

import { getPokemonCards, getPokemonSets, PokemonCard, PokemonSet } from '@/api/pokemonTcg';
import CardPokemon from '@/screens/home/components/CardPokemon';
import SetCard from '@/screens/home/components/SetCard';
import LoadingScreen from '@/components/LoadingScreen';
import SafeViewMain from '@/components/SafeViewMain';
import { CARD_SELECT_FIELDS } from '@/constants';
import { navigate } from '@/utils/navigationUtils';
import SCREEN_NAME from '@/utils/screenName';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const NUM_COLUMNS = 2;
const GRID_PADDING = 12;
const ITEM_SPACING = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - ITEM_SPACING) / NUM_COLUMNS;
const PAGE_SIZE = 20;

export type FullListMode = 'MostValuable' | 'LatestSets';

type FullListScreenProps = {
  navigation: {
    goBack: () => void;
  };
  route: {
    params?: {
      mode?: FullListMode;
      title?: string;
    };
  };
};

const FullListScreen = ({ navigation, route }: FullListScreenProps) => {
  const mode = route.params?.mode ?? 'MostValuable';
  const title = route.params?.title ?? (mode === 'MostValuable' ? 'Most Valuable Cards' : 'Latest Sets');

  const isCardMode = mode === 'MostValuable';

  // ─── State ──────────────────────────────────────────────────────────
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [sets, setSets] = useState<PokemonSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadMore, setLoadMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<TextInput>(null);

  // ─── Data fetching ──────────────────────────────────────────────────
  const fetchData = useCallback(
    async (pageNum: number, query?: string) => {
      try {
        if (isCardMode) {
          const response = await getPokemonCards({
            apiKey: process.env.POKEMON_TCG_API_KEY,
            page: pageNum,
            pageSize: PAGE_SIZE,
            orderBy: '-tcgplayer.prices.holofoil.mid',
            select: CARD_SELECT_FIELDS,
          });

          if (pageNum === 1) {
            setCards(response.data);
          } else {
            setCards(prev => [...prev, ...response.data]);
          }

          // Check if we've reached the end
          const loadedCount = pageNum * PAGE_SIZE;
          setHasMore(loadedCount < response.totalCount);
        } else {
          const queryParts: string[] = [];
          if (query?.trim()) {
            queryParts.push(`name:"${query.trim()}"*`);
          }

          const q = queryParts.join(' AND ') || undefined;

          const response = await getPokemonSets({
            apiKey: process.env.POKEMON_TCG_API_KEY,
            page: pageNum,
            pageSize: PAGE_SIZE,
            query: q,
            orderBy: '-releaseDate',
          });

          if (pageNum === 1) {
            setSets(response.data);
          } else {
            setSets(prev => [...prev, ...response.data]);
          }

          const loadedCount = pageNum * PAGE_SIZE;
          setHasMore(loadedCount < response.totalCount);
        }

        setError(null);
      } catch (apiError) {
        setError(
          apiError instanceof Error ? apiError.message : 'Could not load data.',
        );
      }
    },
    [isCardMode],
  );

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchData(1).finally(() => setLoading(false));
  }, []);

  // ─── Search with debounce ───────────────────────────────────────────
  const onSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        setPage(1);
        setCards([]);
        setSets([]);
        setLoading(true);
        fetchData(1, text).finally(() => setLoading(false));
      }, 500);
    },
    [fetchData],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // ─── Load more ──────────────────────────────────────────────────────
  const onLoadMore = useCallback(() => {
    if (isLoadMore || !hasMore || loading) return;

    const nextPage = page + 1;
    setLoadMore(true);
    setPage(nextPage);
    fetchData(nextPage, searchText).finally(() => setLoadMore(false));
  }, [page, isLoadMore, hasMore, loading, searchText, fetchData]);

  // ─── Press handlers ─────────────────────────────────────────────────
  const onCardPress = useCallback((card: PokemonCard) => {
    navigate(SCREEN_NAME.DETAIL_POKEMON, { data: card });
  }, []);

  const onSetPress = useCallback((set: PokemonSet) => {
    navigate(SCREEN_NAME.SET_CARDS, { data: set });
  }, []);

  // ─── Render data ────────────────────────────────────────────────────
  const data = isCardMode ? cards : sets;
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
          className="w-9 h-9 rounded-full bg-[#1F2438] border border-[#37415F] items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
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
          <MaterialIcons name="search" size={20} color="#6B7280" />
          <TextInput
            ref={searchInputRef}
            className="flex-1 ml-2 text-white text-sm"
            placeholder={
              isCardMode ? 'Search cards by name...' : 'Search sets by name...'
            }
            placeholderTextColor="#6B7280"
            value={searchText}
            onChangeText={onSearchChange}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <Pressable
              onPress={() => onSearchChange('')}
              className="w-6 h-6 rounded-full bg-gray-600 items-center justify-center"
            >
              <MaterialIcons name="close" size={14} color="#FFFFFF" />
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
        keyExtractor={(item: { id: string }) => `full-${item.id}`}
        contentContainerStyle={{
          paddingHorizontal: GRID_PADDING,
          paddingBottom: 24,
        }}
        numColumns={NUM_COLUMNS}
        onEndReachedThreshold={0.5}
        onEndReached={onLoadMore}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View
            style={{
              width: ITEM_WIDTH,
              marginRight: index % NUM_COLUMNS === 0 ? ITEM_SPACING : 0,
              marginBottom: ITEM_SPACING,
              alignItems: 'center',
            }}
          >
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
              <Text className="text-gray-500 text-sm mt-3">No results found</Text>
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
              <ActivityIndicator color="#FFCB05" />
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
