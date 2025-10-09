import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adsAPI } from '../../services/api';
import { Ad, FilterOptions } from '../../types';
import SearchBar from '../../components/Search/SearchBar';
import AdvancedFilters from '../../components/Search/AdvancedFilters';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { 
  DocumentTextIcon, 
  BookOpenIcon, 
  WrenchScrewdriverIcon,
  DocumentIcon,
  LightBulbIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Ads: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const { showError } = useToast();

  // Filter options
  const categories = [
    { label: 'Ders Notları', value: 'notes' },
    { label: 'Kitaplar', value: 'books' },
    { label: 'Ekipman', value: 'equipment' },
    { label: 'Proje Materyalleri', value: 'projects' }
  ];

  const shareTypes = [
    { label: 'Ödünç', value: 'BORROW' },
    { label: 'Kalıcı', value: 'PERMANENT' },
    { label: 'Dijital', value: 'DIGITAL' }
  ];

  const sortOptions = [
    { label: 'Tarih', value: 'createdAt' },
    { label: 'Başlık', value: 'title' },
    { label: 'Kategori', value: 'category' }
  ];

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const searchFilters = { ...filters };
      if (searchQuery) {
        searchFilters.search = searchQuery;
      }
      const response = await adsAPI.getAds(searchFilters);
      setAds(response.data.data || []); // Fallback to empty array if data is undefined
      setPagination(response.data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
    } catch (error) {
      console.error('Error fetching ads:', error);
      setAds([]); // Set empty array on error
      showError('Hata', 'İlanlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, showError]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'notes':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'books':
        return <BookOpenIcon className="h-4 w-4" />;
      case 'equipment':
        return <WrenchScrewdriverIcon className="h-4 w-4" />;
      case 'projects':
        return <LightBulbIcon className="h-4 w-4" />;
      default:
        return <DocumentIcon className="h-4 w-4" />;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 dark:text-gray-100">
          Tüm İlanlar
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Kampüsteki tüm paylaşımları keşfedin
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 dark:bg-secondary-900 dark:border-secondary-800">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <SearchBar
              placeholder="İlanlarda ara..."
              onSearch={handleSearch}
              className="w-full"
            />
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters
            categories={categories}
            shareTypes={shareTypes}
            sortOptions={sortOptions}
            onFiltersChange={handleFiltersChange}
            className="flex-shrink-0"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : !ads || ads.length === 0 ? (
        <div className="text-center py-20">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-gray-100">
            İlan bulunamadı
          </h3>
          <p className="text-gray-500 mb-6 dark:text-gray-400">
            Arama kriterlerinize uygun ilan bulunmuyor.
          </p>
          <Link
            to="/ads/create"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            İlk İlanı Siz Ekleyin
          </Link>
        </div>
      ) : (
        <>
          {/* Results Info */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {pagination.total} sonuçtan {((pagination.page - 1) * pagination.limit) + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} arası gösteriliyor
            </p>
          </div>

          {/* Ads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {ads && ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-primary-200 transition-all duration-200 dark:bg-secondary-900 dark:border-secondary-800"
              >
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${getCategoryColor(ad.category)}`}>
                      {getCategoryIcon(ad.category)}
                      {ad.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {formatDate(ad.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 dark:text-gray-100">
                    {ad.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 dark:text-gray-300">
                    {ad.description}
                  </p>

                  {/* Share Type */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-primary-600">
                      {getShareTypeText(ad.shareType)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {ad.user?.firstName} {ad.user?.lastName}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/ads/${ad.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Detayları Gör
                    </Link>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <HeartIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-secondary-900 dark:text-gray-400 dark:border-secondary-800 dark:hover:bg-secondary-800"
                >
                  Önceki
                </button>

                {/* Page numbers */}
                {[...Array(pagination.pages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pagination.page
                          ? 'text-primary-600 bg-primary-50 border border-primary-300'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-secondary-900 dark:text-gray-400 dark:border-secondary-800 dark:hover:bg-secondary-800'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-secondary-900 dark:text-gray-400 dark:border-secondary-800 dark:hover:bg-secondary-800"
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

export default Ads;

