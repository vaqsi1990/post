"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const Services = () => {
    const t = useTranslations('home');
    const services = [
        { title: t('service1'), src: '/airplane.png', altKey: 'service1' as const },
        { title: t('service2'), src: '/customs.png', altKey: 'service2' as const },
        { title: t('service3'), src: '/corporate.png', altKey: 'service3' as const },
        { title: t('service4'), src: '/express-delivery.png', altKey: 'service4' as const },
    ];

    return (
        <>
            <section className="w-full pt-14  md:pt-20 pb-0  md:pb-14   bg-gray-100 flex items-center justify-center overflow-x-hidden">
                <div className="max-w-7xl w-full z-10 overflow-x-hidden min-w-0">
                    {/* Category Title */}
                   

                    {/* Main Heading - wrapper clips initial y offset to prevent overflow on load */}
                    <div className="overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: -48 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="text-center mb-8 md:mb-16"
                    >
                        <h2 className="text-black md:text-[30px] text-[18px] font-bold">
                        {t('servicesTitle')}
                        </h2>
                    </motion.div>
                    </div>

                    {/* Services Grid - overflow-hidden clips initial x offset on load */}
                    <div className="overflow-x-hidden min-w-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-0">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                className="relative"
                                initial={{ opacity: 0, x: index < 2 ? -56 : 56 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
                            >
                                {/* Vertical separator */}
                                {index > 0 && (
                                    <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                                )}

                                <div className="flex flex-col items-center px-4 md:px-6 py-6 md:py-8">
                                    {/* Icon */}
                                    <div className="mb-4 md:mb-6">
                                        <img
                                            src={service.src}
                                            alt={t(service.altKey)}
                                            width={50}
                                            height={50}
                                            className="w-12 h-12 md:w-16 md:h-16 object-contain"
                                            style={{ opacity: 1 }}
                                        />
                                    </div>

                                    {/* Service Title */}
                                    <h4 className="text-black md:text-[20px] text-[14px] font-medium text-center mb-0 md:mb-4 leading-tight">
                                        {service.title}
                                    </h4>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
         
        </>
    );
};

export default Services;
