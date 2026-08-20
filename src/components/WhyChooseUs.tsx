const features = [
  { key: 'curated', title: 'Thoughtfully Curated', desc: 'Handpicked gifts for every occasion', icon: '🎁' },
  { key: 'quality', title: 'Premium Quality', desc: 'Only the best for your loved ones', icon: '⭐' },
  { key: 'personal', title: 'Personalised for You', desc: 'Add your personal touch to every gift', icon: '✍️' },
  { key: 'delivery', title: 'Reliable Delivery', desc: 'On-time delivery, every single time', icon: '🚚' },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 mt-10">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.key} className="flex gap-4 items-start bg-white rounded-xl border border-gray-100 p-4">
              <div className="h-12 w-12 rounded-full bg-[rgba(250,244,238,0.9)] flex items-center justify-center text-xl">{f.icon}</div>
              <div>
                <h4 className="text-sm font-semibold text-black">{f.title}</h4>
                <p className="text-xs text-gray-600">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
