export type SectionItem = {
  id: string;
  title: string;
  content: string;
  /** Optional list rendered as <ul> after the paragraph */
  listItems?: string[];
  /** Optional paragraph after the list (e.g. closing thanks) */
  contentAfterList?: string;
};

export const sectionsKa: SectionItem[] = [
  {
    id: "provider-duties",
    title: "შემსრულებლის უფლება-მოვალეობები",
    content:
      "კომპანია Postifly-ის  მიერ ამანათების ტრანსპორტირება ხდეა 9 ქვეყნიდან საქართველოში; კომპანია პასუხს არ აგებს რეგისტრაციისას მომხმარებლის მიერ შევსებული ინფორმაციის სისწორეზე; თუ მომხმარებლის მიერ შეკვეთილი პროდუქცია არ მივა ჩვენს ოფისებამდე „ონლაინ მაღაზიის“ შეცდომის გამო ან „ონლაინ მაღაზია“ გააუქმებს შეკვეთას, კომპანია არ აგებს პასუხს ზარალის ანაზღაურებაზე; კომპანია Postifly იღებს ვალდებულებას ამანათების უვნებლად ტრანსპორტირებაზე, დაკარგვის შემთხვევაში ზარალი იქნება ანაზღაურებული; კომპანია Postifly არის პასუხისმგებელი ისეთ ნივთზე, რომელიც გარეგნულად იქნება დაზიანებული (დახეული, გახნსილი, შეჭყლეტილი). ნივთის შემოწმება ხდება ადგილზე, სხვა შემთხვევაში პრეტენზია არ მიიღება. ანაზღაურება არ ვრცელდება მტვრევად ნივთებზე. კომპანია Postifly   არ აგებს პასუხს პროდუქციის ვარგისიანობაზე, ხარისხზე და მათ რაოდენობაზე; მომხმარებელი ვალდებულია წარმოადგინოს ყველა საბუთი, რაც კავშირში იქნება შეძენილ ნივთთან; კომპენსაციის შემთხვევაში შემსრულებელი იტოვებს საწყობში დაზიანებულ ნივთს;   კომპანია Postifly  მოკვლევის მიზნით ზარალის ანაზღაურებამდე ითხოვს მაქსიმუმ 30 სამუშაო დღეს, ხოლო ზარალის თანხას უნაზღაურებს დამკვეთს 5 სამუშაო დღეში, მიღება ჩაბარების აქტის საფუძველზე.",
  },
  {
    id: "customer-duties",
    title: "დამკვეთის უფლება-მოვალეობები",
    content:
      'დამკვეთი ვალდებულია შემსრულებლის ვებ გვერდზე www.postifly.ge მოახდინოს ამანათის სწორად დეკლარირება, დამკვეთის პირად კაბინეტში ამანათის თრექინგ კოდის ასახვიდან არაუგვიანეს 3 კალენდარულ დღეში; დამკვეთი ვალდებულია დაფაროს ამანათის ტრანსპორტირების საფასური ნივთის გატანის წინ; დამკვეთი ვალდებულია ამანათის გატანამდე შეამოწმოს ნივთი, წინააღმდეგ შემთხვევაში, ამანათის გატანის შემდეგ პრეტენზიები არ მიიღება.',
  },
  {
    id: "calculation-rules",
    title: "დაანგარიშების წესი",
    content:
      "ამანათის ტრანსპორტირების ღირებულება გამოითვლება ამანათის რეალური წონის მიხედვით. წონის დამრგვალება ხდება 1 კილომდე, მინიმალური წონა შეადგენს 1 კილოგრამს.კომპანია Postifly მოცულობით ითვლის მხოლოდ განსაკუთრებული გაბარიტების მქონე ნივთებს და ღირებულების განსაზღვრა მოხდება შეთანხმებით.",
  },
  {
    id: "declaration-service",
    title: "დეკლარირება და განბაჟების მომსახურება",
    content:
      "დამკვეთი ვალდებულია მოახდინოს მისი კუთვნილი ნივთის დეკლარირება. დეკლარაციაში მითითებულ ნებისმიერ ინფორმაციაზე პასუხისმგებელია დამკვეთი. შემსრულბელი დამკვეთს უბის მხოლოდ საბაჟოზე მომსახურებას. ამანათების დეკლარიება სავალდებულოა, დაუდეკლარირებელი ამანათები შეჩერდება საბაჟოზე. ტვირთის განბაჟებაზე და დღგ-ეს დროულ გადახდაზე პასუხისმგებელია დამკვეთი. შემსრულებელი დამკვეთს გაუწევს მხოლოდ სადეკლარანტო სერვისს, რაც გულისხმობს დეკლარაციის ფორმის შევსებას. იმ შემთხვევაში თუ დამკვეთმა არ გადაიხადა ბაჟი, ვერ ჩაეტია შესაბამის ვადებში (ბაჟის გადახდის) მიუთითა არასწორი ინფორმაცია დეკლარაციაში, პასუხისმგებელი არის დამკვეთი. დამკვეთის მიერ არასწორი ინფორმაციის საფუძველზე თუ დაზარალდა კომპანია Postifly, დამკვეთი ზარალს აუნაზღაურებს კომპანიას სრულად.",
  },
  {
    id: "third-party-pickup",
    title: "ამანათის გაცემა მესამე პირზე",
    content:
      "ამანათის გაცემა მესამე პირზე ხდება შემდეგი დოკუმენტაციის წარდგენის შემდეგ:",
    listItems: [
      "პირადობის მოწმობა",
      "პირადობის მოწმობის ასლი",
      "პიროვნების დამადასტურებელი სხვა დოკუმენტი",
      "მინდობილობა",
    ],
  },
  {
    id: "confidentiality",
    title: "კონფიდენციალურობა",
    content:
      "მომხმარებლის შესახებ, ნებისმიერი სახის ინფორმაცია, რომელიც ინახება კომპანია Postifly-ის ბაზაში წარმოადგენს კონფიდენციალურ მასალას. კომპანია Postifly აღნიშნულ ინფორმაციას არ გადასცემს მესამე პირს, თუ ამას არ მოითხოვს სახელმწიფოს წარმომადგენელი ორგანო, შესაბამისი მოთხოვნის საფუძველზე. აღნიშნული ინფორმაცია ინახება ბაზებში და დაცულია უცხო პირებისგან. თავის მხრივ, მომხმარებელი ვალდებულია არ გადასცეს მესამე პირს ისეთი ინფორმაცია როგორიცაა:",
    listItems: [
      "ტრანსპორტირების ანაზღაურების ტარიფი, რომელიც შეთანხმებულია მხოლოდ დამკვეთთან",
      "ფინანსური დოკუმენტები, როგორიცაა ინვოისი",
    ],
  },
  {
    id: "declarant-service",
    title: "დეკლარანტის მომსახურება",
    content:
      "კომპანია Postifly მომხმარებლებს სადეკლარანტო მომსახურებას გაუწევს უფასოდ. დეკლარაციის დაბეჭდვა უფასოა როგორც ფიზიკურ, ასევე იურიდიული პირებისთვის.",
  },
];

