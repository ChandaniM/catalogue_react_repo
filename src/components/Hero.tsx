import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchSlides } from '../lib/slides';
import type { Slide } from '../types';

const Hero = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loadSlides = async () => {
      const slideData = await fetchSlides();
      setSlides(slideData);
    };
    loadSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    setActiveIndex((current) => (current >= slides.length ? 0 : current));
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, [slides]);

  const activeSlide = useMemo(
    () => slides[activeIndex] || slides[0] || {
      title: 'Shop the best collectibles',
      subtitle: 'Discover premium gifts, exclusive drops, and curated collectible items.',
      button: 'View collection',
      image: '',
    },
    [activeIndex, slides]
  );

  return (
    <section className="max-w-7xl mx-auto px-6 pt-8 pb-10">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] items-stretch">
          <div className="p-8 lg:p-10 flex flex-col justify-center gap-6">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-gray-500">
              Premium collectibles
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-black max-w-xl">
              {activeSlide?.title || 'Shop the best collectibles'}
            </h1>
            <p className="max-w-md text-base text-gray-600">{activeSlide?.subtitle || 'Discover premium gifts, exclusive drops, and curated collectible items.'}</p>
            <button className="inline-flex items-center justify-center gap-2 rounded-sm border border-black bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black">
              {activeSlide?.button || 'View collection'}
              <ArrowRight size={16} />
            </button>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="font-medium text-black">Trending now</span>
              <span className="h-0.5 w-12 bg-black" />
              <span>Curated gift picks for collectors</span>
            </div>
          </div>
          <div className="relative bg-black min-h-[420px]">
            <img
              src={activeSlide?.image}
              alt={activeSlide?.title || 'Hero slide'}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-4 p-6">
              <button
                type="button"
                onClick={() => {
                  if (!slides.length) return;
                  setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
                }}
                disabled={slides.length === 0}
                className="rounded-full border border-white/20 bg-white/10 p-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!slides.length) return;
                  setActiveIndex((index) => (index + 1) % slides.length);
                }}
                disabled={slides.length === 0}
                className="rounded-full border border-white/20 bg-white/10 p-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="absolute left-1/2 top-full flex -translate-x-1/2 gap-2 pt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 w-8 rounded-full transition ${index === activeIndex ? 'bg-black' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
