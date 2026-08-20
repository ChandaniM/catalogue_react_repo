import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className='mt-auto border-t border-gray-200 bg-white'>
      <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        <div className='grid gap-8 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.8fr_1.1fr]'>
          <div className='space-y-5'>
            <div>
              <div className='text-[2rem] font-black leading-none tracking-[-0.08em] text-black'>
                UPHΛRT
              </div>
              <div className='text-[0.62rem] uppercase tracking-[0.22em] text-gray-600 mt-1'>
                The Gift Shop
              </div>
            </div>

            <p className='max-w-xs text-sm text-gray-600 leading-relaxed'>
              Beautiful gifts for every kind of moment — thoughtfully packed,
              premium in quality, and designed to create lasting memories.
            </p>

            <div className='flex gap-3'>
              <a
                href='https://www.instagram.com/upharthegiftshop?igsh=MTRndTRzMHpwbHBrMA=='
                aria-label='Instagram'
                target='_blank'
                rel='noreferrer'
                className='flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-black hover:bg-gray-50'
              >
                <FontAwesomeIcon icon={faInstagram} className='text-base' />
              </a>
              <a
                href='https://wa.me/917700083353'
                aria-label='WhatsApp'
                target='_blank'
                rel='noreferrer'
                className='flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-black hover:bg-gray-50'
              >
                <FontAwesomeIcon icon={faWhatsapp} className='text-base' />
              </a>
              <a
                href='mailto:hello@uphartgiftshop.com'
                aria-label='Email'
                className='flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-sm text-black hover:bg-gray-50'
              >
                <FontAwesomeIcon icon={faEnvelope} className='text-base' />
              </a>
            </div>
          </div>

          <div>
            <h3 className='text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-4'>
              Shop
            </h3>
            <ul className='space-y-2 text-sm text-gray-700'>
              <li>
                <a href='/shop' className='hover:text-black'>
                  All Products
                </a>
              </li>
              <li>
                <a href='/categories' className='hover:text-black'>
                  Gift Hampers
                </a>
              </li>
              <li>
                <a href='/categories' className='hover:text-black'>
                  Personalised Gifts
                </a>
              </li>
              <li>
                <a href='/new-arrivals' className='hover:text-black'>
                  New Arrivals
                </a>
              </li>
              <li>
                <a href='/pre-orders' className='hover:text-black'>
                  Pre-Orders
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-4'>
              Categories
            </h3>
            <ul className='space-y-2 text-sm text-gray-700'>
              <li>
                <a href='/category/keychains' className='hover:text-black'>
                  Keychains
                </a>
              </li>
              <li>
                <a href='/category/photo-frames' className='hover:text-black'>
                  Photo Frames
                </a>
              </li>
              <li>
                <a href='/category/mugs' className='hover:text-black'>
                  Mugs
                </a>
              </li>
              <li>
                <a href='/category/stationery' className='hover:text-black'>
                  Stationery
                </a>
              </li>
              <li>
                <a href='/category/gift-hampers' className='hover:text-black'>
                  Gift Hampers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-4'>
              Contact Details
            </h3>

            <ul className='space-y-2 text-sm text-gray-700'>
              <li>Phone Number: +91 7700083352 / +91 87671 74547</li>
              <li>E-mail: hello@uphartgiftshop.com</li>
              {/* <li> Address: Your address here</li> */}
            </ul>
          </div>
          {/* <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-4">Help & Support</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a href="/faq" className="hover:text-black">FAQs</a></li>
              <li><a href="/shipping" className="hover:text-black">Shipping & Delivery</a></li>
              <li><a href="/returns" className="hover:text-black">Returns & Refunds</a></li>
              <li><a href="/track-order" className="hover:text-black">Track Order</a></li>
            </ul>
          </div> */}
        </div>
        <div className='mt-10 border-t border-gray-200 pt-6'>
          <div className='flex justify-center'>
            <p className='text-sm text-gray-600 text-center'>
              Made with Love by{" "}
              <a
                href='https://chandanimourya.netlify.app/'
                target='_blank'
                rel='noreferrer'
                className='font-medium text-black hover:underline'
              >
                ChandaniMourya
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
