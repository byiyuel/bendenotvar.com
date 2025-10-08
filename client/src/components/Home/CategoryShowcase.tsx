import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  LightBulbIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const CategoryShowcase: React.FC = () => {
  const categories = [
    {
      name: 'Ders Notları',
      description: 'Sınav notları, özet çıkarımlar ve ders materyalleri',
      icon: BookOpenIcon,
      color: 'from-blue-500 to-blue-600',
      itemCount: 450,
      href: '/ads?category=notes'
    },
    {
      name: 'Kitaplar',
      description: 'Ders kitapları, referans kaynaklar ve akademik yayınlar',
      icon: DocumentTextIcon,
      color: 'from-green-500 to-green-600',
      itemCount: 320,
      href: '/ads?category=books'
    },
    {
      name: 'Ekipman',
      description: 'Laboratuvar araçları, teknik ekipman ve malzemeler',
      icon: WrenchScrewdriverIcon,
      color: 'from-purple-500 to-purple-600',
      itemCount: 180,
      href: '/ads?category=equipment'
    },
    {
      name: 'Proje Materyalleri',
      description: 'Proje örnekleri, şablonlar ve kaynak kodlar',
      icon: LightBulbIcon,
      color: 'from-orange-500 to-orange-600',
      itemCount: 95,
      href: '/ads?category=projects'
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Kategoriler
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            İhtiyacınıza uygun kategoriyi seçin ve binlerce öğrenci tarafından paylaşılan içeriklere ulaşın
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={index}
                to={category.href}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="p-6">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${category.color} mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {category.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      {category.itemCount} öğe
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/ads"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Tüm İlanları Görüntüle
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryShowcase;
