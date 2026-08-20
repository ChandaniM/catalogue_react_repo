import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSlides } from '../lib/slides';
import type { Slide } from '../types';

const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const loadSlides = async () => {
      const slideData = await fetchSlides();
      setSlides(slideData);
    };

    loadSlides();
  }, []);

  useEffect(() => {
    if (!slides.length) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides]);

  const goto = (i: number) => {
    if (!slides.length) return;
    setIndex((i % slides.length + slides.length) % slides.length);
  };

  if (!slides.length) return null;

  return (
    <section className="w-full bg-[#f5efe9]">
      <div className="relative overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`transition-opacity duration-700 ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'} absolute inset-0 w-full`}
            style={{ pointerEvents: i === index ? 'auto' : 'none' }}
          >
            <div className="w-full min-h-[680px] lg:h-[500px] lg:min-h-0 bg-[#f3eee7]">
              <div className="max-w-[1600px] mx-auto h-full px-4 sm:px-6 lg:px-8">
                <div className="grid h-full items-center gap-5 lg:gap-8 lg:grid-cols-[1.1fr_1fr]">
                  <div className=" order-2 max-w-xl px-2 pb-16 pt-2 sm:px-4 sm:pb-14 sm:pt-6 lg:order-1 lg:px-0 lg:py-10" style={{ marginLeft: '1rem'}}>
                    <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gray-600 mb-4">Thoughtfully curated gifts</p>
                    <h2 className="font-serif text-3xl leading-[0.98] tracking-[-0.03em] text-black mb-4 sm:mb-5 sm:text-5xl lg:text-[4rem]">{slide.title}</h2>
                    <p className="text-sm text-gray-700 leading-relaxed mb-5 sm:mb-7 sm:text-base">{slide.subtitle}</p>
                    {(slide.button || slide.button2) && (
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {slide.button && <Link to={slide.buttonUrl || "/shop"} className="inline-flex rounded-full bg-black px-4 py-2.5 text-xs font-semibold uppercase tracking-wide sm:px-5 sm:py-3 sm:text-sm text-white">{slide.button} →</Link>}
                        {slide.button2 && <Link to={slide.button2Url || "/shop"} className="inline-flex rounded-full border border-black px-4 py-2.5 text-xs font-semibold uppercase tracking-wide sm:px-5 sm:py-3 sm:text-sm text-black">{slide.button2} →</Link>}
                      </div>
                    )}
                  </div>

                  <div className="flex order-1 h-[300px] items-center justify-center pt-5 sm:h-[360px] lg:order-2 lg:h-full lg:pt-0" style={{ marginRight: '.8rem'}}>
                    <div className="relative h-full max-h-[360px] w-full max-w-[620px]">
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

        <div className="h-[680px] w-full lg:h-[500px]">&nbsp;</div>
      </div>
    </section>
  );
};

export default HeroSlider;
