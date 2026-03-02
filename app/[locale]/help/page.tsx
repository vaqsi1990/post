import React from 'react';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HelpGuidePage({ params }: Props) {
  const { locale } = await params;
  const isKa = locale === 'ka';

  const title = isKa ? 'ონლაინ გიდი' : 'Online guide';

  const text = isKa
    ? 'Postify - ს ონლაინ გიდი დაგეხმარებათ თქვენთვის სასურველი ნებისმიერი ნივთის გამოწერაში. სერვისით სარგებლობა უფასოა. ნივთის გამოსაწერად საჭირო თანხა კი უნდა გადაიხადოთ გამოსაწერად საჭირო ვალუტაში, თქვენი პირადი კაბინეტიდან ან ჩარიცხოთ კომპანიის ანგარიშზე. სერვისის სარგებლობისთვის მოგვწერეთ ჩატში "გამოწერაში დახმარება" და თქვენი საკონტაქტო. ონლაინ გიდი დაგიკავშირდებათ ერთი საათის განმავლობაში და გაგიწევთ დახმარებას. სასიამოვნო შოპინგს გისურვებთ.'
    : 'Postify’s online guide will help you order any item you want. The service is free of charge. To order an item, you only need to pay its cost in the required currency from your personal cabinet or transfer the amount to the company’s bank account. To use the service, write to us in the chat with the message “Help with ordering” and your contact details. Our online guide will contact you within one hour and assist you. We wish you pleasant shopping.';

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        id="guide"
        className="w-full pt-14 mt-14 md:pt-20 pb-16 md:pb-24 px-4"
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-center text-black md:text-[32px] text-[22px] font-bold mb-8">
            {title}
          </h1>
          <p className="text-black md:text-[16px] text-[14px] leading-relaxed">
            {text}
          </p>
        </div>
      </section>
    </div>
  );
}

