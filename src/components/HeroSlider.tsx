import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: 'Thoughtful gifts for every occasion',
    subtitle: 'Curated collections to make moments memorable',
    cta: { label: 'Shop Gifts', to: '/shop' },
    bg: 'bg-gradient-to-r from-pink-200 via-white to-yellow-100',
  },
  {
    id: 2,
    title: 'New arrivals just landed',
    subtitle: 'Fresh picks and limited drops — discover now',
    cta: { label: 'New Arrivals', to: '/new-arrivals' },
    bg: 'bg-gradient-to-r from-purple-200 via-white to-indigo-100',
  },
  {
    id: 3,
    title: 'Handmade & heart-made',
    subtitle: 'Find handcrafted pieces made with love',
    cta: { label: 'Browse Categories', to: '/categories' },
    bg: 'bg-gradient-to-r from-green-200 via-white to-teal-100',
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
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-[24px] overflow-hidden">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`transition-opacity duration-700 ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'} absolute inset-0 w-full h-[420px] flex items-center`}
            >
              <div className={`w-full h-full flex items-center ${slide.bg} p-8 sm:p-12`}>
                <div className="max-w-3xl">
                  <h2 className="text-3xl sm:text-4xl font-bold text-black mb-3">{slide.title}</h2>
                  <p className="text-lg text-gray-700 mb-6">{slide.subtitle}</p>
                  <Link to={slide.cta.to} className="inline-block rounded-full bg-black text-white px-5 py-2 text-sm font-semibold">
                    {slide.cta.label}
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Controls */}
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goto(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`w-3 h-3 rounded-full ${i === index ? 'bg-black' : 'bg-gray-300'}`}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <button
            onClick={() => goto(index - 1)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm"
          >
            ‹
          </button>
          <button
            onClick={() => goto(index + 1)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm"
          >
            ›
          </button>

          {/* spacer to keep height (since slides are absolutely positioned) */}
          <div className="w-full h-[420px]">&nbsp;</div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
