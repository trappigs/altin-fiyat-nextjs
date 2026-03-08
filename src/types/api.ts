export interface SatilacakAltin {
  cinsi: string;
  alisFiyati: number;
  satisFiyati: number;
}

export interface ApiResponse {
  data: SatilacakAltin[];
  kaynak: string;
  sonGuncelleme: string;
  success: boolean;
}

// Harem Altın API interfaces
export interface HaremCurrency {
  code: string;
  alis: string;
  satis: string;
  tarih: string;
}

export interface HaremMeta {
  time: number;
  tarih: string;
}

export interface HaremRoot {
  meta: HaremMeta;
  data: Record<string, HaremCurrency>;
}

// Sağlamoğlu API interfaces
export interface SaglamogluItem {
  id: number;
  marketProductId: number;
  updatedAt: string;
  customerBuysAt: number;
  customerSellsAt: number;
  buyTradeStatus: boolean;
  sellTradeStatus: boolean;
  isVisible: boolean;
  customerGroupId: number;
}

export interface SaglamogluResponse {
  data: SaglamogluItem[];
  status: number;
  exceptionOrValidationResult: string;
}
