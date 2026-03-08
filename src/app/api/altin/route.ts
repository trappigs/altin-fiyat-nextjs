import { NextResponse } from 'next/server';
import { ApiResponse, HaremRoot, SaglamogluResponse, SatilacakAltin } from '@/types/api';

// Cache için (30 saniye)
const CACHE_DURATION = 30000;

let cache: {
  data: SatilacakAltin[];
  source: string;
  lastUpdate: number;
} | null = null;

// Carpanlar (appsettings.json'dan kopyaladık)
const CARPANLAR = {
  hasAltinAlisFarki: -200,
  hasAltinSatisFarki: 200,
  gramAltinAlisCarpani: 5,
  gramAltinSatisCarpani: 1.025,
  ayar22AlisCarpani: 0.905,
  ayar22SatisCarpani: 0.942,
  ayar21AlisCarpani: 0.86,
  ayar21SatisCarpani: 0.89,
  ayar14AlisCarpani: 0.57,
  ayar14SatisCarpani: 0.595,
  ziynetCeyrekAlisCarpani: 1.595,
  ziynetCeyrekSatisCarpani: 1.665,
  ziynetYarimAlisCarpani: 3.20,
  ziynetYarimSatisCarpani: 3.37,
  ziynetTamAlisCarpani: 6.40,
  ziynetTamSatisCarpani: 6.60,
  ataCeyrekAlisCarpani: 1.62,
  ataCeyrekSatisCarpani: 1.75,
  ataYarimAlisCarpani: 3.29,
  ataYarimSatisCarpani: 3.48,
  ataTamAlisCarpani: 6.62,
  ataTamSatisCarpani: 6.83,
  dolarAlisEksi: 10,
  dolarSatisArti: 0.20,
  euroAlisEksi: 0.20,
  euroSatisArti: 0.20,
  suudiAlisEksi: 0.20,
  suudiSatisArti: 0.20,
};

// Helper: Harem Verisi Çek
async function getHaremData() {
  try {
    const response = await fetch('https://canlipiyasalar.haremaltin.com/tmp/doviz.json?dil_kodu=tr', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 }
    });

    if (!response.ok) return null;

    const root: HaremRoot = await response.json();

    if (!root?.data) return null;

    let hasAltinAlis = 0;
    let hasAltinSatis = 0;
    let usdAlis = 0;
    let usdSatis = 0;
    let eurAlis = 0;
    let eurSatis = 0;
    let sarAlis = 0;
    let sarSatis = 0;
    let apiTarih: string | null = null;

    // Tarih
    if (root.meta?.tarih) {
      apiTarih = root.meta.tarih.replace(/-/g, '.');
    }

    // Has Altın
    if (root.data['ALTIN']) {
      hasAltinAlis = parseFloat(root.data['ALTIN'].alis) || 0;
      hasAltinSatis = parseFloat(root.data['ALTIN'].satis) || 0;
    }

    // Dövizler
    if (root.data['USDTRY']) {
      usdAlis = parseFloat(root.data['USDTRY'].alis) || 0;
      usdSatis = parseFloat(root.data['USDTRY'].satis) || 0;
    }
    if (root.data['EURTRY']) {
      eurAlis = parseFloat(root.data['EURTRY'].alis) || 0;
      eurSatis = parseFloat(root.data['EURTRY'].satis) || 0;
    }
    if (root.data['SARTRY']) {
      sarAlis = parseFloat(root.data['SARTRY'].alis) || 0;
      sarSatis = parseFloat(root.data['SARTRY'].satis) || 0;
    }

    return {
      hasAltinAlis,
      hasAltinSatis,
      usdAlis,
      usdSatis,
      eurAlis,
      eurSatis,
      sarAlis,
      sarSatis,
      tarih: apiTarih
    };
  } catch (ex) {
    console.error('Harem API Hatası:', ex);
    return null;
  }
}

