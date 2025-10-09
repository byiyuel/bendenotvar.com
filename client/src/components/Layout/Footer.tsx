import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              bendenotvar
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Uludağ Üniversitesi öğrencilerinin ders notları, kitaplar, ekipman ve proje materyallerini 
              güvenli ve hızlı bir şekilde paylaşmasını sağlayan modern web platformu.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Hızlı Linkler
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                  Ana Sayfa
                </a>
              </li>
              <li>
                <a href="/ads" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                  Tüm İlanlar
                </a>
              </li>
              <li>
                <a href="/ads/create" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                  İlan Ekle
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                  Hakkımızda
                </a>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              İletişim
            </h4>
            <ul className="space-y-2">
              <li className="text-gray-600 text-sm">
                Uludağ Üniversitesi
              </li>
              <li className="text-gray-600 text-sm">
                Görükle Kampüsü
              </li>
              <li className="text-gray-600 text-sm">
                Nilüfer/Bursa
              </li>
              <li className="text-gray-600 text-sm">
                <a href="mailto:info@bendenotvar.com" className="hover:text-primary-600 transition-colors">
                  info@bendenotvar.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 bendenotvar. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">
                Gizlilik Politikası
              </a>
              <a href="/terms" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">
                Kullanım Şartları
              </a>
              <a href="/contact" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">
                İletişim
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


