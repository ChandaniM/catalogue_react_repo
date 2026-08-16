const NewsletterSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 mt-10 mb-12">
      <div className="rounded-2xl border border-gray-200 bg-[rgba(244,238,232,0.7)] overflow-hidden p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-gray-500 mb-2">Stay in the loop</p>
          <h3 className="text-xl font-semibold text-black mb-2">Get 10% off your first order</h3>
          <p className="text-gray-600">Sign up for exclusive offers, new arrivals and gifting inspiration.</p>
        </div>

        <form className="w-full sm:w-auto flex items-center gap-2">
          <input type="email" placeholder="Enter your email address" className="rounded-full border border-gray-200 px-4 py-2 outline-none w-full sm:w-80" />
          <button className="rounded-full bg-black text-white px-4 py-2 text-sm font-semibold">Subscribe</button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
