import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import { fetchOccasions } from '../services/occasions';
import type { Occasion } from '../types';

const OccasionsPage: React.FC = () => {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchOccasions();
        setOccasions(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black">Occasions</h1>
            <p className="text-sm text-gray-600">Browse gifts organised by occasion.</p>
          </div>

          {loading ? (
            <Loading message="Loading occasions..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {occasions.map((oc) => (
                <Link key={oc.key} to={`/occasions/${oc.key}`} className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col items-center gap-4 no-underline hover:shadow-md">
                  <div className="h-16 w-16 rounded-full border border-gray-200 bg-white flex items-center justify-center">
                    <span className="text-xl text-gray-700">🎉</span>
                  </div>
                  <div className="text-center text-sm text-gray-800 font-medium">{oc.label}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OccasionsPage;
