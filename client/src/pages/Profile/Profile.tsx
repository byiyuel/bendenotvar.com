import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api, { userAPI } from '../../services/api';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user: authUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Partial<User>>();
  const [twoFASetup, setTwoFASetup] = useState<{ base32: string; qr: string } | null>(null);
  const [twoFACode, setTwoFACode] = useState<string>('');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
      reset(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showError('Hata', 'Profil bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [reset, showError]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = async (data: Partial<User>) => {
    setSaving(true);

    try {
      // FormData kullanarak hem dosya hem de diğer verileri gönder
      const formData = new FormData();
      
      // Email'i hariç tut - sadece düzenlenebilir alanları ekle
      if (data.firstName) formData.append('firstName', data.firstName);
      if (data.lastName) formData.append('lastName', data.lastName);
      if (data.department) formData.append('department', data.department);
      if (data.faculty) formData.append('faculty', data.faculty);
      if (data.year) formData.append('year', data.year);
      if (data.bio) formData.append('bio', data.bio);
      
      // Profil fotoğrafı varsa ekle
      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      const response = await userAPI.updateProfile(formData);
      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      setEditing(false);
      setImagePreview(null);
      setSelectedFile(null);
      
      showSuccess('Profil güncellendi', 'Profil bilgileriniz başarıyla güncellendi');
    } catch (error: any) {
      showError('Hata', error.response?.data?.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError('Hata', 'Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showError('Hata', 'Lütfen bir resim dosyası seçin');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setImagePreview(null);
    setSelectedFile(null);
    if (user) {
      reset(user);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handle2FASetup = async () => {
    try {
      await userAPI.getProfile(); // ensure auth
      const { data: payload } = await api.post('/auth/2fa/setup');
      // QR ve secret'ı sayfa içinde göstermek için state'e al
      setTwoFASetup({ base32: payload.base32, qr: payload.qr });
    } catch (e:any) {
      showError('Hata', e.message || '2FA kurulumu başlatılamadı');
    }
  };

  const handle2FAEnable = async () => {
    const code = twoFACode.trim();
    if (!twoFASetup || !code) {
      showError('Hata', 'Önce QR oluşturun ve 6 haneli kodu girin');
      return;
    }
    try {
      const { data: payload } = await api.post('/auth/2fa/enable', { token: code, base32: twoFASetup.base32 });
      showSuccess('Başarılı', '2FA etkinleştirildi');
      setTwoFASetup(null);
      setTwoFACode('');
      fetchProfile();
    } catch (e:any) {
      showError('Hata', e.message || '2FA etkinleştirilemedi');
    }
  };

  const handle2FADisable = async () => {
    if (!window.confirm('2FA kapatılsın mı?')) return;
    try {
      const { data: payload } = await api.post('/auth/2fa/disable');
      showSuccess('Tamam', '2FA devre dışı bırakıldı');
      setTwoFASetup(null);
      setTwoFACode('');
      fetchProfile();
    } catch (e:any) {
      showError('Hata', e.message || '2FA devre dışı bırakılamadı');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Profil bulunamadı
          </h3>
          <p className="text-gray-500">
            Profil bilgileriniz yüklenirken bir hata oluştu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Profilim
        </h1>
        <p className="text-lg text-gray-600">
          Profil bilgilerinizi görüntüleyin ve güncelleyin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow border dark:border-secondary-700 p-6">
            {/* Profile Image */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto overflow-hidden">
                  {imagePreview || user.profileImage ? (
                    <img
                      src={imagePreview || user.profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                {editing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors"
                    >
                      <CameraIcon className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4 break-words">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 break-all">{user.email}</p>
            </div>

            {/* Member Since */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-secondary-600">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Üyelik: {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow border dark:border-secondary-700">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Profil Bilgileri
                </h3>
                <div className="flex space-x-2">
                  {editing ? (
                    <>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-secondary-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-700"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        İptal
                      </button>
                      <button
                        type="submit"
                        form="profile-form"
                        disabled={saving}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                      >
                        {saving ? (
                          <LoadingSpinner size="sm" color="white" className="mr-1" />
                        ) : (
                          <CheckIcon className="h-4 w-4 mr-1" />
                        )}
                        Kaydet
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-secondary-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-700"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Düzenle
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Form */}
            <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'Ad alanı zorunludur' })}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-secondary-700 dark:text-gray-100 dark:disabled:bg-secondary-800 dark:disabled:text-gray-500 break-words"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Soyad alanı zorunludur' })}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-secondary-700 dark:text-gray-100 dark:disabled:bg-secondary-800 dark:disabled:text-gray-500 break-words"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                    E-posta
                  </label>
                  <input
                    type="email"
                    {...register('email', { required: 'E-posta alanı zorunludur' })}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm bg-gray-50 dark:bg-secondary-800 text-gray-500 dark:text-gray-400 break-all"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    E-posta adresi değiştirilemez
                  </p>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AcademicCapIcon className="h-4 w-4 inline mr-1" />
                    Bölüm
                  </label>
                  <input
                    type="text"
                    {...register('department')}
                    disabled={!editing}
                    placeholder="Örn: Bilgisayar Mühendisliği"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-secondary-700 dark:text-gray-100 dark:disabled:bg-secondary-800 dark:disabled:text-gray-500 break-words"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                    Sınıf
                  </label>
                  <select
                    {...register('year')}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-secondary-700 dark:text-gray-100 dark:disabled:bg-secondary-800 dark:disabled:text-gray-500 break-words"
                  >
                    <option value="">Seçin</option>
                    <option value="1">1. Sınıf</option>
                    <option value="2">2. Sınıf</option>
                    <option value="3">3. Sınıf</option>
                    <option value="4">4. Sınıf</option>
                    <option value="graduate">Lisansüstü</option>
                  </select>
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hakkımda
                  </label>
                  <textarea
                    {...register('bio')}
                    disabled={!editing}
                    rows={4}
                    placeholder="Kendinizi kısaca tanıtın..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-secondary-700 dark:text-gray-100 dark:disabled:bg-secondary-800 dark:disabled:text-gray-500 break-words"
                  />
                </div>
              </div>
              {/* 2FA Section */}
              <div className="mt-8 p-4 border rounded-md bg-gray-50 dark:bg-secondary-700/30 dark:border-secondary-600">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">2 Adımlı Doğrulama (TOTP)</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Hesabınızı ek bir doğrulama adımıyla koruyun.</div>
                  </div>
                  {user.totpEnabled ? (
                    <button type="button" onClick={handle2FADisable} className="px-3 py-2 rounded-md border text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30">2FA Kapat</button>
                  ) : (
                    <div className="flex gap-2">
                      <button type="button" onClick={handle2FASetup} className="px-3 py-2 rounded-md border">QR Oluştur</button>
                      <button type="button" onClick={handle2FAEnable} className="px-3 py-2 rounded-md bg-primary-600 text-white">2FA Etkinleştir</button>
                    </div>
                  )}
                </div>
                {!user.totpEnabled && twoFASetup && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-1">
                      <img src={twoFASetup.qr} alt="2FA QR" className="border rounded w-48 h-48 object-contain bg-white" />
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-sm break-all mb-2"><span className="font-medium">Secret:</span> {twoFASetup.base32}</div>
                      <label className="block text-sm font-medium mb-1">Authenticator 6 haneli kod</label>
                      <input value={twoFACode} onChange={e=>setTwoFACode(e.target.value)} placeholder="123456" className="w-full max-w-xs px-3 py-2 border rounded-md dark:bg-secondary-800 dark:border-secondary-600" />
                      <div className="mt-2 text-xs text-gray-500">Kod her 30 sn’de bir yenilenir.</div>
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={handle2FAEnable} className="px-3 py-2 rounded-md bg-primary-600 text-white">Doğrula ve Etkinleştir</button>
                        <button type="button" onClick={()=>{setTwoFASetup(null);setTwoFACode('');}} className="px-3 py-2 rounded-md border">İptal</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
