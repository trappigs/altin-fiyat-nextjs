import { NextResponse } from 'next/server';
import { ApiResponse, HaremRoot, SaglamogluResponse, SatilacakAltin } from '@/types/api';

const CACHE_DURATION = 30000;

let cache: {
  data: SatilacakAltin[];
  source: string;
  lastUpdate: number;
} | null = null;

const DEFAULT_CARPANLAR = {
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

async function getHaremData() {
  try {
    console.log('Harem API istek gönderiliyor...');
    const response = await fetch('https://canlipiyasalar.haremaltin.com/tmp/doviz.json?dil_kodu=tr', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 }
    });

    console.log('Harem API status:', response.status);

    if (!response.ok) {
      console.error('Harem API response not OK:', response.status);
      return null;
    }

    const root: HaremRoot = await response.json();

    console.log('Harem API data keys:', Object.keys(root?.data || {}));

    if (!root?.data) {
      console.error('Harem API data is null');
      return null;
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

    if (root.meta?.tarih) {
      apiTarih = root.meta.tarih.replace(/-/g, '.');
    }

    console.log('Harem API tarih:', apiTarih);

    if (root.data['ALTIN']) {
      hasAltinAlis = parseFloat(root.data['ALTIN'].alis) || 0;
      hasAltinSatis = parseFloat(root.data['ALTIN'].satis) || 0;
      console.log('Has Altın:', { hasAltinAlis, hasAltinSatis });
    }

    if (root.data['USDTRY']) {
      usdAlis = parseFloat(root.data['USDTRY'].alis) || 0;
      usdSatis = parseFloat(root.data['USDTRY'].satis) || 0;
      console.log('USD:', { usdAlis, usdSatis });
    }

    if (root.data['EURTRY']) {
      eurAlis = parseFloat(root.data['EURTRY'].alis) || 0;
      eurSatis = parseFloat(root.data['EURTRY'].satis) || 0;
      console.log('EUR:', { eurAlis, eurSatis });
    }

    if (root.data['SARTRY']) {
      sarAlis = parseFloat(root.data['SARTRY'].alis) || 0;
      sarSatis = parseFloat(root.data['SARTRY'].satis) || 0;
      console.log('SAR:', { sarAlis, sarSatis });
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

async function getSaglamogluData() {
  try {
    console.log('Sağlamoğlu API istek gönderiliyor...');
    const response = await fetch('https://prdprc.saglamoglu.app/api/v1/prices/currentmarketproductprices', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 }
    });

    console.log('Sağlamoğlu API status:', response.status);

    if (!response.ok) {
      console.error('Sağlamoğlu API response not OK:', response.status);
      return null;
    }

    const root: SaglamogluResponse = await response.json();

    console.log('Sağlamoğlu API data length:', root?.data?.length || 0);

    if (!root?.data) {
      console.error('Sağlamoğlu API data is null');
      return null;
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

    const hasAltinItem = root.data.find(x => x.id === 0);
    if (hasAltinItem) {
      hasAltinAlis = hasAltinItem.customerBuysAt;
      hasAltinSatis = hasAltinItem.customerSellsAt;

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
      console.log('Has Altın:', { hasAltinAlis, hasAltinSatis });
    }

    const usdItem = root.data.find(x => x.id === 8);
    if (usdItem) {
      usdAlis = usdItem.customerBuysAt;
      usdSatis = usdItem.customerSellsAt;
      console.log('USD:', { usdAlis, usdSatis });
    }

    const eurItem = root.data.find(x => x.id === 9);
    if (eurItem) {
      eurAlis = eurItem.customerBuysAt;
      eurSatis = eurItem.customerSellsAt;
      console.log('EUR:', { eurAlis, eurSatis });
    }

    const sarItem = root.data.find(x => x.id === 15);
    if (sarItem) {
      sarAlis = sarItem.customerBuysAt;
      sarSatis = sarItem.customerSellsAt;
      console.log('SAR:', { sarAlis, sarSatis });
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

function hesaplaVeListele(
  hasAltinAlis: number,
  hasAltinSatis: number,
  usdAlis: number,
  usdSatis: number,
  eurAlis: number,
  eurSatis: number,
  sarAlis: number,
  sarSatis: number,
  carpanlar: any = DEFAULT_CARPANLAR
): SatilacakAltin[] {
  const urunListesi: SatilacakAltin[] = [];

  const c = carpanlar;

  hasAltinAlis = hasAltinAlis + c.hasAltinAlisFarki;
  hasAltinSatis = hasAltinSatis + c.hasAltinSatisFarki;

  console.log('Hesaplanan Has Altın:', { hasAltinAlis, hasAltinSatis });

  urunListesi.push({
    cinsi: 'USD/TL',
    alisFiyati: usdAlis > 0 ? usdAlis - c.dolarAlisEksi : 0,
    satisFiyati: usdSatis > 0 ? usdSatis + c.dolarSatisArti : 0
  });

  urunListesi.push({
    cinsi: 'EUR/TL',
    alisFiyati: eurAlis > 0 ? eurAlis - c.euroAlisEksi : 0,
    satisFiyati: eurSatis > 0 ? eurSatis + c.euroSatisArti : 0
  });

  const eurUsdAlis = usdAlis > 0 ? (eurAlis - c.euroAlisEksi) / (usdAlis - c.dolarAlisEksi) : 0;
  const eurUsdSatis = usdSatis > 0 ? (eurSatis + c.euroSatisArti) / (usdSatis + c.dolarSatisArti) : 0;
  urunListesi.push({
    cinsi: 'EUR/USD',
    alisFiyati: eurUsdAlis,
    satisFiyati: eurUsdSatis
  });

  urunListesi.push({
    cinsi: 'SAR/TL',
    alisFiyati: sarAlis > 0 ? sarAlis - c.suudiAlisEksi : 0,
    satisFiyati: sarSatis > 0 ? sarSatis + c.suudiSatisArti : 0
  });

  urunListesi.push({
    cinsi: 'Has Altın',
    alisFiyati: hasAltinAlis,
    satisFiyati: hasAltinSatis
  });

  urunListesi.push({
    cinsi: '24 Ayar',
    alisFiyati: hasAltinAlis * c.gramAltinAlisCarpani,
    satisFiyati: hasAltinSatis * c.gramAltinSatisCarpani
  });

  urunListesi.push({
    cinsi: '22 Ayar',
    alisFiyati: hasAltinAlis * c.ayar22AlisCarpani,
    satisFiyati: hasAltinSatis * c.ayar22SatisCarpani
  });

  urunListesi.push({
    cinsi: '21 Ayar',
    alisFiyati: hasAltinAlis * c.ayar21AlisCarpani,
    satisFiyati: hasAltinSatis * c.ayar21SatisCarpani
  });

  urunListesi.push({
    cinsi: '14 Ayar',
    alisFiyati: hasAltinAlis * c.ayar14AlisCarpani,
    satisFiyati: hasAltinSatis * c.ayar14SatisCarpani
  });

  urunListesi.push({
    cinsi: 'Çeyrek',
    alisFiyati: hasAltinAlis * c.ziynetCeyrekAlisCarpani,
    satisFiyati: hasAltinSatis * c.ziynetCeyrekSatisCarpani
  });

  urunListesi.push({
    cinsi: 'Yarım',
    alisFiyati: hasAltinAlis * c.ziynetYarimAlisCarpani,
    satisFiyati: hasAltinSatis * c.ziynetYarimSatisCarpani
  });

  urunListesi.push({
    cinsi: 'Tam',
    alisFiyati: hasAltinAlis * c.ziynetTamAlisCarpani,
    satisFiyati: hasAltinSatis * c.ziynetTamSatisCarpani
  });

  urunListesi.push({
    cinsi: 'ATA Çeyrek',
    alisFiyati: hasAltinAlis * c.ataCeyrekAlisCarpani,
    satisFiyati: hasAltinSatis * c.ataCeyrekSatisCarpani
  });

  urunListesi.push({
    cinsi: 'ATA Yarım',
    alisFiyati: hasAltinAlis * c.ataYarimAlisCarpani,
    satisFiyati: hasAltinSatis * c.ataYarimSatisCarpani
  });

  urunListesi.push({
    cinsi: 'ATA Tam',
    alisFiyati: hasAltinAlis * c.ataTamAlisCarpani,
    satisFiyati: hasAltinSatis * c.ataTamSatisCarpani
  });

  console.log('Toplam ürün sayısı:', urunListesi.length);

  return urunListesi;
}

export async function GET(request: Request) {
  try {
    console.log('=== API GET isteği başladı ===');

    const now = Date.now();

    if (cache && (now - cache.lastUpdate) < CACHE_DURATION) {
      console.log('Cache kullanılıyor');
      return NextResponse.json({
        data: cache.data,
        kaynak: cache.source,
        sonGuncelleme: new Date(cache.lastUpdate).toLocaleString('tr-TR'),
        success: true
      } as ApiResponse);
    }

    console.log('Yeni veri çekiliyor...');

    const haremData = await getHaremData();

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
      console.log('Harem verisi kullanılıyor');
    } else {
      console.log('Harem başarısız, Sağlamoğlu deneniyor...');
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
        console.log('Sağlamoğlu verisi kullanılıyor');
      }
    }

    if (hasAltinAlis === 0) {
      veriKaynagi = 'Veri Alınamadı';
      console.error('Her iki API de başarısız!');
    }

    const urunListesi = hesaplaVeListele(
      hasAltinAlis,
      hasAltinSatis,
      usdAlis,
      usdSatis,
      eurAlis,
      eurSatis,
      sarAlis,
      sarSatis,
      DEFAULT_CARPANLAR
    );

    cache = {
      data: urunListesi,
      source: veriKaynagi,
      lastUpdate: now
    };

    console.log('=== API GET isteği tamamlandı ===');
    console.log('Kaynak:', veriKaynagi);
    console.log('Ürün sayısı:', urunListesi.length);

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

export async function POST(request: Request) {
  try {
    console.log('=== API POST isteği başladı ===');

    let body: any = {};

    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (e) {
      console.log('Body yok veya parse hatası, varsayılan kullanılıyor');
    }

    const carpanlar = body || DEFAULT_CARPANLAR;

    const now = Date.now();

    const haremData = await getHaremData();

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
      console.log('Harem verisi kullanılıyor');
    } else {
      console.log('Harem başarısız, Sağlamoğlu deneniyor...');
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
        console.log('Sağlamoğlu verisi kullanılıyor');
      }
    }

    if (hasAltinAlis === 0) {
      veriKaynagi = 'Veri Alınamadı';
      console.error('Her iki API de başarısız!');
    }

    const urunListesi = hesaplaVeListele(
      hasAltinAlis,
      hasAltinSatis,
      usdAlis,
      usdSatis,
      eurAlis,
      eurSatis,
      sarAlis,
      sarSatis,
      carpanlar
    );

    cache = {
      data: urunListesi,
      source: veriKaynagi,
      lastUpdate: now
    };

    console.log('=== API POST isteği tamamlandı ===');

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
