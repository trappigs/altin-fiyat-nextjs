'use client';

import { useEffect, useState } from 'react';
import { ApiResponse, SatilacakAltin } from '@/types/api';

export default function AltinFiyatlar() {
  const [data, setData] = useState<SatilacakAltin[]>([]);
  const [kaynak, setKaynak] = useState<string>('');
  const [sonGuncelleme, setSonGuncelleme] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [adminSettings, setAdminSettings] = useState<any>(null);

  const fetchData = async () => {
    try {
      // Admin ayarlarını localStorage'dan al
      const savedSettings = localStorage.getItem('adminSettings');
      let body: any = {};

      if (savedSettings) {
        try {
          body = JSON.parse(savedSettings);
          setAdminSettings(body);
        } catch (e) {
          console.error('Ayarlar yüklenemedi:', e);
        }
      }

      const response = await fetch('/api/altin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : null
      });

      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setKaynak(result.kaynak);
        setSonGuncelleme(result.sonGuncelleme);
      }
    } catch (error) {
      console.error('Veri çekerken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Her 2 saniyede bir güncelle (sadece veriyi, tüm tabloyu değil)
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []); // Boş dependency array - sadece ilk mount'ta çalışır

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-blue-500 p-4">
      <div className="container mx-auto max-w-7xl py-4">
        {/* Header */}
        <div className="text-end mb-3">
          <a
            href="/admin"
            className="inline-block px-5 py-2 font-bold rounded-lg hover:opacity-90 transition-opacity"
            style={{
              background: 'linear-gradient(45deg, #f1c15b, #d4a142)',
              border: 'none',
              color: '#000'
            }}
          >
            Yönetim Paneli
          </a>
        </div>

        {/* Logo */}
        <div className="text-center mb-4">
          <h1 className="font-bold mb-2" style={{ fontSize: '2.5rem' }}>Ahmet Hatay Kuyumculuk</h1>
        </div>

        {/* Card */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
          <div className="p-4 rounded-t-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
            <h2 className="text-center font-semibold text-white text-2xl">
              Altın & Döviz Fiyatları
            </h2>
          </div>

          <div className="p-4">
            {/* Son Güncellenme Zamanı ve Kaynak */}
            <div className="text-end mb-2">
              <small className="text-white">
                <strong>Kaynak:</strong>{' '}
                <span className="text-yellow-400" style={{ marginRight: '15px' }}>{kaynak}</span>
                <strong>Son Güncellenme:</strong>{' '}
                <span className="text-yellow-400">{sonGuncelleme}</span>
              </small>
            </div>

            {/* Tablo */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'transparent' }}></div>
                <p className="mt-4 text-lg">Yükleniyor...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-red-300">Veri alınamadı</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-bordered table-striped table-hover align-middle">
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                      <th scope="col" className="text-white text-center py-3 px-4" style={{ minWidth: '150px' }}>Cinsi</th>
                      <th scope="col" className="text-white text-center py-3 px-4" style={{ minWidth: '150px' }}>Alış Fiyatı</th>
                      <th scope="col" className="text-white text-center py-3 px-4" style={{ minWidth: '150px' }}>Satış Fiyatı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.15)'
                        }}
                      >
                        {/* Cinsi sütunu */}
                        <td className="py-3 px-4 text-center" style={{ color: 'black', fontWeight: '600' }}>
                          {item.cinsi}
                        </td>

                        {/* Alış fiyatları - sırayla kırmızı/beyaz */}
                        <td
                          className="py-3 px-4 text-center font-medium"
                          style={{
                            color: index % 2 === 0 ? 'red' : 'white'
                          }}
                        >
                          {item.alisFiyati.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>

                        {/* Satış fiyatları - sırayla yeşil/beyaz */}
                        <td
                          className="py-3 px-4 text-center font-medium"
                          style={{
                            color: index % 2 === 0 ? 'green' : 'white'
                          }}
                        >
                          {item.satisFiyati.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <style jsx>{`
                  .table-bordered {
                    border-collapse: separate;
                    border-spacing: 0;
                  }
                  .table-bordered th,
                  .table-bordered td {
                    border:1px solid rgba(255, 255, 255, 0.2);
                  }
                  .table-hover tr:hover {
                    background-color: rgba(255,255,255,0.2) !important;
                  }
                `}</style>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <p>Canlı Altın & Döviz Fiyatları</p>
        </div>
      </div>
    </div>
  );
}
