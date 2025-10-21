import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{ totalUsers: number; totalAds: number; totalMessages: number; totalFavorites: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await adminAPI.getOverview();
        setStats(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="p-6">Yükleniyor…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Yönetim Paneli</h1>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border bg-white dark:bg-secondary-800 dark:border-secondary-700"><div className="text-sm text-gray-500">Kullanıcı</div><div className="text-2xl font-semibold">{stats.totalUsers}</div></div>
          <div className="p-4 rounded-lg border bg-white dark:bg-secondary-800 dark:border-secondary-700"><div className="text-sm text-gray-500">İlan</div><div className="text-2xl font-semibold">{stats.totalAds}</div></div>
          <div className="p-4 rounded-lg border bg-white dark:bg-secondary-800 dark:border-secondary-700"><div className="text-sm text-gray-500">Mesaj</div><div className="text-2xl font-semibold">{stats.totalMessages}</div></div>
          <div className="p-4 rounded-lg border bg-white dark:bg-secondary-800 dark:border-secondary-700"><div className="text-sm text-gray-500">Favori</div><div className="text-2xl font-semibold">{stats.totalFavorites}</div></div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