// Helper: Sağlamoğlu Verisi Çek
async function getSaglamogluData() {
  try {
    const response = await fetch('https://prdprc.saglamoglu.app/api/v1/prices/currentmarketproductprices', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 }
    });

    if (!response.ok) return null;

    const root: SaglamogluResponse = await response.json();

    if (!root?.data) return null;

    let hasAltinAlis = 0;
    let hasAltinSatis = 0;
    let usdAlis = 0;
    let usdSatis = 0;
    let eurAlis = 0;
    let eurSatis = 0;
    let sarAlis = 0;
    let sarSatis = 0;
    let apiTarih: string | null = null;

    // Has Altın (id: 0)
    const hasAltinItem = root.data.find(x => x.id === 0);
    if (hasAltinItem) {
      hasAltinAlis = hasAltinItem.customerBuysAt;
      hasAltinSatis = hasAltinItem.customerSellsAt;

      // Tarih formatla
      if (hasAltinItem.updatedAt) {
        const dt = new Date(hasAltinItem.updatedAt);
        apiTarih = dt.toLocaleString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }

    // USD/TL (id: 8)
    const usdItem = root.data.find(x => x.id === 8);
    if (usdItem) {
      usdAlis = usdItem.customerBuysAt;
      usdSatis = usdItem.customerSellsAt;
    }

    // EUR/TL (id: 9)
    const eurItem = root.data.find(x => x.id === 9);
    if (eurItem) {
      eurAlis = eurItem.customerBuysAt;
      eurSatis = eurItem.customerSellsAt;
    }

    // SAR/TL (id: 15)
    const sarItem = root.data.find(x => x.id === 15);
    if (sarItem) {
      sarAlis = sarItem.customerBuysAt;
      sarSatis = sarItem.customerSellsAt;
    }

    return {
      hasAltinAlis,
      hasAltinSatis,
      usdAlis,
      usdSatis,
      eurAlis,
      eurSatis,
      sarAlis,
      sarSatis,
      tarih: apiTarih
    };
  } catch (ex) {
    console.error('Sağlamoğlu API Hatası:', ex);
    return null;
  }
}

