import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { userAPI } from '../../services/api';
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
  CameraIcon,
  DocumentTextIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user: authUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Partial<User>>();

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
      // For now, let's use regular object instead of FormData
      const updateData = {
        ...data,
        // profileImage will be handled separately when backend supports it
      };

      const response = await userAPI.updateProfile(updateData);
      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      setEditing(false);
      setImagePreview(null);
      
      showSuccess('Başarılı', 'Profil bilgileriniz güncellendi');
      
      // Update auth context if needed
      if (authUser && response.data.user.email !== authUser.email) {
        // We'll need to update the auth context properly
        // For now, just update the user state
      }
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

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">İlanlarım</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.adsCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <HeartIcon className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Favorilerim</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.favoritesCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Mesajlarım</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.messagesCount || 0}</span>
              </div>
            </div>

            {/* Member Since */}
            <div className="mt-6 pt-6 border-t border-gray-200">
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
