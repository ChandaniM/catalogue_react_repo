import { Link } from 'react-router-dom';
import promoImage from '../assets/filer image.png';
import { CalendarDays, Gift, Heart } from 'lucide-react';

const PromoBanner: React.FC = () => {
  return (
    <section className="w-full mt-10" style={{ marginBottom: '3rem' }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[16px] border border-[#ede4dc] bg-[#f5efe9]">
          <div className="grid items-center md:grid-cols-[250px_minmax(0,1fr)_260px]">

            {/* Gift Image - CLICKABLE */}
            <Link
              to="/pre-orders"
              className="block h-[150px] sm:h-[180px] md:h-[150px] overflow-hidden"
            >
              <img
                src={promoImage}
                alt="Gift hamper"
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </Link>

            {/* Main Content */}
            <div className="px-6 py-6 md:px-8">
              <p className="mb-1 text-[0.62rem] font-medium uppercase tracking-[0.28em] text-[#9b7555]">
                Plan ahead
              </p>

              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-black">
                Planning a special celebration?
              </h3>

              <p className="mt-1.5 max-w-xl text-sm leading-5 text-gray-600">
                Pre-order your gifts and we'll have them ready when you need them.
              </p>

              {/* CLICKABLE BUTTON */}
              <Link
                to="/pre-orders"
                className="mt-4 inline-flex items-center justify-center rounded-[4px] bg-black px-7 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-gray-800"
              >
                Pre-order now
                <span className="ml-3 text-sm">→</span>
              </Link>
            </div>

            {/* Benefits */}
            <div className="border-t border-[#e8ddd3] px-6 py-5 md:border-l md:border-t-0 md:px-7">
              <div className="space-y-3">

                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ded4cb] bg-white">
                    <Gift size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-800">
                      Choose your gift
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Pick from our collection
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ded4cb] bg-white">
                    <CalendarDays size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-800">
                      Select date
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Choose your delivery date
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ded4cb] bg-white">
                    <Heart size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-800">
                      We'll take care
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Perfectly packed & delivered
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;