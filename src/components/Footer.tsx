const Footer = () => {
  return (
    <footer className="py-10 mt-auto border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-3">
        <span className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-black">
          Uphar The Gift Shop
        </span>
        <div className="flex gap-3 sm:gap-4 md:gap-5 mt-1 sm:mt-2">
          <a
            href="https://www.instagram.com/upharthegiftshop?igsh=MTRndTRzMHpwbHBrMA=="
            aria-label="Instagram"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full border border-gray-200 text-black hover:bg-gray-100 transition"
          >
            <i className="fab fa-instagram" />
          </a>
          <a
            href="https://wa.me/917700083353"
            aria-label="WhatsApp"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full border border-gray-200 text-black hover:bg-gray-100 transition"
          >
            <i className="fab fa-whatsapp" />
          </a>
        </div>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
          Made with Love by <a href="https://chandanimourya.netlify.app/" target="_blank" rel="noreferrer" className="text-black hover:underline">ChandaniMourya</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
