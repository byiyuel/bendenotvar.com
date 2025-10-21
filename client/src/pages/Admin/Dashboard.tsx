import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/Layout/AdminLayout';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{ totalUsers: number; totalAds: number; totalMessages: number; totalFavorites: number; pendingAdsCount?: number; recentUsers?: Array<{id:string;firstName:string;lastName:string;email:string;createdAt:string}>; recentAds?: Array<{id:string;title:string;createdAt:string}> } | null>(null);
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
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Genel Bakış</h1>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-white dark:bg-secondary-800 dark:border-secondary-700"><div className="text-sm text-gray-500">Kullanıcı</div><div className="text-2xl font-semibold">{stats.totalUsers}</div></div>
            <div className="p-4 rounded-lg border bg-white dark:bg-secondary-800 dark:border-secondary-700"><div className="text-sm text-gray-500">İlan</div><div className="text-2xl font-semibold">{stats.totalAds}</div></div>
            <div className="p-4 rounded-lg border bg-white dark:bg-secondary-800 dark:border-secondary-700"><div className="text-sm text-gray-500">Mesaj</div><div className="text-2xl font-semibold">{stats.totalMessages}</div></div>
            <div className="p-4 rounded-lg border bg-white dark:bg-secondary-800 dark:border-secondary-700"><div className="text-sm text-gray-500">Favori</div><div className="text-2xl font-semibold">{stats.totalFavorites}</div></div>
          </div>
        )}

        {stats?.pendingAdsCount !== undefined && (
          <div className="mt-6">
            <a href="/admin/moderation" className="block p-4 rounded-lg border bg-white dark:bg-secondary-800 dark:border-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Onay Bekleyen İlanlar</div>
                <div className="text-xl font-semibold">{stats.pendingAdsCount}</div>
              </div>
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-4 rounded-lg border bg-white dark:bg-secondary-800 dark:border-secondary-700">
            <div className="font-medium mb-3">Son Kayıt Olan Kullanıcılar</div>
            <ul className="space-y-2">
              {stats?.recentUsers?.map(u => (
                <li key={u.id} className="flex justify-between text-sm">
                  <span>{u.firstName} {u.lastName}</span>
                  <span className="text-gray-500">{new Date(u.createdAt).toLocaleDateString('tr-TR')}</span>
                </li>
              )) || <li className="text-sm text-gray-500">Veri yok</li>}
            </ul>
          </div>
          <div className="p-4 rounded-lg border bg-white dark:bg-secondary-800 dark:border-secondary-700">
            <div className="font-medium mb-3">Son Eklenen İlanlar</div>
            <ul className="space-y-2">
              {stats?.recentAds?.map(a => (
                <li key={a.id} className="flex justify-between text-sm">
                  <span>{a.title}</span>
                  <span className="text-gray-500">{new Date(a.createdAt).toLocaleDateString('tr-TR')}</span>
                </li>
              )) || <li className="text-sm text-gray-500">Veri yok</li>}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;


