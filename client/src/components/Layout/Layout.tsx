import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-secondary-900">
      <Header />
      <main className="flex-1 text-gray-900 dark:text-gray-100">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;


