import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { favoritesAPI } from '../../services/api';
import { Favorite } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import { 
  HeartIcon,
  XMarkIcon,
  DocumentTextIcon, 
  BookOpenIcon, 
  WrenchScrewdriverIcon,
  DocumentIcon,
  LightBulbIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const { showSuccess, showError } = useToast();

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await favoritesAPI.getFavorites({ page: pagination.page, limit: pagination.limit });
      setFavorites(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      showError('Hata', 'Favoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, showError]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (adId: string) => {
    setRemovingId(adId);
    try {
      await favoritesAPI.removeFavorite(adId);
      setFavorites(prev => prev.filter(fav => fav.ad.id !== adId));
      showSuccess('Başarılı', 'Favori listesinden kaldırıldı');
    } catch (error) {
      console.error('Error removing favorite:', error);
      showError('Hata', 'Favori kaldırılırken bir hata oluştu');
    } finally {
      setRemovingId(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'notes':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'books':
        return <BookOpenIcon className="h-5 w-5" />;
      case 'equipment':
        return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case 'projects':
        return <LightBulbIcon className="h-5 w-5" />;
      default:
        return <DocumentIcon className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'notes':
        return 'bg-blue-100 text-blue-800';
      case 'books':
        return 'bg-green-100 text-green-800';
      case 'equipment':
        return 'bg-yellow-100 text-yellow-800';
      case 'projects':
        return 'bg-purple-100 text-purple-800';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Favorilerim
        </h1>
        <p className="text-lg text-gray-600">
          Beğendiğiniz ilanları burada bulabilirsiniz
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <HeartSolidIcon className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Toplam {favorites.length} favori
              </h3>
              <p className="text-sm text-gray-600">
                Bu ilanları daha sonra kolayca bulabilirsiniz
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz favori ilan yok
          </h3>
          <p className="text-gray-500 mb-6">
            Beğendiğiniz ilanları kalp butonuna tıklayarak favorilerinize ekleyebilirsiniz.
          </p>
          <Link
            to="/ads"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            İlanları Keşfet
          </Link>
        </div>
      ) : (
        <>
          {/* Favorites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFavorite(favorite.ad.id)}
                  disabled={removingId === favorite.ad.id}
                  className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full shadow-sm border border-gray-200 hover:border-red-300"
                  title="Favorilerden kaldır"
                >
                  {removingId === favorite.ad.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <XMarkIcon className="h-4 w-4" />
                  )}
                </button>

                <div className="p-6">
                  {/* Category Badge & Date */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${getCategoryColor(favorite.ad.category)}`}>
                      {getCategoryIcon(favorite.ad.category)}
                      {favorite.ad.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {formatDate(favorite.ad.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {favorite.ad.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {favorite.ad.description}
                  </p>

                  {/* Share Type & User */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-primary-600">
                      {getShareTypeText(favorite.ad.shareType)}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {favorite.ad.user?.firstName} {favorite.ad.user?.lastName}
                    </div>
                  </div>

                  {/* Favorite Date */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <HeartSolidIcon className="h-3 w-3 text-red-500" />
                      {formatDate(favorite.createdAt)} favorilere eklendi
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/ads/${favorite.ad.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Detayları Gör
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <HeartIcon className="h-3 w-3" />
                        {favorite.ad._count?.favorites || 0}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <ChatBubbleLeftRightIcon className="h-3 w-3" />
                        {favorite.ad._count?.conversations || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {/* Previous button */}
                <button
                  onClick={() => {
                    if (pagination.page > 1) {
                      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                      fetchFavorites();
                    }
                  }}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>

                {/* Page numbers */}
                {[...Array(pagination.pages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => {
                        setPagination(prev => ({ ...prev, page }));
                        fetchFavorites();
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pagination.page
                          ? 'text-primary-600 bg-primary-50 border border-primary-300'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next button */}
                <button
                  onClick={() => {
                    if (pagination.page < pagination.pages) {
                      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                      fetchFavorites();
                    }
                  }}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;

