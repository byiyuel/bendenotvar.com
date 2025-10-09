import React from 'react';
import Hero from '../components/Home/Hero';
import StatsSection from '../components/Home/StatsSection';
import CategoryShowcase from '../components/Home/CategoryShowcase';
import RecentAds from '../components/Home/RecentAds';

const Home: React.FC = () => {
  return (
    <div>
      <Hero />
      <StatsSection />
      <CategoryShowcase />
      <RecentAds />
    </div>
  );
};

export default Home;



