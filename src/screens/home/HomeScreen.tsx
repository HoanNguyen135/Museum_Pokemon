import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '@/hook';
import { selectUser } from '@/store/auth/authSelector';
import TextCustom from '@/components/TextCustom';
import SafeViewMain from '@/components/SafeViewMain';
import { FlashList } from "@shopify/flash-list";
import CardPokemon, { CARD_HEIGHT, CARD_WIDTH } from './components/CardPokemon';
import SetCard, { SET_CARD_HEIGHT, SET_CARD_WIDTH } from './components/SetCard';
import { getPokemonCards, getPokemonSets, PokemonCard, PokemonSet } from '@/api/pokemonTcg';
import { CARD_SELECT_FIELDS } from '@/constants';
import { navigate } from '@/utils/navigationUtils';
import SCREEN_NAME from '@/utils/screenName';

const HomeScreen = () => {

  const userData = useAppSelector(selectUser);

  // ─── Most Valuable Cards (sorted by price) ───────────────────────────
  const ListMostValuable = () => {

    const [listCards, setListCards] = useState<PokemonCard[]>([]);
    const [params, setParams] = useState({
      page: 1,
      item_per_page: 10,
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoadMore, setLoadMore] = useState<boolean>(false);

    useEffect(() => {
      if (params.page) {
        loadCards();
      }
    }, [params]);

    async function loadCards() {
      setError(null);

      try {
        const response = await getPokemonCards({
          apiKey: process.env.POKEMON_TCG_API_KEY,
          page: params.page,
          pageSize: params.item_per_page,
          orderBy: '-tcgplayer.prices.holofoil.mid',
          select: CARD_SELECT_FIELDS,
        });

        if (isLoadMore) {
          setListCards([...listCards, ...response.data]);
          setLoadMore(false);
        } else {
          setListCards(response.data);
        }
      } catch (apiError) {
        setError(
          apiError instanceof Error
            ? apiError.message
            : 'Could not load valuable cards.',
        );
      }
    }

    const onLoadMore = useCallback(
      () => {
        if (listCards.length < params.item_per_page * params.page) {
          return;
        }
        setLoadMore(true);
        setParams({
          ...params,
          page: params.page + 1,
        });
      },
      [params, isLoadMore],
    );

    return (
      <View style={{ height: CARD_HEIGHT + 24 }}>
        <FlashList
          data={listCards}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            paddingLeft: 10,
            paddingVertical: 12,
          }}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          onEndReachedThreshold={0.5}
          onEndReached={onLoadMore}
          renderItem={({ item, index }) => {
            return (
              <View style={{ width: CARD_WIDTH + 16, paddingRight: 16 }}>
                <CardPokemon data={item} index={index} />
              </View>
            );
          }}
          ListHeaderComponent={() => <View className='w-[10px]' />}
          ListEmptyComponent={() =>
            !error ? (
              <View style={{ flexDirection: 'row', paddingLeft: 10 }}>
                {[0, 1, 2].map(i => (
                  <View
                    key={i}
                    style={{
                      width: CARD_WIDTH,
                      height: CARD_HEIGHT,
                      marginRight: 16,
                      backgroundColor: '#1f2438',
                      borderRadius: 16,
                      opacity: 0.5,
                    }}
                  />
                ))}
              </View>
            ) : null
          }
          ListFooterComponent={() =>
            isLoadMore ? (
              <View className="w-[60px] justify-center items-center">
                <ActivityIndicator color="#FFCB05" />
              </View>
            ) : (
              <View className='w-[20px]' />
            )
          }
        />
      </View>
    );
  };

  // ─── Latest Sets ─────────────────────────────────────────────────────
  const ListLatestSets = () => {

    const [listSets, setListSets] = useState<PokemonSet[]>([]);
    const [params, setParams] = useState({
      page: 1,
      item_per_page: 10,
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoadMore, setLoadMore] = useState<boolean>(false);

    useEffect(() => {
      if (params.page) {
        loadSets();
      }
    }, [params]);

    async function loadSets() {
      setError(null);

      try {
        const response = await getPokemonSets({
          apiKey: process.env.POKEMON_TCG_API_KEY,
          page: params.page,
          pageSize: params.item_per_page,
          orderBy: '-releaseDate',
        });

        if (isLoadMore) {
          setListSets([...listSets, ...response.data]);
          setLoadMore(false);
        } else {
          setListSets(response.data);
        }
      } catch (apiError) {
        setError(
          apiError instanceof Error
            ? apiError.message
            : 'Could not load sets.',
        );
      }
    }

    const onLoadMore = useCallback(
      () => {
        if (listSets.length < params.item_per_page * params.page) {
          return;
        }
        setLoadMore(true);
        setParams({
          ...params,
          page: params.page + 1,
        });
      },
      [params, isLoadMore],
    );

    return (
      <View style={{ height: SET_CARD_HEIGHT + 24 }}>
        <FlashList
          data={listSets}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            paddingLeft: 10,
            paddingVertical: 12,
          }}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          onEndReachedThreshold={0.5}
          onEndReached={onLoadMore}
          renderItem={({ item, index }) => {
            return (
              <View style={{ width: SET_CARD_WIDTH + 16, paddingRight: 16 }}>
                <SetCard
                  data={item}
                  index={index}
                  onPress={set => navigate(SCREEN_NAME.SET_CARDS, { data: set })}
                />
              </View>
            );
          }}
          ListHeaderComponent={() => <View className='w-[10px]' />}
          ListEmptyComponent={() =>
            !error ? (
              <View style={{ flexDirection: 'row', paddingLeft: 10 }}>
                {[0, 1, 2].map(i => (
                  <View
                    key={i}
                    style={{
                      width: SET_CARD_WIDTH,
                      height: SET_CARD_HEIGHT,
                      marginRight: 16,
                      backgroundColor: '#1f2438',
                      borderRadius: 16,
                      opacity: 0.5,
                    }}
                  />
                ))}
              </View>
            ) : null
          }
          ListFooterComponent={() =>
            isLoadMore ? (
              <View className="w-[60px] justify-center items-center">
                <ActivityIndicator color="#FFCB05" />
              </View>
            ) : (
              <View className='w-[20px]' />
            )
          }
        />
      </View>
    );
  };

  // ─── Main Render ─────────────────────────────────────────────────────
  return (
    <SafeViewMain>
      {/* Header Profile */}
      <View className='p-6 flex-row justify-between items-center'>
        <View className='flex-row'>
          <Image className=' w-[50px] h-[50px] rounded-full border border-cyan-50' source={{ uri: userData?.avatar_url }} />
          <View className='self-center'>
            <TextCustom className='ml-5 text-white font-bold'>{userData?.name}</TextCustom>
            <TextCustom className='ml-5 text-sm'>{'Level 01'}</TextCustom>
          </View>
        </View>

        <TouchableOpacity className='border-white border rounded-full p-[2px]'>
          <MaterialIcons
            name={'token'}
            size={28}
            color={'white'}
          />
        </TouchableOpacity>
      </View>

      {/* Section: Most Valuable Cards */}
      <Animated.View
        entering={FadeInDown.delay(150).duration(500).springify()}
        className='mt-4'
      >
        <View className="px-5 flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="w-1 h-5 bg-yellow-400 rounded-full mr-2" />
            <TextCustom className="text-white font-extrabold text-lg">
              Most Valuable
            </TextCustom>
            <View className="ml-2 bg-yellow-500/20 px-2 py-0.5 rounded-full flex-row items-center">
              <MaterialIcons name="monetization-on" size={12} color="#FBBF24" />
              <Text className="text-yellow-400 text-[10px] font-bold ml-0.5">HIGH VALUE</Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => navigate(SCREEN_NAME.FULL_LIST, { mode: 'MostValuable', title: 'Most Valuable Cards' })}
          >
            <Text className="text-yellow-400 text-xs font-semibold mr-1">See all</Text>
            <MaterialIcons name="chevron-right" size={16} color="#FFCB05" />
          </TouchableOpacity>
        </View>
        <ListMostValuable />
      </Animated.View>

      {/* Section: Latest Sets */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(500).springify()}
        className='mt-6'
      >
        <View className="px-5 flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="w-1 h-5 bg-green-400 rounded-full mr-2" />
            <TextCustom className="text-white font-extrabold text-lg">
              Latest Sets
            </TextCustom>
            <View className="ml-2 bg-green-500/20 px-2 py-0.5 rounded-full flex-row items-center">
              <MaterialIcons name="new-releases" size={12} color="#34D399" />
              <Text className="text-green-400 text-[10px] font-bold ml-0.5">NEW</Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => navigate(SCREEN_NAME.FULL_LIST, { mode: 'LatestSets', title: 'Latest Sets' })}
          >
            <Text className="text-green-400 text-xs font-semibold mr-1">See all</Text>
            <MaterialIcons name="chevron-right" size={16} color="#34D399" />
          </TouchableOpacity>
        </View>
        <ListLatestSets />
      </Animated.View>
    </SafeViewMain>
  );
};

export default HomeScreen;
