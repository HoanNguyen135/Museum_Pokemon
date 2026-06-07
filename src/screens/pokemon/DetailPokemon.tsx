import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import { getPokemonCardById, PokemonCard } from '@/api/pokemonTcg';
import LoadingScreen from '@/components/LoadingScreen';
import { PokemonCardAnimation } from '@/components/PokemonCardAnimation';
import SafeViewMain from '@/components/SafeViewMain';
import TextCustom from '@/components/TextCustom';

type DetailPokemonProps = {
  navigation: {
    goBack: () => void;
  };
  route: {
    params?: {
      data?: PokemonCard;
    };
  };
};

type PriceRow = {
  label: string;
  value: string;
};

const DetailPokemon = ({ navigation, route }: DetailPokemonProps) => {
  const routeCard = route.params?.data;
  const [dataDetailCard, setDataDetailCard] = useState<PokemonCard | null>(null);
  const [loading, setLoading] = useState(Boolean(routeCard?.id));
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function getDetailPokemon() {
      if (!routeCard?.id) {
        setLoading(false);
        setDetailError('Pokemon card data is missing.');
        return;
      }

      setLoading(true);
      setDetailError(null);

      try {
        const cardDetail = await getPokemonCardById({
          apiKey: process.env.POKEMON_TCG_API_KEY,
          id: routeCard.id,
        });

        if (isMounted) {
          setDataDetailCard(cardDetail);
        }
      } catch (apiError) {
        if (isMounted) {
          setDetailError(
            apiError instanceof Error
              ? apiError.message
              : 'Could not load Pokemon card detail.',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    getDetailPokemon();

    return () => {
      isMounted = false;
    };
  }, [routeCard?.id]);

  const card = dataDetailCard ?? routeCard;

  const tcgplayerPrices = useMemo(() => getTcgplayerPriceRows(card), [card]);
  const cardmarketPrices = useMemo(() => getCardmarketPriceRows(card), [card]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!card) {
    return (
      <SafeViewMain>
        <Header name="Pokemon Detail" onBack={navigation.goBack} />
        <View style={styles.centerState}>
          <TextCustom className="text-white text-base text-center">
            Pokemon card data is missing.
          </TextCustom>
        </View>
      </SafeViewMain>
    );
  }

  return (
    <SafeViewMain>
      <Header name={card.name} onBack={navigation.goBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <PokemonCardAnimation data={card} />
        </View>


        <View className='h-[20px]'/>

        {detailError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Showing saved card data. {detailError}
            </Text>
          </View>
        ) : null}

        <Section title="Card Profile">
          <View style={styles.infoGrid}>
            <InfoPill label="HP" value={card.hp} />
            <InfoPill label="Type" value={card.types?.join(', ')} />
            <InfoPill
              label="Stage"
              value={[card.supertype, ...(card.subtypes ?? [])]
                .filter(Boolean)
                .join(', ')}
            />
            <InfoPill label="Number" value={formatNumber(card)} />
            <InfoPill label="Rarity" value={card.rarity} />
            <InfoPill label="Set" value={card.set?.name} />
            <InfoPill label="Artist" value={card.artist} />
            <InfoPill label="Release" value={card.set?.releaseDate} />
          </View>
        </Section>

        <Section title="Market Links">
          <View style={styles.marketButtons}>
            <MarketButton
              disabled={!card.tcgplayer?.url}
              label="TCGPlayer"
              onPress={() => openUrl(card.tcgplayer?.url)}
            />
            <MarketButton
              disabled={!card.cardmarket?.url}
              label="Cardmarket"
              onPress={() => openUrl(card.cardmarket?.url)}
            />
          </View>
        </Section>

        <PricePanel
          prices={tcgplayerPrices}
          title="TCGPlayer Prices"
          updatedAt={card.tcgplayer?.updatedAt}
        />

        <PricePanel
          prices={cardmarketPrices}
          title="Cardmarket Prices"
          updatedAt={card.cardmarket?.updatedAt}
        />

        <Section title="Attacks">
          {card.attacks?.length ? (
            card.attacks.map(attack => (
              <View key={attack.name} style={styles.attackBlock}>
                <View style={styles.attackHeader}>
                  <Text style={styles.attackName}>{attack.name}</Text>
                  <Text style={styles.attackDamage}>{attack.damage || '-'}</Text>
                </View>
                <Text style={styles.attackCost}>
                  Cost: {attack.cost?.join(', ') ?? '-'}
                </Text>
                {attack.text ? (
                  <Text style={styles.attackText}>{attack.text}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No attack data available.</Text>
          )}
        </Section>

        {card.rules?.length ? (
          <Section title="Rules">
            {card.rules.map(rule => (
              <Text key={rule} style={styles.ruleText}>
                {rule}
              </Text>
            ))}
          </Section>
        ) : null}

        <Section title="Battle Info">
          <View style={styles.infoGrid}>
            <InfoPill label="Weakness" value={formatBattleValues(card.weaknesses)} />
            <InfoPill
              label="Resistance"
              value={formatBattleValues(card.resistances)}
            />
            <InfoPill label="Retreat" value={card.retreatCost?.join(', ')} />
            <InfoPill label="Legalities" value={formatLegalities(card.legalities)} />
          </View>
        </Section>
      </ScrollView>
    </SafeViewMain>
  );
};

function Header({ name, onBack }: { name: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.iconButton}>
        <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
      </Pressable>
      <View style={styles.headerTitleWrap}>
        <TextCustom className="text-white font-bold text-lg" numberOfLines={1}>
          {name}
        </TextCustom>
        <Text style={styles.headerSubtitle}>Pokemon Card Detail</Text>
      </View>
    </View>
  );
}

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoPill({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

function MarketButton({
  disabled,
  label,
  onPress,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.marketButton, disabled && styles.marketButtonDisabled]}
    >
      <Text
        style={[
          styles.marketButtonText,
          disabled && styles.marketButtonTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PricePanel({
  prices,
  title,
  updatedAt,
}: {
  prices: PriceRow[];
  title: string;
  updatedAt?: string;
}) {
  return (
    <Section title={title}>
      {updatedAt ? <Text style={styles.updatedText}>Updated {updatedAt}</Text> : null}
      {prices.length ? (
        prices.map(price => (
          <View key={price.label} style={styles.priceRow}>
            <Text style={styles.priceLabel}>{price.label}</Text>
            <Text style={styles.priceValue}>{price.value}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No price data available.</Text>
      )}
    </Section>
  );
}

function getTcgplayerPriceRows(card?: PokemonCard | null): PriceRow[] {
  const prices = card?.tcgplayer?.prices;

  if (!prices) {
    return [];
  }

  const values = Object.values(prices).flatMap(priceGroup =>
    compactNumbers([priceGroup.low, priceGroup.market ?? priceGroup.mid, priceGroup.high]),
  );

  return getPriceSummaryRows(values, 'USD');
}

function getCardmarketPriceRows(card?: PokemonCard | null): PriceRow[] {
  const prices = card?.cardmarket?.prices;

  if (!prices) {
    return [];
  }

  const values = compactNumbers([
    prices.lowPrice,
    prices.averageSellPrice,
    prices.trendPrice,
  ]);

  return getPriceSummaryRows(values, 'EUR');
}

function compactNumbers(values: Array<number | undefined>) {
  return values.filter((value): value is number => typeof value === 'number');
}

function getPriceSummaryRows(
  values: number[],
  currency: 'EUR' | 'USD',
): PriceRow[] {
  if (!values.length) {
    return [];
  }

  const low = Math.min(...values);
  const high = Math.max(...values);
  const average = values.reduce((total, value) => total + value, 0) / values.length;

  return [
    { label: 'Lowest price', value: formatCurrency(low, currency) },
    { label: 'Average price', value: formatCurrency(average, currency) },
    { label: 'Highest price', value: formatCurrency(high, currency) },
  ];
}

function formatCurrency(value: number, currency: 'EUR' | 'USD') {
  const symbol = currency === 'USD' ? '$' : '€';
  return `${symbol}${value.toFixed(2)}`;
}

function formatNumber(card: PokemonCard) {
  if (!card.number) {
    return undefined;
  }

  return card.set?.printedTotal
    ? `#${card.number}/${card.set.printedTotal}`
    : `#${card.number}`;
}

function formatBattleValues(values?: Array<{ type: string; value: string }>) {
  if (!values?.length) {
    return undefined;
  }

  return values.map(value => `${value.type} ${value.value}`).join(', ');
}

function formatLegalities(legalities?: Record<string, string>) {
  if (!legalities) {
    return undefined;
  }

  return Object.entries(legalities)
    .map(([format, value]) => `${format}: ${value}`)
    .join(', ');
}

function openUrl(url?: string) {
  if (url) {
    Linking.openURL(url);
  }
}

const styles = StyleSheet.create({
  attackBlock: {
    backgroundColor: '#151A2D',
    borderColor: '#2E3657',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    padding: 12,
  },
  attackCost: {
    color: '#AAB3D3',
    fontSize: 12,
    marginBottom: 6,
  },
  attackDamage: {
    color: '#FFCB05',
    fontSize: 15,
    fontWeight: '900',
  },
  attackHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  attackName: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    paddingRight: 12,
  },
  attackText: {
    color: '#D5DAEF',
    fontSize: 13,
    lineHeight: 19,
  },
  centerState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    padding: 20,
    paddingBottom: 34,
  },
  emptyText: {
    color: '#AAB3D3',
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: '#451A1A',
    borderColor: '#EF4444',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
  },
  errorText: {
    color: '#FECACA',
    fontSize: 13,
    lineHeight: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 18,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#1F2438',
    borderColor: '#37415F',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoLabel: {
    color: '#8B95B7',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoPill: {
    backgroundColor: '#151A2D',
    borderColor: '#2E3657',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 58,
    paddingHorizontal: 10,
    paddingVertical: 9,
    width: '47%',
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  marketButton: {
    alignItems: 'center',
    backgroundColor: '#FFCB05',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  marketButtonDisabled: {
    backgroundColor: '#2E3657',
  },
  marketButtonText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
  marketButtonTextDisabled: {
    color: '#8B95B7',
  },
  marketButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  priceLabel: {
    color: '#AAB3D3',
    flex: 1,
    fontSize: 13,
    textTransform: 'capitalize',
  },
  priceRow: {
    alignItems: 'center',
    backgroundColor: '#151A2D',
    borderColor: '#2E3657',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  priceValue: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: '900',
  },
  ruleText: {
    backgroundColor: '#2A2414',
    borderColor: '#F59E0B',
    borderRadius: 8,
    borderWidth: 1,
    color: '#FDE68A',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    padding: 10,
  },
  section: {
    backgroundColor: '#1F2438',
    borderColor: '#37415F',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 11,
  },
  updatedText: {
    color: '#8B95B7',
    fontSize: 11,
    marginBottom: 4,
  },
});

export default DetailPokemon;
