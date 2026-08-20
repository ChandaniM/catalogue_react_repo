// import { Link } from 'react-router-dom';
// import promoImage from '../assets/02.png';

// const PromoBanner: React.FC = () => {
//   return (
//     <section className="w-full mt-10">
//       <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="overflow-hidden rounded-[16px] border border-[#ede4dc] bg-[#f5efe9] p-4 sm:p-5">
//           <div className="grid items-center gap-5 md:grid-cols-[0.7fr_1.4fr]">
//             <div className="h-[150px] sm:h-[180px] overflow-hidden rounded-[14px] bg-white">
//               <img src={promoImage} alt="Gift hamper" className="h-full w-full object-cover" />
//             </div>

//             <div className="flex flex-col gap-3">
//               <p className="text-[0.68rem] uppercase tracking-[0.28em] text-gray-500">Plan ahead</p>
//               <h3 className="text-xl sm:text-2xl font-semibold text-black">Planning a special celebration?</h3>
//               <p className="text-sm text-gray-600 max-w-xl">Pre-order your gifts and we'll have them ready when you need them.</p>

//               <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
//                 <Link to="/pre-orders" className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white">
//                   Pre-order now →
//                 </Link>

//                 <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700">
//                   <span className="inline-flex items-center gap-2"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200">🎁</span> Choose your gift</span>
//                   <span className="inline-flex items-center gap-2"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200">📅</span> Select date</span>
//                   <span className="inline-flex items-center gap-2"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200">💝</span> We'll take care</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PromoBanner;


import { Link } from 'react-router-dom';
import promoImage from '../assets/filer image.png';

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
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ded4cb] bg-white text-sm">
                    🎁
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
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ded4cb] bg-white text-sm">
                    📅
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
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ded4cb] bg-white text-sm">
                    💝
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