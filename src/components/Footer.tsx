const Footer = () => {
  return (
    <footer className="py-5 sm:py-6 md:py-8 lg:py-10 mt-auto" style={{ background: 'linear-gradient(135deg, #7a4d6a 0%, #9c6b8a 100%)' }}>
      <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
        <span className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white">
          Uphar The Gift Shop
        </span>
        <div className="flex gap-3 sm:gap-4 md:gap-5 mt-1 sm:mt-2">
          <a
            href="https://www.instagram.com/upharthegiftshop?igsh=MTRndTRzMHpwbHBrMA=="
            aria-label="Instagram"
            target="_blank"
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/20 text-white text-base sm:text-lg md:text-xl hover:bg-white/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <i className="fab fa-instagram" />
          </a>
          <a
            href="https://wa.me/917700083353"
            aria-label="WhatsApp"
            target="_blank"
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/20 text-white text-base sm:text-lg md:text-xl hover:bg-white/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <i className="fab fa-whatsapp" />
          </a>
        </div>
        <p className="text-xs sm:text-sm md:text-base text-white/70 mt-1 sm:mt-2">Made with Love by <a href="https://chandanimourya.netlify.app/" target="_blank" className="text-white hover:underline">ChandaniMourya</a></p>
      </div>
    </footer>
  );
};

export default Footer;
