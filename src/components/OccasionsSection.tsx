import { Gift, Cake, Heart, Briefcase, Star, Baby, Gift as GiftIcon, Gift as GiftIcon2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const occasions = [
  { key: 'birthday', label: 'Birthday', icon: Cake },
  { key: 'anniversary', label: 'Anniversary', icon: Heart },
  { key: 'wedding', label: 'Wedding', icon: Gift },
  { key: 'corporate', label: 'Corporate', icon: Briefcase },
  { key: 'festive', label: 'Festive', icon: Star },
  { key: 'new-baby', label: 'New Baby', icon: Baby },
  { key: 'thank-you', label: 'Thank You', icon: GiftIcon },
  { key: 'just-because', label: 'Just Because', icon: GiftIcon2 },
];

const OccasionsSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 mt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">Shop by occasion</p>
          <h2 className="text-xl font-semibold text-black">Find the perfect gift for every occasion.</h2>
        </div>
        <Link to="/occasions" className="inline-flex items-center gap-2 text-sm font-semibold uppercase text-gray-700">View all <span className="ml-1">→</span></Link>
      </div>

      <div className="flex gap-6 overflow-x-auto py-3">
        {occasions.map((oc) => {
          const Icon = oc.icon as any;
          return (
            <Link to={`/occasions/${oc.key}`} key={oc.key} className="flex-shrink-0 w-28">
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm">
                  <Icon size={20} className="text-gray-700" />
                </div>
                <div className="text-center text-sm text-gray-600">{oc.label}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default OccasionsSection;
