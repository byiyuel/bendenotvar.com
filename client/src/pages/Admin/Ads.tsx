import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/Layout/AdminLayout';

const Ads: React.FC = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await adminAPI.getAds();
    setAds(data);
  };

  useEffect(() => {
    load().catch((e)=>{
      if (e.response?.status === 403) alert('Admin erişimi için 2FA zorunlu. Lütfen 2FA etkinleştirin.');
    }).finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    if (!window.confirm('İlanı silmek istediğinize emin misiniz?')) return;
    await adminAPI.deleteAd(id);
    await load();
  };

  if (loading) return <div className="p-6">Yükleniyor…</div>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">İlanlar</h1>
      <div className="grid gap-4">
        {ads.map((ad) => (
          <div key={ad.id} className="border rounded p-4 dark:border-secondary-700">
            <div className="font-semibold">{ad.title}</div>
            <div className="text-sm text-gray-500">{ad.user?.firstName} {ad.user?.lastName} — {new Date(ad.createdAt).toLocaleString('tr-TR')}</div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => remove(ad.id)} className="px-3 py-1 border rounded text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30">Sil</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Ads;


