import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import HeroSlider from '../components/HeroSlider';
import CategorySection from '../components/CategorySection';
import OccasionsSection from '../components/OccasionsSection';
import BestSellers from '../components/BestSellers';
import PromoBanner from '../components/PromoBanner';
import usePageMetadata from '../hooks/usePageMetadata';
// import WhyChooseUs from '../components/WhyChooseUs';

const Catalogue = () => {
  usePageMetadata(
    'Uphar The Gift Shop | Curated Gifts for Every Occasion',
    'Discover thoughtfully curated gifts for birthdays, anniversaries, celebrations, and every special moment at Uphar The Gift Shop.'
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <main className="flex-1">
        {/* Hero slider with 3 slides */}
        <HeroSlider />
        <CategorySection />
        <OccasionsSection />
        <BestSellers />
        <PromoBanner />
        {/* <WhyChooseUs /> */}
        {/* <NewsletterSection /> */}
      </main>
      <Footer />
    </div>
  );
};

export default Catalogue;
