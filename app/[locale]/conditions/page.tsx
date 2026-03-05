import React from 'react';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ConditionsPage({ params }: Props) {
  const { locale } = await params;
  const isKa = locale === 'ka';

  const pageTitle = isKa ? 'მომსახურების პირობები' : 'Service conditions';
  const heroBadge = isKa ? 'უნდა იცოდეთ' : 'Important to know';
 

  const sections = isKa
    ? [

      {
        id: 'provider-duties',
        title: 'შემსრულებლის უფლება-მოვალეობები',
        content:
          'კომპანია Postify-ის  მიერ ამანათების ტრანსპორტირება ხდეა 9 ქვეყნიდან საქართველოში; კომპანია პასუხს არ აგებს რეგისტრაციისას მომხმარებლის მიერ შევსებული ინფორმაციის სისწორეზე; თუ მომხმარებლის მიერ შეკვეთილი პროდუქცია არ მივა ჩვენს ოფისებამდე „ონლაინ მაღაზიის“ შეცდომის გამო ან „ონლაინ მაღაზია“ გააუქმებს შეკვეთას, კომპანია არ აგებს პასუხს ზარალის ანაზღაურებაზე; კომპანია Postify იღებს ვალდებულებას ამანათების უვნებლად ტრანსპორტირებაზე, დაკარგვის შემთხვევაში ზარალი იქნება ანაზღაურებული; კომპანია Postify არის პასუხისმგებელი ისეთ ნივთზე, რომელიც გარეგნულად იქნება დაზიანებული (დახეული, გახნსილი, შეჭყლეტილი). ნივთის შემოწმება ხდება ადგილზე, სხვა შემთხვევაში პრეტენზია არ მიიღება. ანაზღაურება არ ვრცელდება მტვრევად ნივთებზე. კომპანია Postify   არ აგებს პასუხს პროდუქციის ვარგისიანობაზე, ხარისხზე და მათ რაოდენობაზე; მომხმარებელი ვალდებულია წარმოადგინოს ყველა საბუთი, რაც კავშირში იქნება შეძენილ ნივთთან; კომპენსაციის შემთხვევაში შემსრულებელი იტოვებს საწყობში დაზიანებულ ნივთს;   კომპანია Postify  მოკვლევის მიზნით ზარალის ანაზღაურებამდე ითხოვს მაქსიმუმ 30 სამუშაო დღეს, ხოლო ზარალის თანხას უნაზღაურებს დამკვეთს 5 სამუშაო დღეში, მიღება ჩაბარების აქტის საფუძველზე.',
      },
      {
        id: 'customer-duties',
        title: 'დამკვეთის უფლება-მოვალეობები',
        content:
          'დამკვეთი ვალდებულია შემსრულებლის ვებ გვერდზე ( www.....) მოახდინოს ამანათის სწორად დეკლარირება, დამკვეთის პირად კაბინეტში ამანათის თრექინგ კოდის ასახვიდან არაუგვიანეს 3 კალენდარულ დღეში; დამკვეთი ვალდებულია დაფაროს ამანათის ტრანსპორტირების საფასური ნივთის გატანის წინ; დამკვეთი ვალდებულია ამანათის გატანამდე შეამოწმოს ნივთი, წინააღმდეგ შემთხვევაში, ამანათის გატანის შემდეგ პრეტენზიები არ მიიღება.'
      },
      {
        id: 'calculation-rules',
        title: 'დაანგარიშების წესი',
        content:
          'ამანათის ტრანსპორტირების ღირებულება გამოითვლება ამანათის რეალური წონის მიხედვით. წონის დამრგვალება ხდება 100 გრამამდე, მინიმალური წონა შეადგენს 100 გრამს.კომპანია Postify მოცულობით ითვლის მხოლოდ განსაკუთრებული გაბარიტების მქონე ნივთებს და ღირებულების განსაზღვრა მოხდება შეთანხმებით.',
      },
      {
        id: 'declaration-service',
        title: 'დეკლარირება და განბაჟების მომსახურება',
        content:
          'დამკვეთი ვალდებულია მოახდინოს მისი კუთვნილი ნივთის დეკლარირება. დეკლარაციაში მითითებულ ნებისმიერ ინფორმაციაზე პასუხისმგებელია დამკვეთი. შემსრულბელი დამკვეთს უწევს მხოლოდ საბაჟოზე მომსახურებას. ამანათების დეკლარიება სავალდებულოა, დაუდეკლარირებელი ამანათები შეჩერდება საბაჟოზე. ტვირთის განბაჟებაზე და დღგ-ეს დროულ გადახდაზე პასუხისმგებელია დამკვეთი. შემსრულებელი დამკვეთს გაუწევს მხოლოდ სადეკლარანტო სერვისს, რაც გულისხმობს დეკლარაციის ფორმის შევსებას. იმ შემთხვევაში თუ დამკვეთმა არ გადაიხადა ბაჟი, ვერ ჩაეტია შესაბამის ვადებში (ბაჟის გადახდის) მიუთითა არასწორი ინფორმაცია დეკლარაციაში, პასუხისმგებელი არის დამკვეთი. დამკვეთის მიერ არასწორი ინფორმაციის საფუძველზე თუ დაზარალდა კომპანია Postify, დამკვეთი ზარალს აუნაზღაურებს კომპანიას სრულად.',
      },
      {
        id: 'third-party-pickup',
        title: 'ამანათის გაცემა მესამე პირზე',
        content:
          'ამანათის გაცემა მესამე პირზე ხდება შემდეგი დოკუმენტაციის წარმოდგენის შემთხვევაში: პირადობის მოწმობა, პირადობის მოწმობის ასლი, პიროვნების დამადასტურებელი სხვა დოკუმენტი, მინდობილობა.',
      },
      {
        id: 'confidentiality',
        title: 'კონფიდენციალურობა',
        content:
          'მომხმარებლის შესახებ, ნებისმიერი სახის ინფორმაცია, რომელიც ინახება კომპანია Postify-ის ბაზაში წარმოადგენს კონფიდენციალურ მასალას. კომპანია Postify აღნიშნულ ინფორმაციას არ გადასცემს მესამე პირს, თუ ამას არ მოითხოვს სახელმწიფოს წარმომადგენელი ორგანო, შესაბამისი მოთხოვნის საფუძველზე. აღნიშნული ინფორმაცია ინახება ბაზებში და დაცულია უცხო პირებისგან. თავის მხრივ, მომხმარებელი ვალდებულია არ გადასცეს მესამე პირს ისეთი ინფორმაცია როგორიცაა: ა) ტრანსპორტირების ანაზღაურების ტარიფი, რომელიც შეთანხმებულია მხოლოდ დამკვეთთან; ბ) ფინანსური დოკუმენტები, როგორიცაა ინვოისი. მადლობა რომ სარგებლობთ ჩვენი მომსახურებით 💚',
      },
      {
        id: 'declarant-service',
        title: 'დეკლარანტის მომსახურება',
        content:
          'კომპანია Postify მომხმარებლებს სადეკლარანტო მომსახურებას გაუწევს უფასოდ. დეკლარაციის დაბეჭდვა უფასოა როგორც ფიზიკურ, ასევე იურიდიული პირებისთვის.',
      },
    ]
    : [

      {
        id: 'provider-duties',
        title: 'Provider rights and obligations',
        content:
          'Postify transports parcels from 9 countries to Georgia. The company is not responsible for the accuracy of information provided by the customer during registration. If the product ordered by the customer does not arrive at our office due to an error by the online store, or if the online store cancels the order, the company is not liable for any resulting loss. Postify undertakes to transport parcels safely, and in case of loss, the damage will be compensated. Postify is responsible only for items that are visibly damaged (torn, opened, crushed). The item must be inspected on-site; otherwise, claims will not be accepted. Compensation does not apply to fragile items. Postify is not responsible for the validity period, quality, or quantity of the products. The customer is obliged to provide all documents related to the purchased item. In the event of compensation, the provider retains the damaged item in the warehouse. For investigation purposes, before reimbursing the loss, Postify may take up to 30 working days and will reimburse the customer within 5 working days on the basis of a delivery-acceptance act.'
      },
      {
        id: 'customer-duties',
        title: "Customer's Rights and Obligations",
        content:
          'The customer is obliged to correctly declare the parcel on the provider’s website (www.....) in their personal account no later than 3 calendar days after the parcel’s tracking code appears; the customer must pay the parcel transportation fee before collecting the item; the customer must check the item before collecting the parcel, otherwise no claims will be accepted after collection.',
      },
      {
        id: 'calculation-rules',
        title: 'Calculation Rules',
        content:
          'The cost of parcel transportation is calculated based on the actual weight of the parcel. The weight is rounded to 100 grams, and the minimum chargeable weight is 100 grams. Postify calculates by volumetric weight only for items with especially large dimensions, and the price will be determined by mutual agreement.',
      },
      {
        id: 'declaration-service',
        title: 'Declaration and Customs Clearance Service',
        content:
          'The customer is obliged to declare their item. The customer is responsible for any information indicated in the declaration. The provider only offers services at customs to the customer. Declaring parcels is mandatory; undeclared parcels will be held at customs. The customer is responsible for customs clearance and timely payment of VAT. The provider will only offer declarant services to the customer, which means filling out the declaration form. If the customer does not pay the customs duty, fails to meet the relevant deadlines for payment, or provides incorrect information in the declaration, the customer bears responsibility. If Postify suffers damage due to incorrect information provided by the customer, the customer will fully compensate the company for the loss.',
      },
      {
        id: 'third-party-pickup',
        title: 'Parcel Release to a Third Party',
        content:
          'A parcel may be released to a third party upon presentation of the following documents: identity card, copy of the identity card, another identity document, and a power of attorney.',
      },
      {
        id: 'confidentiality',
        title: 'Confidentiality',
        content:
          'Any information about the customer stored in Postify’s database is confidential material. Postify does not disclose this information to third parties unless this is required by a state authority on the basis of an appropriate request. This information is stored in databases and protected from unauthorized persons. In turn, the customer is obliged not to disclose to third parties such information as: (a) the transportation tariff, which is agreed only with the customer; (b) financial documents such as an invoice. Thank you for using our service ',
      },
      {
        id: 'declarant-service',
        title: 'Declarant Service',
        content:
          'Postify provides declarant services to customers free of charge. Printing the declaration is free for both individuals and legal entities.',
      },
    ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        id="conditions"
        className="w-full pt-14 mt-14 md:pt-20 pb-16 md:pb-24 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 md:mb-12">
                <h1 className="text-center md:text-left font-bold text-[22px] md:text-[32px] leading-tight">
                  {pageTitle}
                </h1>
           

          </div>

          <div className="space-y-6 md:space-y-7 text-black md:text-[16px] text-[14px] leading-relaxed">
            {sections.map((section, index) => (
              <article
                key={section.id}
                id={section.id}
                className="relative overflow-hidden rounded-3xl border border-pink-200/60 bg-gradient-to-br from-white via-pink-50 to-indigo-50 shadow-xl p-5 md:p-8"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm transition-all duration-200 bg-gradient-to-br from-purple-500 to-indigo-500 group-hover:scale-105">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold mb-2 md:mb-3 text-[16px] md:text-[20px] text-gray-900">
                      {section.title}
                    </h2>
                    <p className="text-gray-700 whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

