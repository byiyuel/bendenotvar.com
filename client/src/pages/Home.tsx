import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Home/Hero';
import StatsSection from '../components/Home/StatsSection';
import CategoryShowcase from '../components/Home/CategoryShowcase';
import RecentAds from '../components/Home/RecentAds';

const Home: React.FC = () => {
  return (
    <div>
      <Helmet>
        <title>bendenotvar | Uludağ Üniversitesi ders notları, kitap ve ekipman paylaşımları</title>
        <meta name="description" content="Uludağ Üniversitesi öğrencileri için ders notları, kitap, ekipman ve proje materyallerini güvenle paylaşın ve bulun." />
      </Helmet>
      <Hero />
      <StatsSection />
      <CategoryShowcase />
      <RecentAds />
    </div>
  );
};

export default Home;







