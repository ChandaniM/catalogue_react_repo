import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

interface HeaderProps {
  showAdminLink?: boolean;
}

const Header = ({ showAdminLink = false }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 py-2 sm:py-3 md:py-4 lg:py-5" style={{ background: 'linear-gradient(135deg, #7a4d6a 0%, #9c6b8a 100%)' }}>
      <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col items-center">
        <Link to="/" className="no-underline">
          <img src={logo} alt="Uphar - The Gift Shop" className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 2xl:h-36" />
        </Link>
        {showAdminLink && (
          <Link to="/" className="btn btn-secondary mt-2 sm:mt-3">
            <i className="fas fa-store" /> View Shop
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
