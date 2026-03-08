export async function GET(request: Request) {
  try {
    console.log('=== API GET isteği başladı ===');

    const now = Date.now();

    if (cache && (now - cache.lastUpdate) < CACHE_DURATION) {
      console.log('Cache kullanılıyor, cache.data type:', typeof cache.data);
      console.log('Cache.data:', JSON.stringify(cache.data));
      console.log('Cache.data length:', Array.isArray(cache.data) ? cache.data.length : 'NOT AN ARRAY');
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

    console.log('Hesaplandıktan sonra urunListesi.length:', urunListesi.length);
    console.log('İlk 3 ürün:', urunListesi.slice(0, 3));
    console.log('Full JSON string:', JSON.stringify({
      data: urunListesi,
      kaynak: veriKaynagi,
      sonGuncelleme: apiTarih || new Date().toLocaleString('tr-TR'),
      success: hasAltinAlis > 0
    }));

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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    const errorResponse: ApiResponse = {
      data: [],
      kaynak: 'Hata',
      sonGuncelleme: 'Hata oluştu',
      success: false
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
