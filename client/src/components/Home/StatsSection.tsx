import React, { useEffect, useState } from 'react';
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';
import { statsAPI } from '../../services/api';

interface StatsData {
  totalAds: number;
  totalUsers: number;
  totalMessages: number;
  totalFavorites: number;
}

const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalAds: 0,
    totalUsers: 0,
    totalMessages: 0,
    totalFavorites: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await statsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to demo data if API fails
      setStats({
        totalAds: 1247,
        totalUsers: 342,
        totalMessages: 856,
        totalFavorites: 423
      });
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      title: 'Toplam İlan',
      value: stats.totalAds,
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Aktif Kullanıcı',
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Mesaj Sayısı',
      value: stats.totalMessages,
      icon: ChatBubbleLeftRightIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Favori Sayısı',
      value: stats.totalFavorites,
      icon: HeartIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  if (loading) {
    return (
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                  <div className="ml-4">
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Platform İstatistikleri
          </h2>
          <p className="text-lg text-gray-600">
            Uludağ Üniversitesi öğrenci topluluğumuzun büyüklüğü
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${item.bgColor}`}>
                    <Icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {item.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {item.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
