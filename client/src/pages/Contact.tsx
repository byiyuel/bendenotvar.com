import React, { useEffect } from 'react';
import { 
  EnvelopeIcon, 
  MapPinIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

const Contact: React.FC = () => {
  useEffect(() => {
    document.title = 'İletişim | bendenotvar';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              İletişim
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Sorularınız, önerileriniz veya sorunlarınız için bizimle iletişime geçebilirsiniz.
            </p>

            <div className="space-y-8">
              {/* İletişim Bilgileri */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  İletişim Bilgileri
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* E-posta */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-secondary-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <EnvelopeIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                        E-posta
                      </h3>
                      <a 
                        href="mailto:info@bendenotvar.com" 
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                      >
                        info@bendenotvar.com
                      </a>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        7/24 destek
                      </p>
                    </div>
                  </div>

                  {/* Adres */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-secondary-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <MapPinIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Adres
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Uludağ Üniversitesi<br />
                        Görükle Kampüsü<br />
                        Nilüfer, Bursa
                      </p>
                    </div>
                  </div>

                  {/* Platform İçi Mesajlaşma */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-secondary-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Platform İçi Destek
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Giriş yaparak platform içinden mesaj gönderebilirsiniz
                      </p>
                    </div>
                  </div>

                  {/* Sosyal Medya */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-secondary-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Sosyal Medya
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        @bendenotvar
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        (Yakında aktif olacak)
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Sık Sorulan Sorular */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Sık Sorulan Sorular
                </h2>
                
                <div className="space-y-4">
                  <details className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-4 group">
                    <summary className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer list-none flex items-center justify-between">
                      <span>Platforma nasıl kayıt olabilirim?</span>
                      <span className="text-primary-600 dark:text-primary-400">+</span>
                    </summary>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      Uludağ Üniversitesi öğrenci veya personel e-posta adresiniz (@ogr.uludag.edu.tr veya @uludag.edu.tr) 
                      ile kayıt olabilirsiniz. Kayıt olduktan sonra e-posta doğrulaması yapmanız gerekir.
                    </p>
                  </details>

                  <details className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-4">
                    <summary className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer list-none flex items-center justify-between">
                      <span>İlan nasıl oluşturabilirim?</span>
                      <span className="text-primary-600 dark:text-primary-400">+</span>
                    </summary>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      Giriş yaptıktan sonra "İlan Ekle" butonuna tıklayarak ilan oluşturabilirsiniz. 
                      Başlık, açıklama, kategori ve paylaşım türü seçerek ilanınızı yayınlayabilirsiniz.
                    </p>
                  </details>

                  <details className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-4">
                    <summary className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer list-none flex items-center justify-between">
                      <span>Güvenli mi?</span>
                      <span className="text-primary-600 dark:text-primary-400">+</span>
                    </summary>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      Evet! Sadece Uludağ Üniversitesi e-posta adresleri ile kayıt olunabilir. 
                      Tüm verileriniz şifreli olarak saklanır ve SSL ile korunur. Mesajlaşmalar platform içindedir.
                    </p>
                  </details>

                  <details className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-4">
                    <summary className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer list-none flex items-center justify-between">
                      <span>Uygunsuz içerik nasıl bildiririm?</span>
                      <span className="text-primary-600 dark:text-primary-400">+</span>
                    </summary>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      Her ilan detay sayfasında "Şikayet Et" butonu bulunur. Uygunsuz içerikleri buradan bildirebilirsiniz. 
                      Ayrıca info@bendenotvar.com adresine mail atabilirsiniz.
                    </p>
                  </details>

                  <details className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-4">
                    <summary className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer list-none flex items-center justify-between">
                      <span>Hesabımı nasıl silebilirim?</span>
                      <span className="text-primary-600 dark:text-primary-400">+</span>
                    </summary>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      Profil ayarlarından "Hesabı Sil" butonunu kullanabilirsiniz. 
                      Veya info@bendenotvar.com adresine mail atarak hesap silme talebinde bulunabilirsiniz.
                    </p>
                  </details>

                  <details className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-4">
                    <summary className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer list-none flex items-center justify-between">
                      <span>Ücretli mi?</span>
                      <span className="text-primary-600 dark:text-primary-400">+</span>
                    </summary>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      Hayır! bendenotvar tamamen ücretsiz bir platformdur. Kayıt, ilan oluşturma ve mesajlaşma gibi 
                      tüm özellikler ücretsizdir.
                    </p>
                  </details>
                </div>
              </section>

              {/* İletişim Formu Bilgilendirmesi */}
              <section className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  💬 Bize Ulaşın
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Sorunuz, öneriniz veya geri bildiriminiz için e-posta gönderebilirsiniz. 
                  En kısa sürede size dönüş yapacağız.
                </p>
                <a 
                  href="mailto:info@bendenotvar.com?subject=İletişim%20-%20bendenotvar"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
                >
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  E-posta Gönder
                </a>
              </section>

              {/* Destek Saatleri */}
              <section className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>
                  Destek ekibimiz hafta içi 09:00 - 18:00 saatleri arasında aktiftir.
                </p>
                <p className="mt-2">
                  Acil durumlar için: <a href="mailto:info@bendenotvar.com" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">info@bendenotvar.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Contact;

