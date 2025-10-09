import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpenIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Hero: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-secondary-900 dark:via-secondary-900 dark:to-secondary-800">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary-300/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight dark:text-gray-100">
            bendenotvar
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto dark:text-gray-300">
            Uludağ Üniversitesi öğrencileri için kampüs içi paylaşım platformu. 
            Ders notları, kitaplar, ekipman ve proje materyallerini güvenli bir şekilde paylaşın.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {isAuthenticated ? (
              <>
                <Link
                  to="/ads/create"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md btn-ios-primary"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  İlan Ekle
                </Link>
                <Link
                  to="/ads"
                  className="inline-flex items-center px-8 py-3 border border-gray-200 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors dark:bg-secondary-800 dark:text-gray-200 dark:border-secondary-700 dark:hover:bg-secondary-700"
                >
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  İlanları Görüntüle
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
                >
                  Hemen Başla
                </Link>
                <Link
                  to="/ads"
                  className="inline-flex items-center px-8 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors shadow-sm dark:bg-secondary-900 dark:hover:bg-secondary-800"
                >
                  İlanları İncele
                </Link>
              </>
            )}
          </div>

          {/* Özellikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-gray-100">
                Güvenli Platform
              </h3>
              <p className="text-gray-600 text-sm dark:text-gray-300">
                Sadece @ogr.uludag.edu.tr ve @uludag.edu.tr email adresleri ile kayıt olabilirsiniz.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-gray-100">
                Dahili Mesajlaşma
              </h3>
              <p className="text-gray-600 text-sm dark:text-gray-300">
                Platform üzerinden güvenli ve hızlı iletişim kurun.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <ClockIcon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-gray-100">
                Hızlı Erişim
              </h3>
              <p className="text-gray-600 text-sm dark:text-gray-300">
                Aradığınız materyalleri kolayca bulun ve paylaşın.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;


