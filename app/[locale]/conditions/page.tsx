import React from 'react';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ConditionsPage({ params }: Props) {
  const { locale } = await params;
  const isKa = locale === 'ka';

  const pageTitle = isKa ? 'მომსახურების პირობები' : 'Service conditions';

  const sections = isKa
    ? [
        {
          id: 'terms-of-service',
          title: 'მომსახურების პირობები',
          content:
            'აქ წარმოდგენილია ჩვენი მომსახურების ძირითადი პირობები და წესები, რომლებიც არეგულირებს კომპანიისა და მომხმარებლის ურთიერთობას.',
        },
        {
          id: 'provider-duties',
          title: 'შემსრულებლის უფლება-მოვალეობები',
          content:
            'შემსრულებელი ვალდებულია უზრუნველყოს ამანათების დროული და უსაფრთხო ტრანსპორტირება, ინფორმაციის სწორად დამუშავება და სერვისის ხარისხის დაცვა მოქმედი კანონმდებლობის შესაბამისად.',
        },
        {
          id: 'customer-duties',
          title: 'დამკვეთის უფლება-მოვალეობები',
          content:
            'დამკვეთი ვალდებულია მიაწოდოს ზუსტი მონაცემები, დროულად მოახდინოს მომსახურების ღირებულების გადახდა და დაიცვას საბაჟო და სხვა რეგულაციებით დადგენილი წესები.',
        },
        {
          id: 'calculation-rules',
          title: 'დაანგარიშების წესი',
          content:
            'ამანათების სატრანსპორტო და მომსახურების ღირებულება განისაზღვრება წონის, მოცულობისა და მიმართულების მიხედვით. დეტალური ტარიფები მოცემულია ტარიფების გვერდზე.',
        },
        {
          id: 'declaration-service',
          title: 'დეკლარირება და განბაჟების მომსახურება',
          content:
            'კომპანია სთავაზობს დეკლარირების და განბაჟების მომსახურებას მოქმედი საბაჟო კანონმდებლობის შესაბამისად. მომხმარებელი ვალდებულია წარადგინოს ყველა აუცილებელი დოკუმენტი.',
        },
        {
          id: 'third-party-pickup',
          title: 'ამანათის გაცემა მესამე პირზე',
          content:
            'ამანათის გაცემისას მესამე პირზე სავალდებულოა დამკვეთის მიერ მიცემული წერილობითი ან ელექტრონული უფლებამოსილება და პირადობის დამადასტურებელი დოკუმენტის წარდგენა.',
        },
        {
          id: 'confidentiality',
          title: 'კონფიდენციალურობა',
          content:
            'ჩვენ ვიცავთ მომხმარებლის პერსონალური მონაცემების კონფიდენციალურობას და ვამუშავებთ მათ მხოლოდ იმ ფარგლებს შიგნით, რაც აუცილებელია მომსახურების გაწევისთვის და კანონით არის განსაზღვრული.',
        },
        {
          id: 'declarant-service',
          title: 'დეკლარანტის მომსახურება',
          content:
            'დეკლარანტის მომსახურება გულისხმობს საბაჟო ფორმალობების შესრულებაში დახმარებას, კონსულტაციის გაწევას და საჭირო დოკუმენტაციის მომზადებას.',
        },
      ]
    : [
        {
          id: 'terms-of-service',
          title: 'Service conditions',
          content:
            'Here you can find the main terms and conditions that regulate the relationship between the company and the customer.',
        },
        {
          id: 'provider-duties',
          title: 'Provider rights and obligations',
          content:
            'The provider is obliged to ensure timely and safe transportation of parcels, correct processing of information and service quality in accordance with applicable legislation.',
        },
        {
          id: 'customer-duties',
          title: 'Customer rights and obligations',
          content:
            'The customer is obliged to provide accurate data, pay service fees on time and comply with customs and other regulations.',
        },
        {
          id: 'calculation-rules',
          title: 'Calculation rules',
          content:
            'Service and transportation fees are calculated based on weight, volume and destination. Detailed tariffs are available on the pricing page.',
        },
        {
          id: 'declaration-service',
          title: 'Declaration and customs clearance service',
          content:
            'The company provides declaration and customs clearance services in accordance with applicable customs legislation. The customer must submit all required documents.',
        },
        {
          id: 'third-party-pickup',
          title: 'Parcel release to third party',
          content:
            'When releasing a parcel to a third party, written or electronic authorization from the customer and a valid ID document are required.',
        },
        {
          id: 'confidentiality',
          title: 'Confidentiality',
          content:
            'We protect the confidentiality of customer personal data and process it only within the scope necessary to provide the service and as required by law.',
        },
        {
          id: 'declarant-service',
          title: 'Declarant service',
          content:
            'Declarant service includes assistance with customs formalities, providing consultation and preparing the necessary documentation.',
        },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        id="conditions"
        className="w-full pt-14 mt-14 md:pt-20 pb-16 md:pb-24 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-center text-black md:text-[32px] text-[22px] font-bold mb-10">
            {pageTitle}
          </h1>

          <div className="space-y-10 text-black md:text-[16px] text-[14px] leading-relaxed">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-semibold mb-3 text-[18px] md:text-[20px]">
                  {section.title}
                </h2>
                <p>{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

