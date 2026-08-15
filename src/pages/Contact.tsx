import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import ShippingBar from '../components/ShippingBar';
import { useState } from 'react';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In this starter implementation, just log and show a success message.
    console.log('Contact form submitted', { name, email, message });
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ShippingBar />
      <NavBar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold mb-4">Contact Us</h1>
        <p className="text-gray-600 mb-8">Questions, custom orders, or feedback — we'd love to hear from you.</p>

        {sent && (
          <div className="mb-6 rounded-md bg-green-50 border border-green-200 p-4 text-green-800">Thanks — your message has been sent.</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full rounded-md border border-gray-200 px-3 py-2 outline-none focus:border-black" />
          </div>

          <div>
            <button type="submit" className="rounded-full bg-black text-white px-5 py-2 text-sm font-semibold">Send message</button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
