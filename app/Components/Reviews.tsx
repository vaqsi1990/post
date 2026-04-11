"use client" 
import React from 'react'

const REVIEWS = [
  {
    name: 'ვალერიან მარგალიტაძე',
    rating: 5,
    text: 'ამანათები ყოველთვის დროულად მომდის და შეფუთვაც ძალიან კარგი აქვთ.',
  },
  {
    name: 'დავით ჩხარტიშვილი',
    rating: 5,
    text: 'კალკულატორი ზუსტ ფასს მაჩვენებს და სერვისიც ძალიან სწრაფია.',
  },
  {
    name: 'ნინო ჭყონია',
    rating: 4,
    text: 'მხარდაჭერის გუნდი ოპერატიულად მპასუხობს და დეტალურად მიხსნის ყველაფერს.',
  },
  {
    name: 'გიორგი გაბუნია',
    rating: 5,
    text: 'ევროპიდან გზავნილები პრობლემის გარეშე ჩამომივიდა, რეკომენდაციას ვუწევ.',
  },
  {
    name: 'ნინო დავითაძე',
    rating: 5,
    text: 'ხარისხი საუკეთესოა, უკვე რამდენჯერმე გამოვიყენე და კმაყოფილი ვარ.',
  },
]

const Reviews = () => {
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % REVIEWS.length)
    }, 4200)

    return () => window.clearInterval(timerId)
  }, [])

  return (
    <section className="mx-auto w-full max-w-7xl px-3 py-10 sm:px-4 md:py-14">
      <h2 className="mb-6 text-center text-2xl font-extrabold text-gray-900 md:mb-9 md:text-3xl">
        მიმოხილვები
      </h2>

      <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[24px] bg-sky-100 p-5 shadow-[0_20px_40px_-24px_rgba(130,76,255,0.7)] sm:p-7">
        <article className="min-h-[170px] rounded-2xl border border-violet-100/80 bg-white/95 p-5 shadow-[0_12px_30px_-20px_rgba(94,37,208,0.65)] sm:p-6">
          <div className="mb-3 text-xl tracking-[2px] text-amber-500">
            {'★'.repeat(REVIEWS[activeIndex].rating)}
          </div>
          <p className="text-base leading-7 text-gray-700">"{REVIEWS[activeIndex].text}"</p>
          <p className="mt-4 text-sm font-bold text-violet-700">{REVIEWS[activeIndex].name}</p>
        </article>

        <div className="mt-5 flex items-center justify-center gap-2">
          {REVIEWS.map((review, index) => (
            <button
              key={review.name}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                activeIndex === index ? 'bg-indigo-500' : 'bg-indigo-100 hover:bg-indigo-300'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Reviews