import React from "react";
import Image from "next/image";

type Step = {
  id: number;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
};




function StepBadge({ n }: { n: number }) {
  return (
    <span className="absolute right-5 top-5 grid h-6 w-6 place-items-center rounded-full bg-[#3a5bff] text-xs font-semibold text-white ring-2 ring-[#f5f7fa]">
      {n}
    </span>
  );
}

function ArrowDivider() {
  return (
    <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
      <div className="flex items-center gap-2 text-slate-300">
        <span className="h-px w-10 bg-slate-200" />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M10 7l5 5-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="h-px w-10 bg-slate-200" />
      </div>
    </div>
  );
}

export default function Works() {
  const steps: Step[] = [
    {
      id: 1,
      title: "რეგისტრაცია",
      subtitle: "იღებ ჩვენ უცხოურ მისამართს",
      imageSrc: "/works/1.png",
      imageAlt: "Step 1",
    },
    {
      id: 2,
      title: "აგზავნი ამანათს",
      subtitle: "ონლაინ შოპონგიდან ან პირადად",
      imageSrc: "/works/2.png",
      imageAlt: "Step 2",
    },
    {
      id: 3,
      title: "იღებ საქართველოში",
      subtitle: "სწრაფად და უსაფრთხოდ",
      imageSrc: "/works/5.png",
      imageAlt: "Step 3",
    },
  ];

  return (
    <section className="relative flex w-full items-center justify-center overflow-hidden bg-white pb-0 md:pb-14">
      <div className="pointer-events-auto mx-auto w-full max-w-8xl overflow-hidden rounded-2xl border border-[#e8eaf0] bg-[#f5f7fa] shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="px-4 py-5 sm:px-6 md:px-8 md:py-7">
          <h2 className="text-center text-lg font-semibold text-slate-900 md:text-xl">
            როგორ მუშაობს
          </h2>

          <div className="mt-5 grid grid-cols-1 justify-items-center gap-4 md:mt-6 lg:justify-items-stretch lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/70 px-4 py-4 text-center ring-1 ring-[#e8eaf0] backdrop-blur-[2px] md:flex-row md:items-center md:gap-4 md:bg-transparent md:px-0 md:py-0 md:text-left md:ring-0 md:backdrop-blur-0">
                  <div
                    className={`relative w-[170px] shrink-0 ${
                      s.id === 3 ? "h-[140px]" : "h-[170px]"
                    }`}
                  >
                      <Image
                        src={s.imageSrc}
                        alt={s.imageAlt}
                        width={150}
                        height={150}
                        className="h-full w-full object-contain object-center"
                        priority={s.id === 1}
                      />
                      <StepBadge n={s.id} />
                  
                 
                 
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 md:text-[15px]">
                      {s.title}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-slate-500">
                      {s.subtitle}
                    </p>
                  </div>
                </div>

                {idx !== steps.length - 1 && <ArrowDivider />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}