// Helper: Double Parse
function parseDouble(val: string): number {
  if (!val) return 0;
  const parsed = parseFloat(val.replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
}

// Helper: Verileri Hesapla ve Listeyi Oluştur
function hesaplaVeListele(
  hasAltinAlis: number,
  hasAltinSatis: number,
  usdAlis: number,
  usdSatis: number,
  eurAlis: number,
  eurSatis: number,
  sarAlis: number,
  sarSatis: number
): SatilacakAltin[] {
  const urunListesi: SatilacakAltin[] = [];

  // Has Altın farkı ekle
  hasAltinAlis = hasAltinAlis + CARPANLAR.hasAltinAlisFarki;
  hasAltinSatis = hasAltinSatis + CARPANLAR.hasAltinSatisFarki;

  // USD/TL
  urunListesi.push({
    cinsi: 'USD/TL',
    alisFiyati: usdAlis > 0 ? usdAlis - CARPANLAR.dolarAlisEksi : 0,
    satisFiyati: usdSatis > 0 ? usdSatis + CARPANLAR.dolarSatisArti : 0
  });

  // EUR/TL
  urunListesi.push({
    cinsi: 'EUR/TL',
    alisFiyati: eurAlis > 0 ? eurAlis - CARPANLAR.euroAlisEksi : 0,
    satisFiyati: eurSatis > 0 ? eurSatis + CARPANLAR.euroSatisArti : 0
  });

  // EUR/USD
  const eurUsdAlis = usdAlis > 0 ? (eurAlis - CARPANLAR.euroAlisEksi) / (usdAlis - CARPANLAR.dolarAlisEksi) : 0;
  const eurUsdSatis = usdSatis > 0 ? (eurSatis + CARPANLAR.euroSatisArti) / (usdSatis + CARPANLAR.dolarSatisArti) : 0;
  urunListesi.push({
    cinsi: 'EUR/USD',
    alisFiyati: eurUsdAlis,
    satisFiyati: eurUsdSatis
  });

  // SAR/TL
  urunListesi.push({
    cinsi: 'SAR/TL',
    alisFiyati: sarAlis > 0 ? sarAlis - CARPANLAR.suudiAlisEksi : 0,
    satisFiyati: sarSatis > 0 ? sarSatis + CARPANLAR.suudiSatisArti : 0
  });

  // Has Altın
  urunListesi.push({
    cinsi: 'Has Altın',
    alisFiyati: hasAltinAlis,
    satisFiyati: hasAltinSatis
  });

  // 24 Ayar (Gram)
  urunListesi.push({
    cinsi: '24 Ayar',
    alisFiyati: hasAltinAlis * CARPANLAR.gramAltinAlisCarpani,
    satisFiyati: hasAltinSatis * CARPANLAR.gramAltinSatisCarpani
  });

  // 22 Ayar
  urunListesi.push({
    cinsi: '22 Ayar',
    alisFiyati: hasAltinAlis * CARPANLAR.ayar22AlisCarpani,
    satisFiyati: hasAltinSatis * CARPANLAR.ayar22SatisCarpani
  });

  // 21 Ayar
  urunListesi.push({
    cinsi: '21 Ayar',
    alisFiyati: hasAltinAlis * CARPANLAR.ayar21AlisCarpani,
    satisFiyati: hasAltinSatis * CARPANLAR.ayar21SatisCarpani
  });

  // 14 Ayar
  urunListesi.push({
    cinsi: '14 Ayar',
    alisFiyati: hasAltinAlis * CARPANLAR.ayar14AlisCarpani,
    satisFiyati: hasAltinSatis * CARPANLAR.ayar14SatisCarpani
  });

  // Çeyrek
  urunListesi.push({
    cinsi: 'Çeyrek',
    alisFiyati: hasAltinAlis * CARPANLAR.ziynetCeyrekAlisCarpani,
    satisFiyati: hasAltinSatis * CARPANLAR.ziynetCeyrekSatisCarpani
  });

  // Yarım
  urunListesi.push({
    cinsi: 'Yarım',
    alisFiyati: hasAltinAlis * CARPANLAR.ziynetYarimAlisCarpani,
    satisFiyati: hasAltinSatis * CARPANLAR.ziynetYarimSatisCarpani
  });

  // Tam
  urunListesi.push({
    cinsi: 'Tam',
    alisFiyati: hasAltinAlis * CARPANLAR.ziynetTamAlisCarpani,
    satisFiyati: hasAltinSatis * CARPANLAR.ziynetTamSatisCarpani
  });

  // ATA Çeyrek
  urunListesi.push({
    cinsi: 'ATA Çeyrek',
    alisFiyati: hasAltinAlis * CARPANLAR.ataCeyrekAlisCarpani,
    satisFiyati: hasAltinSatis * CARPANLAR.ataCeyrekSatisCarpani
  });

  // ATA Yarım
  urunListesi.push({
    cinsi: 'ATA Yarım',
    alisFiyati: hasAltinAlis * CARPANLAR.ataYarimAlisCarpani,
    satisFiyati: hasAltinSatis * CARPANLAR.ataYarimSatisCarpani
  });

  // ATA Tam
  urunListesi.push({
    cinsi: 'ATA Tam',
    alisFiyati: hasAltinAlis * CARPANLAR.ataTamAlisCarpani,
    satisFiyati: hasAltinSatis * CARPANLAR.ataTamSatisCarpani
  });

  return urunListesi;
}

export async function GET(request: Request) {
  try {
    // Cache kontrol
    const now = Date.now();
    if (cache && (now - cache.lastUpdate) < CACHE_DURATION) {
      return NextResponse.json({
        data: cache.data,
        kaynak: cache.source,
        sonGuncelleme: new Date(cache.lastUpdate).toLocaleString('tr-TR'),
        success: true
      } as ApiResponse);
    }

    let hasAltinAlis = 0;
    let hasAltinSatis = 0;
    let usdAlis = 0;
    let usdSatis = 0;
    let eurAlis = 0;
    let eurSatis = 0;
    let sarAlis = 0;
    let sarSatis = 0;
    let apiTarih: string | null = null;
    let veriKaynagi = '';

    // 1. Harem Altın dene
    const haremData = await getHaremData();
    if (haremData && haremData.hasAltinAlis > 0) {
      hasAltinAlis = haremData.hasAltinAlis;
      hasAltinSatis = haremData.hasAltinSatis;
      usdAlis = haremData.usdAlis;
      usdSatis = haremData.usdSatis;
      eurAlis = haremData.eurAlis;
      eurSatis = haremData.eurSatis;
      sarAlis = haremData.sarAlis;
      sarSatis = haremData.sarSatis;
      apiTarih = haremData.tarih;
      veriKaynagi = 'Harem Altın';
    }

    // 2. Sağlamoğlu Altın dene (Eğer Harem başarısızsa)
    if (hasAltinAlis === 0) {
      const saglamogluData = await getSaglamogluData();
      if (saglamogluData && saglamogluData.hasAltinAlis > 0) {
        hasAltinAlis = saglamogluData.hasAltinAlis;
        hasAltinSatis = saglamogluData.hasAltinSatis;
        usdAlis = saglamogluData.usdAlis;
        usdSatis = saglamogluData.usdSatis;
        eurAlis = saglamogluData.eurAlis;
        eurSatis = saglamogluData.eurSatis;
        sarAlis = saglamogluData.sarAlis;
        sarSatis = saglamogluData.sarSatis;
        apiTarih = saglamogluData.tarih;
        veriKaynagi = 'Sağlamoğlu Altın';
      }
    }

    // Eğer her ikisi de başarısızsa
    if (hasAltinAlis === 0) {
      veriKaynagi = 'Veri Alınamadı';
    }

    // Verileri hesapla
    const urunListesi = hesaplaVeListele(
      hasAltinAlis,
      hasAltinSatis,
      usdAlis,
      usdSatis,
      eurAlis,
      eurSatis,
      sarAlis,
      sarSatis
    );

    // Cache'e yaz
    cache = {
      data: urunListesi,
      source: veriKaynagi,
      lastUpdate: now
    };

    // Response
    const response: ApiResponse = {
      data: urunListesi,
      kaynak: veriKaynagi,
      sonGuncelleme: apiTarih || new Date().toLocaleString('tr-TR'),
      success: hasAltinAlis > 0
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Hatası:', error);

    const errorResponse: ApiResponse = {
      data: [],
      kaynak: 'Hata',
      sonGuncelleme: 'Hata oluştu',
      success: false
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
