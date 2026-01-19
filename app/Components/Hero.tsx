"use client";

import React from 'react';
import Image from 'next/image';

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="hero-image-wrapper">
                <Image
                    src="/hero.jpg"
                    alt="Hero"
                    fill
                    className="hero-image"
                    priority
                    unoptimized
                />
                <div className="hero-overlay"></div>
            </div>
            <div className="hero-content">
                <h1 className="hero-text">
                    გამოიწერეთ ნივთები ჩვენთან ერთად
                </h1>
            </div>
        </section>
    );
};

export default Hero;
