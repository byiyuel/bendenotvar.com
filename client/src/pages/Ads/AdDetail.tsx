import React, { useState, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adsAPI, favoritesAPI, messagesAPI } from '../../services/api';
import { Ad } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  DocumentTextIcon, 
  BookOpenIcon, 
  WrenchScrewdriverIcon,
  DocumentIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  MapPinIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const AdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [deletingAd, setDeletingAd] = useState(false);

  // İlan sahibi kontrolü
  const isOwner = user && ad && user.id === ad.user.id;

  const fetchAd = useCallback(async () => {
    try {
      const response = await adsAPI.getAd(id!);
      setAd(response.data);
    } catch (error) {
      console.error('Error fetching ad:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const response = await favoritesAPI.checkFavoriteStatus(id!);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }, [id]);

  const handleSendMessage = useCallback(async () => {
    if (!ad || !isAuthenticated) return;
    
    try {
      setMessageLoading(true);
      await messagesAPI.createConversation(ad.id, ad.user.id);
      showSuccess('Başarılı', 'Mesaj sayfasına yönlendiriliyorsunuz...');
      navigate('/messages');
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      const errorMessage = error.response?.data?.message || 'Mesaj gönderilirken hata oluştu';
      showError('Hata', errorMessage);
    } finally {
      setMessageLoading(false);
    }
  }, [ad, isAuthenticated, navigate, showSuccess, showError]);

  const handleEdit = () => {
    if (ad) {
      navigate(`/ads/${ad.id}`);
      // TODO: Edit page oluşturulacak
    }
  };

  const handleDelete = async () => {
    if (!ad) return;
    
    if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      setDeletingAd(true);
      await adsAPI.deleteAd(ad.id);
      showSuccess('İlan başarıyla silindi');
      navigate('/my-ads');
    } catch (error: any) {
      console.error('Delete ad error:', error);
      const errorMessage = error.response?.data?.message || 'İlan silinirken hata oluştu';
      showError('Hata', errorMessage);
    } finally {
      setDeletingAd(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAd();
    }
  }, [id, fetchAd]);

  useEffect(() => {
    if (isAuthenticated && ad) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, ad, checkFavoriteStatus]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) return;
    
    setFavoriteLoading(true);
    try {
      const response = await favoritesAPI.toggleFavorite(id!);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Not':
        return <DocumentTextIcon className="h-6 w-6" />;
      case 'Kitap':
        return <BookOpenIcon className="h-6 w-6" />;
      case 'Ekipman':
        return <WrenchScrewdriverIcon className="h-6 w-6" />;
      case 'PDF':
        return <DocumentIcon className="h-6 w-6" />;
      case 'Proje':
        return <LightBulbIcon className="h-6 w-6" />;
      case 'Acil':
        return <ExclamationTriangleIcon className="h-6 w-6" />;
      default:
        return <DocumentTextIcon className="h-6 w-6" />;
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
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">İlan yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">İlan bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Aradığınız ilan mevcut değil veya silinmiş olabilir.
          </p>
          <div className="mt-6">
            <Link
              to="/ads"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Tüm İlanları Görüntüle
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/" className="text-gray-400 hover:text-gray-500">
              Ana Sayfa
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link to="/ads" className="ml-4 text-gray-400 hover:text-gray-500">
                İlanlar
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-4 text-gray-500 dark:text-gray-400">İlan Detayı</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6 dark:bg-secondary-900 dark:border-secondary-800">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(ad.category)}`}>
                  {getCategoryIcon(ad.category)}
                  <span className="ml-2">{ad.category}</span>
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                  {getShareTypeText(ad.shareType)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(ad.createdAt)}
                </span>
                {isAuthenticated && isOwner && (
                  <>
                    {/* Owner Butonları */}
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-secondary-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-700"
                      title="İlanı Düzenle"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Düzenle
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deletingAd}
                      className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-800 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-secondary-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="İlanı Sil"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      {deletingAd ? 'Siliniyor...' : 'Sil'}
                    </button>
                  </>
                )}
                {isAuthenticated && !isOwner && (
                  <>
                    {/* Diğer Kullanıcılar için Butonlar */}
                    <button
                      onClick={toggleFavorite}
                      disabled={favoriteLoading}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors dark:hover:bg-secondary-800"
                      title="Favorilere ekle"
                    >
                      {isFavorite ? (
                        <HeartSolidIcon className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={messageLoading}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors dark:hover:bg-secondary-800"
                      title="Mesaj gönder"
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 dark:text-gray-100">
              {ad.title}
            </h1>

            {/* Description */}
            <div className="prose max-w-none mb-6 dark:prose-invert">
              <div
                className="text-gray-700 leading-relaxed dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ad.description || '') }}
              />
            </div>

            {/* File */}
            {ad.fileUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-gray-100">Ek Dosya</h3>
                <a
                  href={ad.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-secondary-900 dark:text-gray-200 dark:border-secondary-800 dark:hover:bg-secondary-800"
                >
                  <DocumentIcon className="h-4 w-4 mr-2" />
                  Dosyayı İndir
                </a>
              </div>
            )}

            {/* Location */}
            {ad.locationDetails && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-gray-100">Konum</h3>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  {ad.locationDetails}
                </div>
              </div>
            )}

            {/* WhatsApp Link */}
            {ad.whatsappLink && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-gray-100">WhatsApp</h3>
                <a
                  href={ad.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  WhatsApp'ta Mesaj Gönder
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 dark:bg-secondary-900 dark:border-secondary-800">
            <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">İlan Sahibi</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center dark:bg-secondary-800">
                <span className="text-lg font-medium text-primary-600 dark:text-primary-400">
                  {ad.user.firstName[0]}{ad.user.lastName[0]}
                </span>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {ad.user.firstName} {ad.user.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {ad.user.department}
                </p>
                {ad.user.faculty && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {ad.user.faculty}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-4 dark:text-gray-400">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Üye olma: {new Date(ad.user.createdAt).toLocaleDateString('tr-TR')}
            </div>
            {isAuthenticated && user?.id !== ad.user.id && (
              <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
                <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-2" />
                Mesaj Gönder
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm border p-6 dark:bg-secondary-900 dark:border-secondary-800">
            <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">İstatistikler</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HeartIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Favoriler</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {ad._count.favorites}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Mesajlar</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {ad._count.conversations}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetail;


