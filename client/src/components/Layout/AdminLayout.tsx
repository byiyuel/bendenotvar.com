import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AdminLayoutProps { children: React.ReactNode }

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);
  const item = (path: string, label: string) => (
    <Link to={path} className={`block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-secondary-800 ${isActive(path) ? 'bg-gray-100 dark:bg-secondary-800 font-medium' : ''}`}>{label}</Link>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      <aside className="md:col-span-3 lg:col-span-3 border rounded-lg p-3 sticky top-20 h-fit dark:border-secondary-700">
        <div className="text-sm text-gray-500 mb-2">Yönetim</div>
        <nav className="space-y-1">
          {item('/admin', 'Genel Bakış')}
          {item('/admin/users', 'Kullanıcılar')}
          {item('/admin/ads', 'İlanlar')}
          {item('/admin/moderation', 'Moderasyon')}
          {item('/admin/categories', 'Kategoriler')}
          {item('/admin/settings', 'Ayarlar')}
        </nav>
      </aside>
      <main className="md:col-span-9 lg:col-span-9">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;


