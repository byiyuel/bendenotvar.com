import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { adsAPI } from '../../services/api';
import { AdForm } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { 
  DocumentIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import DOMPurify from 'dompurify';
import RichTextEditor from '../../components/RichTextEditor';

const CreateAd: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<AdForm>();
  const shareType = watch('shareType');

  const onSubmit = async (data: AdForm) => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      // Sanitize rich text HTML before sending
      const sanitized = DOMPurify.sanitize(data.description);
      formData.append('description', sanitized);
      formData.append('category', data.category);
      formData.append('shareType', data.shareType);
      
      if (data.locationDetails) {
        formData.append('locationDetails', data.locationDetails);
      }
      
      if (data.whatsappLink) {
        formData.append('whatsappLink', data.whatsappLink);
      }
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await adsAPI.createAd(formData);
      showSuccess('İlan başarıyla oluşturuldu!');
      navigate('/my-ads');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'İlan oluşturulurken hata oluştu';
      setError(errorMessage);
      showError('İlan oluşturulamadı', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };


  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Yeni İlan Oluştur
        </h1>
        <p className="text-lg text-gray-600">
          Kampüsteki arkadaşlarınızla paylaşmak istediğiniz materyali ekleyin
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              İlan Başlığı *
            </label>
            <input
              {...register('title', {
                required: 'Başlık gereklidir',
                minLength: {
                  value: 5,
                  message: 'Başlık en az 5 karakter olmalıdır'
                },
                maxLength: {
                  value: 100,
                  message: 'Başlık en fazla 100 karakter olmalıdır'
                }
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Örn: Veri Yapıları Ders Notları"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <RichTextEditor
              value={(watch('description') as any) || ''}
              onChange={(value: string) => {
                (document.getElementById('description-hidden') as HTMLInputElement).value = value;
              }}
              className="bg-white"
            />
            {/* Hidden input to keep RHF validation */}
            <input id="description-hidden" type="hidden" {...register('description', {
              required: 'Açıklama gereklidir',
              minLength: { value: 10, message: 'Açıklama en az 10 karakter olmalıdır' },
              maxLength: { value: 5000, message: 'Açıklama en fazla 5000 karakter olmalıdır' }
            })} />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              {...register('category', {
                required: 'Kategori seçimi gereklidir'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Kategori seçiniz</option>
              <option value="Not">📝 Not</option>
              <option value="Kitap">📚 Kitap</option>
              <option value="Ekipman">🔧 Ekipman</option>
              <option value="PDF">📄 PDF</option>
              <option value="Proje">💡 Proje</option>
              <option value="Acil">⚠️ Acil</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Share Type */}
          <div className="mb-6">
            <label htmlFor="shareType" className="block text-sm font-medium text-gray-700 mb-2">
              Paylaşım Tipi *
            </label>
            <select
              {...register('shareType', {
                required: 'Paylaşım tipi seçimi gereklidir'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Paylaşım tipi seçiniz</option>
              <option value="BORROW">🔄 Ödünç</option>
              <option value="PERMANENT">🎁 Kalıcı</option>
              <option value="DIGITAL">💻 Dijital</option>
            </select>
            {errors.shareType && (
              <p className="mt-1 text-sm text-red-600">{errors.shareType.message}</p>
            )}
          </div>

          {/* Location Details */}
          {shareType === 'BORROW' && (
            <div className="mb-6">
            <label htmlFor="locationDetails" className="block text-sm font-medium text-gray-700 mb-2">
                Teslim Konumu
              </label>
              <input
                {...register('locationDetails')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Örn: Mühendislik Fakültesi Kütüphanesi"
              />
              <p className="mt-1 text-sm text-gray-500">
                Ödünç verirken nerede buluşacağınızı belirtin
              </p>
            </div>
          )}

          {/* WhatsApp Link */}
          <div className="mb-6">
            <label htmlFor="whatsappLink" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Linki (Opsiyonel)
            </label>
            <input
              {...register('whatsappLink', {
                pattern: {
                  value: /^https:\/\/wa\.me\/\d+$/,
                  message: 'Geçerli bir WhatsApp linki giriniz (https://wa.me/905xxxxxxxxx)'
                }
              })}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://wa.me/905xxxxxxxxx"
            />
            {errors.whatsappLink && (
              <p className="mt-1 text-sm text-red-600">{errors.whatsappLink.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              İsteğe bağlı: WhatsApp üzerinden iletişim için link ekleyebilirsiniz
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dosya Ekle (Opsiyonel)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                {selectedFile ? (
                  <div className="space-y-2">
                    {filePreview ? (
                      <div className="relative">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <DocumentIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-500 hover:text-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Dosya seç</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">veya sürükleyip bırakın</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF, DOC, DOCX (Max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/ads')}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Oluşturuluyor...' : 'İlanı Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAd;


