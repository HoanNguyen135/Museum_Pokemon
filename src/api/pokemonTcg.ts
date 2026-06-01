const BASE_URL = 'https://api.pokemontcg.io/v2';

export type PokemonCard = {
  id: string;
  name: string;
  supertype?: string;
  subtypes?: string[];
  hp?: string;
  types?: string[];
  number?: string;
  artist?: string;
  rarity?: string;
  rules?: string[];
  attacks?: Array<{
    name: string;
    cost?: string[];
    convertedEnergyCost?: number;
    damage?: string;
    text?: string;
  }>;
  weaknesses?: Array<{
    type: string;
    value: string;
  }>;
  resistances?: Array<{
    type: string;
    value: string;
  }>;
  retreatCost?: string[];
  convertedRetreatCost?: number;
  legalities?: Record<string, string>;
  set?: {
    id: string;
    name: string;
    series?: string;
    printedTotal?: number;
    total?: number;
    releaseDate?: string;
    legalities?: Record<string, string>;
    images?: {
      symbol?: string;
      logo?: string;
    };
  };
  images?: {
    small?: string;
    large?: string;
  };
  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: Record<
      string,
      {
        low?: number;
        mid?: number;
        high?: number;
        market?: number;
        directLow?: number;
      }
    >;
  };
  cardmarket?: {
    url?: string;
    updatedAt?: string;
    prices?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      germanProLow?: number;
      suggestedPrice?: number;
      reverseHoloSell?: number;
      reverseHoloLow?: number;
      reverseHoloTrend?: number;
      lowPriceExPlus?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
      reverseHoloAvg1?: number;
      reverseHoloAvg7?: number;
      reverseHoloAvg30?: number;
    };
  };
};

export type GetCardsParams = {
  apiKey?: string;
  page?: number;
  pageSize?: number;
  query?: string;
  orderBy?: string;
  select?: string[];
};

export type CardsResponse = {
  data: PokemonCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
};

export type CardResponse = {
  data: PokemonCard;
};

export async function getPokemonCards({
  apiKey,
  page = 1,
  pageSize = 20,
  query,
  orderBy = 'name',
  select,
}: GetCardsParams = {}): Promise<CardsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(Math.min(pageSize, 250)),
    orderBy,
  });

  if (query) {
    params.set('q', query);
  }

  if (select?.length) {
    params.set('select', select.join(','));
  }

  const headers: Record<string, string> = {};

  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  const response = await fetch(`${BASE_URL}/cards?${params.toString()}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Pokemon TCG API failed with status ${response.status}`);
  }

  return response.json();
}

export async function getPokemonCardById({
  apiKey,
  id,
}: {
  apiKey?: string;
  id: string;
}): Promise<PokemonCard> {
  const headers: Record<string, string> = {};

  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  const response = await fetch(`${BASE_URL}/cards/${id}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Pokemon TCG API failed with status ${response.status}`);
  }

  const cardResponse: CardResponse = await response.json();

  return cardResponse.data;
}
