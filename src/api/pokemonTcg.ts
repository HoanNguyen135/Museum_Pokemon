const BASE_URL = 'https://api.pokemontcg.io/v2';
const API_KEY_HEADER = 'X-Api-Key';
const DEFAULT_TIMEOUT_MS = 15_000;
const ERROR_PREFIX = 'Pokemon TCG API';

// ─── Shared fetch helper ────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: {
    apiKey?: string;
    timeoutMs?: number;
  } = {},
): Promise<T> {
  const { apiKey, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers[API_KEY_HEADER] = apiKey;
    }

    const response = await fetch(path, {
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${ERROR_PREFIX} failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`${ERROR_PREFIX} request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Types ───────────────────────────────────────────────────────────────

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

export type PokemonSet = {
  id: string;
  name: string;
  series?: string;
  printedTotal?: number;
  total?: number;
  releaseDate?: string;
  updatedAt?: string;
  legalities?: Record<string, string>;
  ptcgoCode?: string;
  images?: {
    symbol?: string;
    logo?: string;
  };
};

export type GetSetsParams = {
  apiKey?: string;
  page?: number;
  pageSize?: number;
  query?: string;
  orderBy?: string;
};

export type SetsResponse = {
  data: PokemonSet[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
};

// ─── API Functions ────────────────────────────────────────────────────────

export async function getPokemonCards({
  apiKey,
  page = 1,
  pageSize = 20,
  orderBy = 'name',
  select,
}: GetCardsParams = {}): Promise<CardsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(Math.min(pageSize, 250)),
    orderBy,
  });

  if (select?.length) {
    params.set('select', select.join(','));
  }

  return apiFetch(`${BASE_URL}/cards?${params.toString()}`, { apiKey });
}

export async function getPokemonSets({
  apiKey,
  page = 1,
  pageSize = 20,
  query,
  orderBy = '-releaseDate',
}: GetSetsParams = {}): Promise<SetsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(Math.min(pageSize, 250)),
    orderBy,
  });

  if (query) {
    params.set('q', query);
  }

  return apiFetch(`${BASE_URL}/sets?${params.toString()}`, { apiKey });
}

export async function getPokemonCardById({
  apiKey,
  id,
}: {
  apiKey?: string;
  id: string;
}): Promise<PokemonCard> {
  const cardResponse = await apiFetch<CardResponse>(`${BASE_URL}/cards/${id}`, {
    apiKey,
  });

  return cardResponse.data;
}
