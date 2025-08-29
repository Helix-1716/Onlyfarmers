import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type ProfileData = { name: string; email: string; avatar: string };

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData>({ name: '', email: '', avatar: '' });
  const [prefAutoOpenNews, setPrefAutoOpenNews] = useState(true);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('of_profile');
      if (raw) setProfile(JSON.parse(raw));
      const news = localStorage.getItem('of_pref_auto_news');
      if (news !== null) setPrefAutoOpenNews(news === '1');
      const b = localStorage.getItem('of_profile_bio');
      if (b) setBio(b);
      const ph = localStorage.getItem('of_profile_phone');
      if (ph) setPhone(ph);
      const ad = localStorage.getItem('of_profile_address');
      if (ad) setAddress(ad);
    } catch {/* ignore localStorage errors */}
  }, []);

  const save = () => {
    try {
      localStorage.setItem('of_profile', JSON.stringify(profile));
      localStorage.setItem('of_pref_auto_news', prefAutoOpenNews ? '1' : '0');
      localStorage.setItem('of_profile_bio', bio);
      localStorage.setItem('of_profile_phone', phone);
      localStorage.setItem('of_profile_address', address);
      alert('Settings saved');
    } catch {/* ignore localStorage errors */}
  };

  const clearData = () => {
    try {
      localStorage.removeItem('of_profile');
      localStorage.removeItem('of_messages');
      localStorage.removeItem('of_notifications');
      alert('Local data cleared');
    } catch {/* ignore localStorage errors */}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-3">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-green-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-green-800 dark:text-green-200">Settings</h1>
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-block bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold px-4 py-2 rounded-xl">Home</Link>
            <Link to="/contact-us" className="inline-block bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-2 rounded-xl">Contact Us</Link>
            <Link to="/profile" className="text-green-700 dark:text-green-300 hover:underline">Back to Profile</Link>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h2 className="font-bold mb-2">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <img src={profile.avatar || 'https://randomuser.me/api/portraits/men/75.jpg'} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-2 border-green-400" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                <input className="nav-filter-input" placeholder="Your name" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                <input className="nav-filter-input" type="email" placeholder="you@example.com" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                <input className="nav-filter-input" placeholder="Avatar URL" value={profile.avatar} onChange={e => setProfile(p => ({ ...p, avatar: e.target.value }))} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-bold mb-2">Preferences</h2>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={prefAutoOpenNews} onChange={e => setPrefAutoOpenNews(e.target.checked)} />
              Auto-open News sidebar on desktop
            </label>
          </div>

          <div>
            <h2 className="font-bold mb-2">About</h2>
            <textarea className="nav-filter-input" rows={3} placeholder="Short bio" value={bio} onChange={e => setBio(e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <input className="nav-filter-input" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
              <input className="nav-filter-input" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button className="nav-filter-reset" onClick={clearData}>Clear local data</button>
            <button className="nav-filter-apply" onClick={save}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}


