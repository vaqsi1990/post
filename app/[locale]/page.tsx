import React from 'react';
import Hero from '../Components/Hero';
import Services from '../Components/Services';
import Tariffs from '../Components/Tariffs';
import HomeMarqueeBand from '../Components/HomeMarqueeBand';
import Why from '../Components/Why';
import Reviews from '../Components/Reviews';
import Works from '@/app/Components/Works';

const Page = () => {
  return (
    <div>
      <div className="relative pb-16  md:pb-24">
        <Hero />
        <div className="mt-54  sm:mt-0">
          <Why />
        </div>
      </div>
      <Works />
      <Tariffs />
      {/* <HomeMarqueeBand /> */}
      {/* <Reviews /> */}
    </div>
  );
};

export default Page;
