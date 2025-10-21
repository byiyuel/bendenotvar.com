import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/Layout/AdminLayout';

const Moderation: React.FC = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await adminAPI.getPendingAds();
    setPending(data);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const setStatus = async (id: string, status: 'ACTIVE'|'REJECTED') => {
    await adminAPI.updateAdStatus(id, status);
    await load();
  };

  if (loading) return <div className="p-6">Yükleniyor…</div>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Moderasyon - Onay Bekleyen İlanlar</h1>
      {pending.length === 0 ? (
        <div className="border rounded p-6 text-gray-500">Onay bekleyen ilan yok.</div>
      ) : (
        <div className="grid gap-3">
          {pending.map(ad => (
            <div key={ad.id} className="border rounded p-4 dark:border-secondary-700">
              <div className="font-medium">{ad.title}</div>
              <div className="text-sm text-gray-500">{ad.user?.firstName} {ad.user?.lastName} • {new Date(ad.createdAt).toLocaleString('tr-TR')}</div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setStatus(ad.id, 'ACTIVE')} className="px-3 py-1 rounded bg-green-600 text-white">Onayla</button>
                <button onClick={() => setStatus(ad.id, 'REJECTED')} className="px-3 py-1 rounded bg-red-600 text-white">Reddet</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default Moderation;


