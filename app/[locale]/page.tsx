import React from 'react';
import Hero from '../Components/Hero';
import Services from '../Components/Services';
import Tariffs from '../Components/Tariffs';
import HomeMarqueeBand from '../Components/HomeMarqueeBand';
import Why from '../Components/Why';
import Reviews from '../Components/Reviews';


const Page = () => {
  return (
    <div>
      <div className="relative pb-24 sm:pb-28 md:pb-24">
        <Hero />
        <Why />
      </div>
      <Tariffs />
      {/* <HomeMarqueeBand /> */}
      {/* <Reviews /> */}
    </div>
  );
};

export default Page;
