'use client';

import { useState, useEffect } from 'react';

export interface AdminSettings {
  hasAltinAlisFarki: number;
  hasAltinSatisFarki: number;
  gramAltinAlisCarpani: number;
  gramAltinSatisCarpani: number;
  ayar22AlisCarpani: number;
  ayar22SatisCarpani: number;
  ayar21AlisCarpani: number;
  ayar21SatisCarpani: number;
  ayar14AlisCarpani: number;
  ayar14SatisCarpani: number;
  ziynetCeyrekAlisCarpani: number;
  ziynetCeyrekSatisCarpani: number;
  ziynetYarimAlisCarpani: number;
  ziynetYarimSatisCarpani: number;
  ziynetTamAlisCarpani: number;
  ziynetTamSatisCarpani: number;
  ataCeyrekAlisCarpani: number;
  ataCeyrekSatisCarpani: number;
  ataYarimAlisCarpani: number;
  ataYarimSatisCarpani: number;
  ataTamAlisCarpani: number;
  ataTamSatisCarpani: number;
  dolarAlisEksi: number;
  dolarSatisArti: number;
  euroAlisEksi: number;
  euroSatisArti: number;
  suudiAlisEksi: number;
  suudiSatisArti: number;
}

const defaultSettings: AdminSettings = {
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

export default function AdminPage() {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('adminSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Ayarlar yüklenemedi:', e);
      }
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      setNotification({ type: 'success', message: 'Ayarlar başarıyla kaydedildi!' });

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (e) {
      setNotification({ type: 'error', message: 'Ayarlar kaydedilemedi!' });
      console.error('Ayarlar kaydedilemedi:', e);
    }
  };

  const handleChange = (key: keyof AdminSettings, value: number) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-blue-500 text-white p-4">
      <div className="container mx-auto max-w-7xl py-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <a
            href="/"
            className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            ← Ana Sayfa
          </a>
          <h1 className="text-3xl font-bold">Yönetim Paneli</h1>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-lg text-center font-semibold ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
          <div className="bg-black/40 p-4">
            <h2 className="text-center text-xl font-semibold">
              Fiyat Çarpanları ve Farkları Ayarları
            </h2>
          </div>

          <div className="p-4">
            <form className="space-y-6">
              {/* Has Altın */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-yellow-300 border-b border-white/20 pb-2">Has Altın</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Alış Farkı</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.hasAltinAlisFarki}
                      onChange={(e) => handleChange('hasAltinAlisFarki', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Satış Farkı</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.hasAltinSatisFarki}
                      onChange={(e) => handleChange('hasAltinSatisFarki', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Gram Altın */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-yellow-300 border-b border-white/20 pb-2">Gram Altın</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Alış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.gramAltinAlisCarpani}
                      onChange={(e) => handleChange('gramAltinAlisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Satış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.gramAltinSatisCarpani}
                      onChange={(e) => handleChange('gramAltinSatisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Ayarlar */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-yellow-300 border-b border-white/20 pb-2">Ayarlar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">22 Ayar Alış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ayar22AlisCarpani}
                      onChange={(e) => handleChange('ayar22AlisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">22 Ayar Satış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ayar22SatisCarpani}
                      onChange={(e) => handleChange('ayar22SatisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">21 Ayar Alış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ayar21AlisCarpani}
                      onChange={(e) => handleChange('ayar21AlisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">21 Ayar Satış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ayar21SatisCarpani}
                      onChange={(e) => handleChange('ayar21SatisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">14 Ayar Alış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ayar14AlisCarpani}
                      onChange={(e) => handleChange('ayar14AlisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">14 Ayar Satış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ayar14SatisCarpani}
                      onChange={(e) => handleChange('ayar14SatisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Ziynet */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-yellow-300 border-b border-white/20 pb-2">Ziynet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Çeyrek Alış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ziynetCeyrekAlisCarpani}
                      onChange={(e) => handleChange('ziynetCeyrekAlisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Çeyrek Satış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ziynetCeyrekSatisCarpani}
                      onChange={(e) => handleChange('ziynetCeyrekSatisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Yarım Alış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ziynetYarimAlisCarpani}
                      onChange={(e) => handleChange('ziynetYarimAlisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Yarım Satış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ziynetYarimSatisCarpani}
                      onChange={(e) => handleChange('ziynetYarimSatisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Tam Alış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ziynetTamAlisCarpani}
                      onChange={(e) => handleChange('ziynetTamAlisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Tam Satış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ziynetTamSatisCarpani}
                      onChange={(e) => handleChange('ziynetTamSatisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* ATA */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-yellow-300 border-b border-white/20 pb-2">ATA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Çeyrek Alış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ataCeyrekAlisCarpani}
                      onChange={(e) => handleChange('ataCeyrekAlisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Çeyrek Satış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ataCeyrekSatisCarpani}
                      onChange={(e) => handleChange('ataCeyrekSatisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Yarım Alış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ataYarimAlisCarpani}
                      onChange={(e) => handleChange('ataYarimAlisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Yarım Satış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ataYarimSatisCarpani}
                      onChange={(e) => handleChange('ataYarimSatisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Tam Alış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ataTamAlisCarpani}
                      onChange={(e) => handleChange('ataTamAlisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Tam Satış Çarpanı</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.ataTamSatisCarpani}
                      onChange={(e) => handleChange('ataTamSatisCarpani', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Döviz */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-yellow-300 border-b border-white/20 pb-2">Döviz</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Dolar Alış Eksi</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.dolarAlisEksi}
                      onChange={(e) => handleChange('dolarAlisEksi', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Dolar Satış Artı</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.dolarSatisArti}
                      onChange={(e) => handleChange('dolarSatisArti', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Euro Alış Eksi</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.euroAlisEksi}
                      onChange={(e) => handleChange('euroAlisEksi', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Euro Satış Artı</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.euroSatisArti}
                      onChange={(e) => handleChange('euroSatisArti', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Suudi Alış Eksi</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.suudiAlisEksi}
                      onChange={(e) => handleChange('suudiAlisEksi', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Suudi Satış Artı</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.suudiSatisArti}
                      onChange={(e) => handleChange('suudiSatisArti', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Ayarları Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
