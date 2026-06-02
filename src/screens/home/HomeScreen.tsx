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
import { getPokemonCards, PokemonCard } from '@/api/pokemonTcg';
import { CARD_SELECT_FIELDS } from '@/constants';

const HomeScreen = () => {


  const userData = useAppSelector(selectUser);


  const ListPokemonHot = () => {



    const [listCardsHot, setListCardsHot] = useState<PokemonCard[]>([]);


    const [params, setParams] = useState({
      keyword: '',
      page: 1,
      item_per_page: 10,
    })

    const [searchText, setSearchText] = useState<string>('');

    const [error, setError] = useState<string | null>(null);


    const [isLoadMore, setLoadMore] = useState<boolean>(false);

    useEffect(() => {
      if (params.page) {
        loadCards();
      }


    }, [params])



    async function loadCards() {
      setError(null);

      try {
        const query = params.keyword.trim() ? `name:${params.keyword.trim()}*` : undefined;
        const response = await getPokemonCards({
          apiKey: process.env.POKEMON_TCG_API_KEY,
          page: params.page,
          pageSize: params.item_per_page,
          query,
          orderBy: 'name',
          select: CARD_SELECT_FIELDS,
        });

        if (isLoadMore) {
          setListCardsHot([...listCardsHot, ...response.data]);

          setLoadMore(false)
        } else {
          setListCardsHot(response.data)
        }
      } catch (apiError) {
        setError(
          apiError instanceof Error
            ? apiError.message
            : 'Could not load Pokemon cards.',
        );
      } finally {

      }
    }


    const onLoadMore = useCallback(
      () => {
        if (listCardsHot.length < params.item_per_page * params.page) {
          return
        }


        setLoadMore(true);

        setParams({
          ...params,
          page: params.page + 1
        })
      },
      [params, isLoadMore],
    )


    return (
      <View style={{ height: CARD_HEIGHT + 24 }}>
        <FlashList
          data={listCardsHot}
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
            )
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
    )
  }


  return (
    <SafeViewMain>
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


      {/* list pokemon hot */}
      <Animated.View
        entering={FadeInDown.delay(150).duration(500).springify()}
        className='mt-8'
      >
        <View className="px-5 flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="w-1 h-5 bg-yellow-400 rounded-full mr-2" />
            <TextCustom className="text-white font-extrabold text-lg">
              Hot Cards
            </TextCustom>
            <View className="ml-2 bg-red-500/20 px-2 py-0.5 rounded-full flex-row items-center">
              <MaterialIcons name="local-fire-department" size={12} color="#EF4444" />
              <Text className="text-red-400 text-[10px] font-bold ml-0.5">TRENDING</Text>
            </View>
          </View>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-yellow-400 text-xs font-semibold mr-1">See all</Text>
            <MaterialIcons name="chevron-right" size={16} color="#FFCB05" />
          </TouchableOpacity>
        </View>
        <ListPokemonHot />
      </Animated.View>
    </SafeViewMain>

  );
};

export default HomeScreen;
