import React, { useEffect } from 'react';

const Terms: React.FC = () => {
  useEffect(() => {
    document.title = 'Kullanım Şartları | bendenotvar';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Kullanım Şartları
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Son Güncellenme: 20 Ekim 2025
            </p>

            <div className="space-y-8 text-gray-700 dark:text-gray-300">
              {/* 1. Genel Hükümler */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  1. Genel Hükümler
                </h2>
                <p className="leading-relaxed mb-4">
                  bendenotvar ("Platform"), Uludağ Üniversitesi öğrencilerinin ders notları, kitaplar, 
                  ekipman ve proje materyallerini paylaşmasını sağlayan bir web platformudur. 
                  Platformu kullanarak bu kullanım şartlarını kabul etmiş sayılırsınız.
                </p>
                <p className="leading-relaxed">
                  Bu şartları kabul etmiyorsanız, platformu kullanmamanızı rica ederiz.
                </p>
              </section>

              {/* 2. Üyelik ve Hesap */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  2. Üyelik ve Hesap Oluşturma
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      2.1. Üyelik Şartları
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>18 yaş ve üzeri olmalısınız</li>
                      <li>Uludağ Üniversitesi öğrenci veya personel e-posta adresiniz olmalıdır (@ogr.uludag.edu.tr veya @uludag.edu.tr)</li>
                      <li>Doğru ve güncel bilgiler vermelisiniz</li>
                      <li>Bir kişi yalnızca bir hesap oluşturabilir</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      2.2. Hesap Güvenliği
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Şifrenizi kimseyle paylaşmamalısınız</li>
                      <li>Hesabınızdan gerçekleşen tüm aktivitelerden siz sorumlusunuz</li>
                      <li>Hesabınızın yetkisiz kullanımını derhal bildirmelisiniz</li>
                      <li>Güçlü bir şifre kullanmanız önerilir</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      2.3. Hesap Askıya Alma ve Silme
                    </h3>
                    <p className="mb-2">
                      Platform yönetimi, şu durumlarda hesabınızı askıya alabilir veya silebilir:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Kullanım şartlarının ihlali</li>
                      <li>Yasadışı içerik paylaşımı</li>
                      <li>Diğer kullanıcılara zarar verici davranışlar</li>
                      <li>Sahte bilgilerle kayıt olma</li>
                      <li>Spam veya kötü amaçlı aktiviteler</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 3. İlan ve İçerik Paylaşımı */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  3. İlan ve İçerik Paylaşımı
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      3.1. İzin Verilen İçerikler
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Ders notları ve ders materyalleri</li>
                      <li>Ders kitapları (telif hakkı ihlali olmayan)</li>
                      <li>Laboratuvar ve ekipman paylaşımı</li>
                      <li>Proje dosyaları ve akademik çalışmalar</li>
                      <li>Dijital içerikler (yasal olarak paylaşılabilir olanlar)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      3.2. Yasak İçerikler
                    </h3>
                    <p className="mb-2 text-red-600 dark:text-red-400 font-medium">
                      Aşağıdaki içeriklerin paylaşılması kesinlikle yasaktır:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Telif hakkı ihlali yapan içerikler</li>
                      <li>Sınav soruları ve cevapları (kopya teşvik eden)</li>
                      <li>Uygunsuz, müstehcen veya pornografik içerikler</li>
                      <li>Nefret söylemi, ayrımcılık ve şiddet içeren içerikler</li>
                      <li>Yanıltıcı, aldatıcı veya dolandırıcılık amaçlı içerikler</li>
                      <li>Kişisel bilgileri izinsiz paylaşan içerikler</li>
                      <li>Ticari reklam ve spam içerikler</li>
                      <li>Yasadışı aktivitelere teşvik eden içerikler</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      3.3. İçerik Sorumluluğu
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Paylaştığınız içeriklerden tamamen siz sorumlusunuz</li>
                      <li>Platform, içeriklerin doğruluğunu garanti etmez</li>
                      <li>Telif hakkı ihlallerinden kullanıcı sorumludur</li>
                      <li>Platform, uygunsuz içerikleri bildirimsiz kaldırma hakkına sahiptir</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 4. Kullanım Kuralları */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  4. Platform Kullanım Kuralları
                </h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Kullanıcılar platformda:
                  </h3>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">✅ Yapabilir:</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Akademik amaçlı içerik paylaşabilir</li>
                      <li>İlan oluşturabilir ve düzenleyebilir</li>
                      <li>Diğer kullanıcılarla iletişime geçebilir</li>
                      <li>Favorilere ekleyebilir ve takip edebilir</li>
                      <li>Uygunsuz içerikleri bildirebilir</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">❌ Yapamaz:</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Platform güvenliğini tehdit edemez</li>
                      <li>Otomatik bot veya script kullanamaz</li>
                      <li>Diğer kullanıcıların hesaplarına yetkisiz erişim sağlayamaz</li>
                      <li>Sahte hesap oluşturamaz</li>
                      <li>Spam veya kötü amaçlı mesaj gönderemez</li>
                      <li>Platformun kodlarını kopyalayamaz veya tersine mühendislik yapamaz</li>
                      <li>Platformu ticari amaçla kullanamaz (izinsiz)</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 5. Mesajlaşma ve İletişim */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  5. Mesajlaşma ve İletişim Kuralları
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Mesajlaşma yalnızca platform üzerinden yapılmalıdır</li>
                  <li>Kişisel bilgilerinizi (telefon, adres vb.) paylaşırken dikkatli olun</li>
                  <li>Taciz, tehdit veya rahatsız edici mesajlar yasaktır</li>
                  <li>Spam mesaj gönderilmesi yasaktır</li>
                  <li>Ticari amaçlı toplu mesaj gönderilemez</li>
                  <li>Uygunsuz mesajları "Şikayet Et" butonu ile bildirebilirsiniz</li>
                </ul>
              </section>

              {/* 6. Fikri Mülkiyet Hakları */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  6. Fikri Mülkiyet Hakları ve Telif Hakkı
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      6.1. Platform Mülkiyeti
                    </h3>
                    <p>
                      bendenotvar platformunun tasarımı, logosu, kaynak kodları ve tüm içeriği 
                      platform sahiplerinin mülkiyetindedir ve telif hakkı yasalarıyla korunmaktadır.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      6.2. Kullanıcı İçerikleri
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Paylaştığınız içeriklerin telif hakkı size aittir</li>
                      <li>Platformda paylaşarak, içeriğin platformda gösterilmesi için lisans vermiş olursunuz</li>
                      <li>Platform, içerikleri kopyalamaz veya başka yerde kullanmaz</li>
                      <li>İçeriklerinizi istediğiniz zaman silebilirsiniz</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      6.3. Telif Hakkı İhlali Bildirimi
                    </h3>
                    <p className="mb-2">
                      Telif hakkınızın ihlal edildiğini düşünüyorsanız:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>İhlal eden içeriğin linkini belirtin</li>
                      <li>Telif hakkı belgelerinizi gönderin</li>
                      <li>İletişim bilgilerinizi ekleyin</li>
                      <li>
                        <a href="mailto:info@bendenotvar.com" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                          info@bendenotvar.com
                        </a> adresine başvurun
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 7. Sorumluluk Reddi */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  7. Sorumluluk Reddi
                </h2>
                <div className="space-y-4">
                  <p className="font-medium">
                    Platform "olduğu gibi" sunulmaktadır ve hiçbir garanti verilmemektedir:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Platform kesintisiz veya hatasız olacağını garanti etmez</li>
                    <li>Kullanıcılar arasındaki iletişim ve anlaşmalardan sorumlu değildir</li>
                    <li>Paylaşılan içeriklerin doğruluğunu garanti etmez</li>
                    <li>Üçüncü taraf linklerin içeriğinden sorumlu değildir</li>
                    <li>Kullanıcılar arası alışverişlerden doğan zararlardan sorumlu değildir</li>
                    <li>Veri kaybı veya teknik sorunlardan kaynaklanan zararlardan sorumlu değildir</li>
                  </ul>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                      ⚠️ Önemli: Kullanıcılar arasındaki alışverişlerde dikkatli olun! 
                      Platform, dolandırıcılık veya hırsızlık vakalarından sorumlu tutulamaz.
                    </p>
                  </div>
                </div>
              </section>

              {/* 8. Hizmet Değişiklikleri */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  8. Hizmet Değişiklikleri ve Sonlandırma
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Platform, hizmetlerini bildirimsiz değiştirebilir veya durdurabilir</li>
                  <li>Yeni özellikler eklenebilir veya mevcut özellikler kaldırılabilir</li>
                  <li>Kullanım şartları zaman zaman güncellenebilir</li>
                  <li>Önemli değişiklikler e-posta ile bildirilecektir</li>
                  <li>Platform, hizmeti tamamen sonlandırma hakkını saklı tutar</li>
                </ul>
              </section>

              {/* 9. Uyuşmazlıklar */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  9. Uyuşmazlıkların Çözümü
                </h2>
                <p className="mb-4">
                  Bu kullanım şartlarından doğan uyuşmazlıklar:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Öncelikle dostane yollarla çözülmeye çalışılacaktır</li>
                  <li>Türkiye Cumhuriyeti yasalarına tabidir</li>
                  <li>Bursa mahkemeleri ve icra daireleri yetkilidir</li>
                </ul>
              </section>

              {/* 10. Çeşitli Hükümler */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  10. Çeşitli Hükümler
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Bu şartların bir maddesi geçersiz sayılırsa, diğer maddeler geçerliliğini korur</li>
                  <li>Platform, bu şartları size önceden haber vermeden değiştirme hakkını saklı tutar</li>
                  <li>Değişiklikler bu sayfada yayınlanacak ve yürürlük tarihi belirtilecektir</li>
                  <li>Platformu kullanmaya devam ederek güncel şartları kabul etmiş sayılırsınız</li>
                </ul>
              </section>

              {/* İletişim */}
              <section className="bg-gray-50 dark:bg-secondary-700 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  İletişim
                </h2>
                <p className="mb-4">
                  Kullanım şartları hakkında sorularınız için:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>E-posta:</strong>{' '}
                    <a href="mailto:info@bendenotvar.com" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      info@bendenotvar.com
                    </a>
                  </li>
                  <li>
                    <strong>Adres:</strong> Uludağ Üniversitesi, Görükle Kampüsü, Nilüfer/Bursa
                  </li>
                </ul>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Bu kullanım şartlarını kabul ederek, platformumuzu kullanmayı kabul ediyorsunuz.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Terms;

