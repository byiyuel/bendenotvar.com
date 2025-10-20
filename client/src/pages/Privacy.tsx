import React, { useEffect } from 'react';

const Privacy: React.FC = () => {
  useEffect(() => {
    document.title = 'Gizlilik Politikası | bendenotvar';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Gizlilik Politikası
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Son Güncellenme: 20 Ekim 2025
            </p>

            <div className="space-y-8 text-gray-700 dark:text-gray-300">
              {/* 1. Giriş */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  1. Giriş
                </h2>
                <p className="leading-relaxed">
                  bendenotvar olarak, kullanıcılarımızın gizliliğine saygı duyuyor ve kişisel verilerinizi korumak 
                  için gerekli tüm önlemleri alıyoruz. Bu gizlilik politikası, hangi bilgileri topladığımızı, 
                  nasıl kullandığımızı ve haklarınızın neler olduğunu açıklamaktadır.
                </p>
              </section>

              {/* 2. Toplanan Bilgiler */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  2. Toplanan Bilgiler
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      2.1. Kayıt Sırasında Toplanan Bilgiler
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>E-posta adresi (Uludağ Üniversitesi öğrenci/personel e-postası)</li>
                      <li>Ad ve Soyad</li>
                      <li>Fakülte ve Bölüm bilgisi</li>
                      <li>Şifre (şifrelenmiş olarak saklanır)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      2.2. İlan ve Paylaşım Bilgileri
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Oluşturduğunuz ilan içerikleri (başlık, açıklama, kategori)</li>
                      <li>Yüklediğiniz dosyalar ve görseller</li>
                      <li>Konum bilgileri (opsiyonel)</li>
                      <li>WhatsApp iletişim bilgileri (opsiyonel)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      2.3. Kullanım Bilgileri
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>IP adresi</li>
                      <li>Tarayıcı türü ve versiyonu</li>
                      <li>Ziyaret edilen sayfalar ve tıklama verileri</li>
                      <li>Giriş ve çıkış zamanları</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 3. Bilgilerin Kullanımı */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  3. Bilgilerin Kullanımı
                </h2>
                <p className="mb-4">Topladığımız bilgileri şu amaçlarla kullanıyoruz:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Hesap oluşturma ve kimlik doğrulama</li>
                  <li>Platformun işlevselliğini sağlama</li>
                  <li>İlanların yayınlanması ve yönetilmesi</li>
                  <li>Kullanıcılar arası iletişimin sağlanması</li>
                  <li>Bildirim ve güncellemelerin gönderilmesi</li>
                  <li>Platformun güvenliğinin sağlanması</li>
                  <li>İstatistik ve analiz yapılması</li>
                  <li>Hizmet kalitesinin iyileştirilmesi</li>
                </ul>
              </section>

              {/* 4. Bilgi Paylaşımı */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  4. Bilgi Paylaşımı ve Aktarımı
                </h2>
                <p className="mb-4">
                  Kişisel bilgilerinizi üçüncü taraflarla <strong>paylaşmıyoruz</strong>. 
                  Ancak aşağıdaki durumlarda bilgileriniz görünür olabilir:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>İlan Sahipleri:</strong> Oluşturduğunuz ilanlarda adınız, soyadınız, 
                    fakülteniz ve bölümünüz görünür.
                  </li>
                  <li>
                    <strong>Mesajlaşma:</strong> Mesajlaştığınız kullanıcılar adınızı ve iletişim bilgilerinizi görebilir.
                  </li>
                  <li>
                    <strong>Yasal Zorunluluklar:</strong> Yasal bir talep olması durumunda yetkili makamlara bilgi verilebilir.
                  </li>
                </ul>
              </section>

              {/* 5. Veri Güvenliği */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  5. Veri Güvenliği
                </h2>
                <p className="mb-4">Verilerinizin güvenliğini sağlamak için şu önlemleri alıyoruz:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>SSL/TLS şifreleme ile güvenli veri iletimi</li>
                  <li>Şifrelerin hash'lenerek saklanması</li>
                  <li>Düzenli güvenlik güncellemeleri</li>
                  <li>Firewall ve DDoS koruması</li>
                  <li>Erişim kontrolü ve yetkilendirme sistemleri</li>
                  <li>Düzenli yedekleme</li>
                </ul>
              </section>

              {/* 6. Çerezler (Cookies) */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  6. Çerezler (Cookies)
                </h2>
                <p className="mb-4">
                  Platformumuz, kullanıcı deneyimini iyileştirmek için çerezler kullanır:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Oturum Çerezleri:</strong> Giriş durumunuzu korur</li>
                  <li><strong>Tercih Çerezleri:</strong> Tema (karanlık mod) ve dil tercihlerinizi saklar</li>
                  <li><strong>Analitik Çerezler:</strong> Site kullanım istatistikleri için</li>
                </ul>
                <p className="mt-4">
                  Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz, 
                  ancak bu bazı özelliklerin çalışmamasına neden olabilir.
                </p>
              </section>

              {/* 7. Kullanıcı Hakları */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  7. Kullanıcı Hakları (KVKK)
                </h2>
                <p className="mb-4">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında şu haklara sahipsiniz:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>İşlenmişse bilgi talep etme</li>
                  <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                  <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                  <li>Verilerin silinmesini veya yok edilmesini isteme</li>
                  <li>Düzeltme, silme ve yok edilme işlemlerinin üçüncü kişilere bildirilmesini isteme</li>
                  <li>Otomatik sistemlerle analiz edilmesine itiraz etme</li>
                  <li>Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme</li>
                </ul>
                <p className="mt-4">
                  Bu haklarınızı kullanmak için <a href="mailto:info@bendenotvar.com" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">info@bendenotvar.com</a> adresine başvurabilirsiniz.
                </p>
              </section>

              {/* 8. Hesap Silme */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  8. Hesap Silme ve Veri İmhası
                </h2>
                <p className="mb-4">
                  Hesabınızı silmek istediğinizde:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Tüm kişisel bilgileriniz sistemden silinir</li>
                  <li>Oluşturduğunuz ilanlar arşivlenir (ad soyad bilgisi kaldırılır)</li>
                  <li>Mesajlarınız anonim hale getirilir</li>
                  <li>30 gün içinde geri dönüş yapmazsanız kalıcı olarak silinir</li>
                </ul>
                <p className="mt-4">
                  Hesap silme talebi için profil ayarlarından "Hesabı Sil" butonunu kullanabilir 
                  veya <a href="mailto:info@bendenotvar.com" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">info@bendenotvar.com</a> adresine mail atabilirsiniz.
                </p>
              </section>

              {/* 9. Çocukların Gizliliği */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  9. Çocukların Gizliliği
                </h2>
                <p>
                  Platformumuz 18 yaş ve üzeri kullanıcılara yöneliktir. 
                  18 yaşından küçük kullanıcıların kaydolması durumunda, tespit edildiğinde hesapları silinecektir.
                </p>
              </section>

              {/* 10. Politika Değişiklikleri */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  10. Gizlilik Politikası Değişiklikleri
                </h2>
                <p>
                  Bu gizlilik politikasını zaman zaman güncelleyebiliriz. 
                  Değişiklikler bu sayfada yayınlanacak ve "Son Güncellenme" tarihi güncellenecektir. 
                  Önemli değişiklikler için e-posta ile bilgilendirileceksiniz.
                </p>
              </section>

              {/* İletişim */}
              <section className="bg-gray-50 dark:bg-secondary-700 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  İletişim
                </h2>
                <p className="mb-4">
                  Gizlilik politikamız hakkında sorularınız veya talepleriniz için:
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
              </section>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Privacy;

