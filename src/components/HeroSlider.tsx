import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: 'Gifts made for every kind of moment.',
    subtitle: 'Thoughtful gifts. Beautifully packed. Made to make memories last.',
    cta: { label: 'Shop now', to: '/shop' },
    secondary: { label: 'Pre-order', to: '/pre-orders' },
    bg: 'bg-[#f3eee7]',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    title: 'Curated gifting for every celebration.',
    subtitle: 'Fresh arrivals designed to make each occasion feel special.',
    cta: { label: 'New arrivals', to: '/new-arrivals' },
    secondary: { label: 'Browse categories', to: '/categories' },
    bg: 'bg-[#f8f1ee]',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    title: 'Handmade delight, thoughtfully packed.',
    subtitle: 'Premium gifting essentials for joyful moments and warm memories.',
    cta: { label: 'Shop gifts', to: '/shop' },
    secondary: { label: 'Pre-order now', to: '/pre-orders' },
    bg: 'bg-[#f7f0eb]',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
  },
];

const HeroSlider: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goto = (i: number) => setIndex((i % slides.length + slides.length) % slides.length);

  return (
    <section className="w-full bg-[#f5efe9]">
      <div className="relative overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`transition-opacity duration-700 ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'} absolute inset-0 w-full`}
            style={{ pointerEvents: i === index ? 'auto' : 'none' }}
          >
            <div className={`w-full h-[500px] ${slide.bg}`}>
              <div className="max-w-[1600px] mx-auto h-full px-4 sm:px-6 lg:px-8">
                <div className="grid h-full items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
                  <div className="pt-10 pb-14 max-w-xl">
                    <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gray-600 mb-4">Thoughtfully curated gifts</p>
                    <h2 className="font-serif text-4xl sm:text-5xl lg:text-[4rem] leading-[0.95] tracking-[-0.05em] text-black mb-5">{slide.title}</h2>
                    <p className="text-base text-gray-700 leading-relaxed mb-7">{slide.subtitle}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link to={slide.cta.to} className="inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white">
                        {slide.cta.label} →
                      </Link>
                      <Link to={slide.secondary.to} className="inline-flex rounded-full border border-black bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-black">
                        {slide.secondary.label}
                      </Link>
                    </div>
                  </div>

                  <div className="flex h-full items-center justify-center">
                    <div className="relative h-[360px] w-full max-w-[620px]">
                      <div className="absolute inset-0 rounded-[28px] bg-[#f0e3d6]/80 blur-2xl" />
                      <img src={slide.image} alt={slide.title} className="relative z-10 h-full w-full object-cover rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.12)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goto(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full ${i === index ? 'bg-black' : 'bg-white/80 border border-gray-300'}`}
            />
          ))}
        </div>

        <button
          onClick={() => goto(index - 1)}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-gray-200 bg-white/80 p-2 text-xl shadow-sm"
        >
          ‹
        </button>
        <button
          onClick={() => goto(index + 1)}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-gray-200 bg-white/80 p-2 text-xl shadow-sm"
        >
          ›
        </button>

        <div className="h-[500px] w-full">&nbsp;</div>
      </div>
    </section>
  );
};

export default HeroSlider;
