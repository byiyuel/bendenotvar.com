import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adsAPI } from '../../services/api';
import { Ad } from '../../types';
import { 
  DocumentTextIcon, 
  BookOpenIcon, 
  WrenchScrewdriverIcon,
  DocumentIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const RecentAds: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRecentAds();
  }, []);

  const fetchRecentAds = async () => {
    try {
      const response = await adsAPI.getAds({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' });
      setAds(response.data.data || []); // Fallback to empty array if data is undefined
    } catch (error) {
      console.error('Error fetching recent ads:', error);
      setAds([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Not':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'Kitap':
        return <BookOpenIcon className="h-5 w-5" />;
      case 'Ekipman':
        return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case 'PDF':
        return <DocumentIcon className="h-5 w-5" />;
      case 'Proje':
        return <LightBulbIcon className="h-5 w-5" />;
      case 'Acil':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Not':
        return 'bg-blue-100 text-blue-800';
      case 'Kitap':
        return 'bg-green-100 text-green-800';
      case 'Ekipman':
        return 'bg-yellow-100 text-yellow-800';
      case 'PDF':
        return 'bg-purple-100 text-purple-800';
      case 'Proje':
        return 'bg-indigo-100 text-indigo-800';
      case 'Acil':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getShareTypeText = (shareType: string) => {
    switch (shareType) {
      case 'BORROW':
        return 'Ödünç';
      case 'PERMANENT':
        return 'Kalıcı';
      case 'DIGITAL':
        return 'Dijital';
      default:
        return shareType;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Az önce';
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} gün önce`;
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">İlanlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Son Eklenen İlanlar
          </h2>
          <p className="text-lg text-gray-600">
            Kampüsteki en güncel paylaşımları keşfedin
          </p>
        </div>

        {!ads || ads.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz ilan yok</h3>
            <p className="mt-1 text-sm text-gray-500">
              İlk ilanı ekleyerek başlayın!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads && ads.map((ad) => (
              <div key={ad.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(ad.category)}`}>
                        {getCategoryIcon(ad.category)}
                        <span className="ml-1">{ad.category}</span>
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(ad.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {ad.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {ad.description}
                  </p>

                  {/* Share Type */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      {getShareTypeText(ad.shareType)}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {ad.user.firstName[0]}{ad.user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {ad.user.firstName} {ad.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ad.user.department}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <HeartIcon className="h-4 w-4" />
                        <span>{ad._count.favorites}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        <span>{ad._count.conversations}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/ads/${ad.id}`}
                      className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      Detayları Gör
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/ads"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Tüm İlanları Görüntüle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentAds;

