import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI, adsAPI } from '../../services/api';
import { Ad } from '../../types';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { 
  DocumentTextIcon, 
  BookOpenIcon, 
  WrenchScrewdriverIcon,
  DocumentIcon,
  LightBulbIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const MyAds: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const fetchMyAds = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching my ads with params:', { page: pagination.page, limit: pagination.limit });
      const response = await userAPI.getUserAds({ page: pagination.page, limit: pagination.limit });
      console.log('API Response:', response.data);
      console.log('Ads from API:', response.data.data);
      console.log('Ads length:', response.data.data?.length);
      setAds(response.data.data || []);
      setPagination(response.data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
      console.log('Ads state set to:', response.data.data || []);
    } catch (error) {
      console.error('Error fetching my ads:', error);
      setAds([]);
      showError('Hata', 'İlanlarınız yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, showError]);

  useEffect(() => {
    console.log('MyAds component mounted, fetching ads...');
    fetchMyAds();
  }, [fetchMyAds]);

  const handleEdit = (adId: string) => {
    // Şimdilik detay sayfasına yönlendir
    // TODO: Edit page oluşturulacak
    navigate(`/ads/${adId}`);
  };

  const handleDelete = async (adId: string) => {
    if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setDeletingId(adId);
      await adsAPI.deleteAd(adId);
      showSuccess('İlan başarıyla silindi');
      // İlanları yeniden yükle
      fetchMyAds();
    } catch (error: any) {
      console.error('Delete ad error:', error);
      const errorMessage = error.response?.data?.message || 'İlan silinirken hata oluştu';
      showError('Hata', errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'notes':
        return <DocumentTextIcon className="h-6 w-6" />;
      case 'books':
        return <BookOpenIcon className="h-6 w-6" />;
      case 'equipment':
        return <WrenchScrewdriverIcon className="h-6 w-6" />;
      case 'projects':
        return <LightBulbIcon className="h-6 w-6" />;
      default:
        return <DocumentIcon className="h-6 w-6" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'notes':
        return 'Ders Notları';
      case 'books':
        return 'Kitaplar';
      case 'equipment':
        return 'Ekipman';
      case 'projects':
        return 'Proje Materyalleri';
      default:
        return category;
    }
  };

  const getShareTypeLabel = (shareType: string) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktif</span>;
      case 'INACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Pasif</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  console.log('Rendering MyAds with ads:', ads);
  console.log('Ads length in render:', ads.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">İlanlarım</h1>
        <p className="mt-2 text-gray-600">Oluşturduğunuz ilanları buradan yönetebilirsiniz.</p>
      </div>

      {ads.length === 0 ? (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Henüz ilan yok</h3>
          <p className="mt-1 text-sm text-gray-500">İlk ilanınızı oluşturmak için başlayın.</p>
          <div className="mt-6">
            <Link
              to="/ads/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              İlan Oluştur
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-gray-200 dark:border-secondary-700 overflow-hidden hover:shadow-md transition-shadow">
                {ad.fileUrl && (
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={ad.fileUrl}
                      alt={ad.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-primary-600">
                      {getCategoryIcon(ad.category)}
                      <span className="ml-2 text-sm font-medium">
                        {getCategoryLabel(ad.category)}
                      </span>
                    </div>
                    {getStatusBadge(ad.status)}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {ad.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {ad.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {getShareTypeLabel(ad.shareType)}
                    </span>
                    <span>{new Date(ad.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/ads/${ad.id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-secondary-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-700"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Görüntüle
                    </Link>
                    <button
                      onClick={() => handleEdit(ad.id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-secondary-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-700"
                      title="Düzenle"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      disabled={deletingId === ad.id}
                      className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-800 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-secondary-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Sil"
                    >
                      {deletingId === ad.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex space-x-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pagination.page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyAds;
