import React from "react";
import ConditionsAccordion from "./ConditionsAccordion";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ section?: string }>;
};

export default async function ConditionsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { section } = await searchParams;
  const isKa = locale === "ka";

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        id="conditions"
        className="w-full pt-14 mt-14 md:pt-20 pb-16 md:pb-24 px-4"
      >
        <ConditionsAccordion isKa={isKa} sectionId={section} />
      </section>
    </div>
  );
}