export const sectionsRu: SectionItem[] = [
  {
    id: "provider-duties",
    title: "Права и обязанности исполнителя",
    content:
      "Компания Postifly осуществляет перевозку посылок из 9 стран в Грузию. Компания не несёт ответственности за достоверность сведений, указанных клиентом при регистрации. Если заказанный товар не поступает в офис из-за ошибки интернет-магазина или магазин отменяет заказ, компания не возмещает убытки. Postifly обязуется перевозить посылки с сохранностью; в случае утраты ущерб подлежит возмещению. Компания несёт ответственность за товары с видимыми повреждениями (порванная упаковка, вскрытие, смятие). Осмотр проводится на месте; в ином случае претензии не принимаются. Возмещение не распространяется на хрупкие товары. Postifly не отвечает за срок годности, качество и количество продукции. Клиент обязан предоставить все документы, связанные с приобретённым товаром. При компенсации исполнитель оставляет повреждённый товар на складе. До возмещения ущерба Postifly вправе провести проверку в срок до 30 рабочих дней, а сумму возместить заказчику в течение 5 рабочих дней на основании акта приёма-передачи.",
  },
  {
    id: "customer-duties",
    title: "Права и обязанности заказчика",
    content:
      "Заказчик обязан корректно задекларировать посылку на сайте исполнителя www.postifly.ge в личном кабинете не позднее 3 календарных дней с момента появления трек-номера посылки; оплатить перевозку посылки до выдачи товара; до выдачи проверить товар — иначе претензии после выдачи не принимаются.",
  },
  {
    id: "calculation-rules",
    title: "Правила расчёта",
    content:
      "Стоимость перевозки рассчитывается по фактическому весу посылки. Вес округляется до 1 килограмма, минимальный тарифицируемый вес — 1 кг. Postifly применяет объёмный вес только для товаров особо крупных габаритов; стоимость в таких случаях определяется по соглашению сторон.",
  },
  {
    id: "declaration-service",
    title: "Декларирование и таможенное оформление",
    content:
      "Заказчик обязан задекларировать принадлежащий ему товар. За сведения, указанные в декларации, отвечает заказчик. Исполнитель оказывает заказчику услуги только на таможне. Декларирование посылок обязательно; недекларированные посылки задерживаются на таможне. За таможенное оформление груза и своевременную уплату НДС отвечает заказчик. Исполнитель предоставляет только услуги декларанта, то есть заполнение формы декларации. Если заказчик не уплатил пошлину, не уложился в сроки уплаты или указал неверные данные в декларации, ответственность несёт заказчик. Если из-за неверных данных заказчика компания Postifly понесла убытки, заказчик возмещает их в полном объёме.",
  },
  {
    id: "third-party-pickup",
    title: "Выдача посылки третьему лицу",
    content:
      "Посылка выдаётся третьему лицу при предъявлении следующих документов:",
    listItems: [
      "удостоверение личности",
      "копия удостоверения",
      "иной документ, удостоверяющий личность",
      "доверенность",
    ],
  },
  {
    id: "confidentiality",
    title: "Конфиденциальность",
    content:
      "Любые сведения о пользователе, хранящиеся в базе компании Postifly, являются конфиденциальными. Postifly не передаёт эту информацию третьим лицам, если этого не требует государственный орган на основании надлежащего запроса. Информация хранится в базах данных и защищена от постороннего доступа. Пользователь, в свою очередь, обязан не передавать третьим лицам:",
    listItems: [
      "тариф на перевозку и возмещение, согласованный только с заказчиком",
      "финансовые документы, например счёт (инвойс)",
    ],
    contentAfterList: "Спасибо, что пользуетесь нашим сервисом.",
  },
  {
    id: "declarant-service",
    title: "Услуги декларанта",
    content:
      "Компания Postifly оказывает пользователям услуги декларанта бесплатно. Печать декларации бесплатна как для физических, так и для юридических лиц.",
  },
];

