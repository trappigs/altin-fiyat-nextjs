'use client';

import { useEffect, useState } from 'react';
import { ApiResponse, SatilacakAltin } from '@/types/api';

export default function AltinFiyatlar() {
  const [data, setData] = useState<SatilacakAltin[]>([]);
  const [kaynak, setKaynak] = useState<string>('');
  const [sonGuncelleme, setSonGuncelleme] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/altin');
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

    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-right mb-4">
          <a
            href="https://github.com/trappigs/altinFiyatlarWebSitesi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            GitHub
          </a>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">Ahmet Hatay Kuyumculuk</h1>
          <p className="text-xl">Altın & Döviz Fiyatları</p>
        </div>

        <div className="text-right mb-4 text-sm">
          <span className="mr-4">
            <strong className="text-yellow-300">Kaynak:</strong>{' '}
            <span className="text-yellow-300">{kaynak}</span>
          </span>
          <span>
            <strong className="text-yellow-300">Son Güncelleme:</strong>{' '}
            <span className="text-yellow-300">{sonGuncelleme}</span>
          </span>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
          <div className="bg-black/40 p-4">
            <h2 className="text-center text-xl font-semibold">
              Altın & Döviz Fiyatları
            </h2>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                <p className="mt-4 text-lg">Yükleniyor...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-red-300">Veri alınamadı</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="py-3 px-4 text-left font-semibold">Cinsi</th>
                      <th className="py-3 px-4 text-right font-semibold">Alış Fiyatı</th>
                      <th className="py-3 px-4 text-right font-semibold">Satış Fiyatı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={index}
                        className={`border-b border-white/10 ${
                          index % 2 === 0 ? 'bg-white/5' : 'bg-white/15'
                        } hover:bg-white/20 transition-colors`}
                      >
                        <td className="py-3 px-4 font-semibold text-black">
                          {item.cinsi}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-medium ${
                            index % 2 === 0 ? 'text-red-400' : 'text-white'
                          }`}
                        >
                          {item.alisFiyati.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-medium ${
                            index % 2 === 0 ? 'text-green-400' : 'text-white'
                          }`}
                        >
                          {item.satisFiyati.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-white/70">
          <p>Canlı Altın & Döviz Fiyatları</p>
          <p>Her 2 saniyede bir güncellenir</p>
        </div>
      </div>
    </div>
  );
}
