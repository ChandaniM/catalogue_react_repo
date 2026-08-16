import Footer from '../components/Footer';
import ShippingBar from '../components/ShippingBar';
import NavBar from '../components/NavBar';
import HeroSlider from '../components/HeroSlider';
import CategorySection from '../components/CategorySection';
import OccasionsSection from '../components/OccasionsSection';
import BestSellers from '../components/BestSellers';
import PromoBanner from '../components/PromoBanner';
// import WhyChooseUs from '../components/WhyChooseUs';

const Catalogue = () => {

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ShippingBar />
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
