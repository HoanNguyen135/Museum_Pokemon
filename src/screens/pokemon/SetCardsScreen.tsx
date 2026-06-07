import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { FlashList } from '@shopify/flash-list';

import { getPokemonCards, PokemonCard, PokemonSet } from '@/api/pokemonTcg';
import CardPokemon from '@/screens/home/components/CardPokemon';
import LoadingScreen from '@/components/LoadingScreen';
import SafeViewMain from '@/components/SafeViewMain';
import { CARD_SELECT_FIELDS } from '@/constants';
import { usePaginatedFetch } from '@/utils/usePaginatedFetch';
import { navigate } from '@/utils/navigationUtils';
import SCREEN_NAME from '@/utils/screenName';
import Colors from '@/constants/colors';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const NUM_COLUMNS = 2;
const GRID_PADDING = 12;
const ITEM_SPACING = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - ITEM_SPACING) / NUM_COLUMNS;
const PAGE_SIZE = 20;

type SetCardsScreenProps = {
  navigation: { goBack: () => void };
  route: {
    params?: {
      data?: PokemonSet;
    };
  };
};

const SetCardsScreen = ({ navigation, route }: SetCardsScreenProps) => {
  const setData = route.params?.data;

  const fetcher = useMemo(
    () =>
      async (params: { page: number; pageSize: number }) =>
        getPokemonCards({
          apiKey: process.env.POKEMON_TCG_API_KEY,
          page: params.page,
          pageSize: params.pageSize,
          query: `set.id:${setData?.id}`,
          orderBy: 'number',
          select: CARD_SELECT_FIELDS,
        }),
    [setData?.id],
  );

  const { data: cards, loading, error, isLoadMore, hasMore, loadMore } = usePaginatedFetch(
    fetcher,
    { pageSize: PAGE_SIZE },
  );

  const onCardPress = useCallback((card: PokemonCard) => {
    navigate(SCREEN_NAME.DETAIL_POKEMON, { data: card });
  }, []);

  if (!setData) {
    return (
      <SafeViewMain>
        <Header name="Set Cards" onBack={navigation.goBack} />
        <View className="flex-1 justify-center items-center px-6">
          <MaterialIcons name="error-outline" size={48} color={Colors.error} />
          <Text className="text-white text-base text-center mt-4">Set data is missing.</Text>
        </View>
      </SafeViewMain>
    );
  }

  if (loading && cards.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <SafeViewMain>
      <Header name={setData.name} onBack={navigation.goBack} />

      {/* Set info banner */}
      <View className="mx-4 mt-2 mb-1 bg-[#1F2438] rounded-xl border border-[#37415F] px-4 py-3 flex-row items-center">
        {setData.images?.symbol ? (
          <Image
            source={{ uri: setData.images.symbol }}
            className="w-10 h-10 rounded-lg"
            resizeMode="contain"
          />
        ) : (
          <View className="w-10 h-10 rounded-lg bg-[#151A2D] items-center justify-center">
            <MaterialIcons name="collections-bookmark" size={22} color={Colors.accentYellow} />
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text className="text-white font-bold text-sm">{setData.name}</Text>
          <View className="flex-row items-center mt-1">
            {setData.series && <Text className="text-gray-400 text-xs">{setData.series}</Text>}
            {setData.releaseDate && (
              <Text className="text-gray-500 text-xs ml-2">• {setData.releaseDate}</Text>
            )}
          </View>
        </View>
        {setData.printedTotal && (
          <View className="bg-[#151A2D] px-3 py-1.5 rounded-lg items-center">
            <Text className="text-yellow-400 font-extrabold text-base">{setData.printedTotal}</Text>
            <Text className="text-gray-500 text-[9px]">cards</Text>
          </View>
        )}
      </View>

      {error ? (
        <View className="mx-4 mt-2 bg-red-900/30 border border-red-500 rounded-lg px-4 py-3">
          <Text className="text-red-300 text-sm">{error}</Text>
        </View>
      ) : null}

      {/* Cards grid */}
      <FlashList
        data={cards}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          paddingHorizontal: GRID_PADDING,
          paddingTop: 8,
          paddingBottom: 24,
        }}
        numColumns={NUM_COLUMNS}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
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
            <CardPokemon data={item} index={index} onPress={onCardPress} />
          </View>
        )}
        ListEmptyComponent={() =>
          !error ? (
            <View className="items-center justify-center py-20">
              <MaterialIcons name="style" size={40} color="#4B5563" />
              <Text className="text-gray-500 text-sm mt-3">No cards found</Text>
            </View>
          ) : null
        }
        ListFooterComponent={() =>
          isLoadMore ? (
            <View className="py-6 items-center">
              <ActivityIndicator color={Colors.accentYellow} />
            </View>
          ) : cards.length > 0 && !hasMore ? (
            <View className="py-6 items-center">
              <Text className="text-gray-500 text-xs">All cards loaded</Text>
            </View>
          ) : (
            <View className="h-6" />
          )
        }
      />
    </SafeViewMain>
  );
};

function Header({ name, onBack }: { name: string; onBack: () => void }) {
  return (
    <View className="flex-row items-center px-[18px] py-3">
      <Pressable
        onPress={onBack}
        className="w-9 h-9 rounded-full bg-[#1F2438] border border-[#37415F] items-center justify-center"
      >
        <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
      </Pressable>
      <View className="flex-1 ml-3">
        <Text className="text-white font-bold text-lg" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-gray-400 text-[11px] mt-0.5">Pokemon Card Set</Text>
      </View>
    </View>
  );
}

export default SetCardsScreen;
