"use client";

import React from 'react';
const Services = () => {
    const services = [
        {
            title: 'ამანათების ტრანსპორტირება',
            src: '/airplane.png',
            alt: 'ამანათების ტრანსპორტირება'
        },
        {
            title: 'განბაჟების მომსახურება',
            src: '/customs.png',
            alt: 'განბაჟების მომსახურება'
        },
        {
            title: 'კორპორატიული მომსახურება',
            src: '/corporate.png',
            alt: 'კორპორატიული მომსახურება'
        },
        {
            title: 'საკურიერო მომსახურება',
            src: '/express-delivery.png',
            alt: 'საკურიერო მომსახურება'
        }
    ];

    return (
        <>
            <section className="w-full pt-14  md:pt-20 pb-0  md:pb-14   bg-gray-100 flex items-center justify-center  overflow-visible">
                <div className="max-w-7xl w-full  z-10 ">
                    {/* Category Title */}
                    <div className="text-center mb-3 md:mb-4">
                        <h3 className="text-black md:text-[20px] text-[14px] uppercase tracking-widest font-medium">
                            ს ე რ ვ ი ს ე ბ ი
                        </h3>
                    </div>

                    {/* Main Heading */}
                    <div className="text-center mb-8 md:mb-16">
                        <h2 className="text-black md:text-[30px] text-[18px] font-bold">
                            ჩ ვ ე ნ გ თ ა ვ ა ზ ო ბ თ
                        </h2>
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-0">
                        {services.map((service, index) => (
                            <div key={index} className="relative">
                                {/* Vertical separator */}
                                {index > 0 && (
                                    <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                                )}

                                <div className="flex flex-col items-center px-4 md:px-6 py-6 md:py-8">
                                    {/* Icon */}
                                    <div className="mb-4 md:mb-6">
                                        <img
                                            src={service.src}
                                            alt={service.alt} 
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
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
         
        </>
    );
};

export default Services;
