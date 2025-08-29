import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactUsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-3">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-green-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-green-800 dark:text-green-200">Contact OnlyFarmers Headquarters</h1>
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-block bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold px-4 py-2 rounded-xl">Home</Link>
            <Link to="/profile" className="inline-block bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-2 rounded-xl">Profile</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-bold mb-2">Headquarters</h2>
            <div className="text-gray-800 dark:text-gray-200">OnlyFarmers HQ</div>
            <div className="text-gray-800 dark:text-gray-200">42, Green Valley Park</div>
            <div className="text-gray-800 dark:text-gray-200">Bengaluru, Karnataka 560001</div>
            <div className="mt-2"><a className="text-green-700 dark:text-green-300 hover:underline" href="tel:+911234567890">+91 12345 67890</a></div>
            <div><a className="text-green-700 dark:text-green-300 hover:underline" href="mailto:contact@onlyfarmers.in">contact@onlyfarmers.in</a></div>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input className="nav-filter-input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
            <input className="nav-filter-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <textarea className="nav-filter-input" rows={4} placeholder="How can we help?" value={message} onChange={e => setMessage(e.target.value)} required />
            <button className="nav-filter-apply" type="submit">Send</button>
            {sent && <div className="text-green-700 dark:text-green-300">Thanks! We’ll get back to you shortly.</div>}
          </form>
        </div>
      </div>
    </div>
  );
}