export const sectionsEn: SectionItem[] = [
  {
    id: "provider-duties",
    title: "Provider rights and obligations",
    content:
      "Postifly transports parcels from 9 countries to Georgia. The company is not responsible for the accuracy of information provided by the customer during registration. If the product ordered by the customer does not arrive at our office due to an error by the online store, or if the online store cancels the order, the company is not liable for any resulting loss. Postifly undertakes to transport parcels safely, and in case of loss, the damage will be compensated. Postifly is responsible only for items that are visibly damaged (torn, opened, crushed). The item must be inspected on-site; otherwise, claims will not be accepted. Compensation does not apply to fragile items. Postifly is not responsible for the validity period, quality, or quantity of the products. The customer is obliged to provide all documents related to the purchased item. In the event of compensation, the provider retains the damaged item in the warehouse. For investigation purposes, before reimbursing the loss, Postifly may take up to 30 working days and will reimburse the customer within 5 working days on the basis of a delivery-acceptance act.",
  },
  {
    id: "customer-duties",
    title: "Customer's Rights and Obligations",
    content:
      "The customer is obliged to correctly declare the parcel on the provider's website www.postifly.ge in their personal account no later than 3 calendar days after the parcel's tracking code appears; the customer must pay the parcel transportation fee before collecting the item; the customer must check the item before collecting the parcel, otherwise no claims will be accepted after collection.",
  },
  {
    id: "calculation-rules",
    title: "Calculation Rules",
    content:
      "The cost of parcel transportation is calculated based on the actual weight of the parcel. The weight is rounded to 1 kilogram, and the minimum chargeable weight is 1 kilogram. Postifly calculates by volumetric weight only for items with especially large dimensions, and the price will be determined by mutual agreement.",
  },
  {
    id: "declaration-service",
    title: "Declaration and Customs Clearance Service",
    content:
      "The customer is obliged to declare their item. The customer is responsible for any information indicated in the declaration. The provider only offers services at customs to the customer. Declaring parcels is mandatory; undeclared parcels will be held at customs. The customer is responsible for customs clearance and timely payment of VAT. The provider will only offer declarant services to the customer, which means filling out the declaration form. If the customer does not pay the customs duty, fails to meet the relevant deadlines for payment, or provides incorrect information in the declaration, the customer bears responsibility. If Postifly suffers damage due to incorrect information provided by the customer, the customer will fully compensate the company for the loss.",
  },
  {
    id: "third-party-pickup",
    title: "Parcel Release to a Third Party",
    content:
      "A parcel may be released to a third party upon presentation of the following documents:",
    listItems: [
      "identity card",
      "copy of the identity card",
      "another identity document",
      "power of attorney",
    ],
  },
  {
    id: "confidentiality",
    title: "Confidentiality",
    content:
      "Any information about the customer stored in Postifly's database is confidential material. Postifly does not disclose this information to third parties unless this is required by a state authority on the basis of an appropriate request. This information is stored in databases and protected from unauthorized persons. In turn, the customer is obliged not to disclose to third parties such information as:",
    listItems: [
      "the transportation tariff, which is agreed only with the customer",
      "financial documents such as an invoice",
    ],
    contentAfterList: "Thank you for using our service.",
  },
  {
    id: "declarant-service",
    title: "Declarant Service",
    content:
      "Postifly provides declarant services to customers free of charge. Printing the declaration is free for both individuals and legal entities.",
  },
];

export function getConditionsSections(locale: string): SectionItem[] {
  if (locale === "ka") return sectionsKa;
  if (locale === "ru") return sectionsRu;
  return sectionsEn;
}
