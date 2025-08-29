import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Link } from 'react-router-dom';

type ProfileData = { name: string; email: string; avatar: string };

type MessagePreview = { id: string; name: string; avatar: string; last: string; time: number; unread: number };
type Notif = { id: string; text: string; time: number; read: boolean };

function timeAgo(t: number) {
  const diff = Math.floor((Date.now() - t) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({ name: '', email: '', avatar: '' });
  const [bio, setBio] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [messages, setMessages] = useState<MessagePreview[]>([]);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>('');
  const [isSavingAvatar, setIsSavingAvatar] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('of_profile');
      if (raw) {
        setProfile(JSON.parse(raw));
      } else {
        setProfile({ name: 'OnlyFarmers User', email: 'user@example.com', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' });
      }
      const b = localStorage.getItem('of_profile_bio');
      if (b) setBio(b);
      const ph = localStorage.getItem('of_profile_phone');
      if (ph) setPhone(ph);
      const ad = localStorage.getItem('of_profile_address');
      if (ad) setAddress(ad);
      const msgs = localStorage.getItem('of_messages');
      if (msgs) setMessages(JSON.parse(msgs));
      const nots = localStorage.getItem('of_notifications');
      if (nots) setNotifications(JSON.parse(nots));
    } catch {
      setProfile({ name: 'OnlyFarmers User', email: 'user@example.com', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' });
    }
  }, []);

  // Sync local editable profile fields from Firebase user when auth state changes
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        name: user.displayName || prev.name || 'OnlyFarmers User',
        email: user.email || prev.email || 'user@example.com',
        avatar: user.photoURL || prev.avatar || 'https://randomuser.me/api/portraits/men/75.jpg',
      }));
    }
  }, [user]);

  const stats = useMemo(() => {
    const totalMsgs = messages.length;
    const unreadMsgs = messages.reduce((a, m) => a + (m.unread || 0), 0);
    const totalNotifs = notifications.length;
    const unreadNotifs = notifications.filter(n => !n.read).length;
    return { totalMsgs, unreadMsgs, totalNotifs, unreadNotifs };
  }, [messages, notifications]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-3">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-green-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-green-800 dark:text-green-200">My Profile</h1>
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-block bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold px-4 py-2 rounded-xl">Home</Link>
            <Link to="/contact-us" className="inline-block bg-green-700 hover:bg-green-800 text-yellow-300 font-bold px-4 py-2 rounded-xl">Contact Us</Link>
            <Link to="/settings" className="inline-block bg-green-600 hover:bg-green-700 text-white !text-white no-underline font-bold px-4 py-2 rounded-xl">Settings</Link>
          </div>
        </div>
        <div className="flex items-center gap-5 mb-6">
          <img src={user?.photoURL || profile.avatar} alt={user?.displayName || profile.name} className="w-20 h-20 rounded-full border-2 border-green-400 object-cover" />
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{user?.displayName || profile.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{user?.email || profile.email}</div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-green-100 dark:border-gray-700 mb-6">
          <div className="font-bold mb-2">Change Photo</div>
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block" htmlFor="avatar-url">Avatar URL</label>
              <input id="avatar-url" className="nav-filter-input" placeholder="https://..." value={newAvatarUrl} onChange={e => setNewAvatarUrl(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block" htmlFor="avatar-file">Upload</label>
              <input id="avatar-file" type="file" accept="image/*" onChange={e => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => { if (typeof reader.result === 'string') setNewAvatarUrl(reader.result); };
                reader.readAsDataURL(f);
              }} />
            </div>
            <button
              className="nav-filter-apply"
              disabled={isSavingAvatar || !newAvatarUrl}
              onClick={() => {
                if (!newAvatarUrl) return;
                setIsSavingAvatar(true);
                setProfile(p => ({ ...p, avatar: newAvatarUrl }));
                try { localStorage.setItem('of_profile', JSON.stringify({ ...profile, avatar: newAvatarUrl })); } catch {}
                setTimeout(() => setIsSavingAvatar(false), 200);
              }}
            >
              {isSavingAvatar ? 'Saving...' : 'Save Photo'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-green-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Listings</div>
            <div className="text-2xl font-extrabold">—</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-green-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Messages</div>
            <div className="text-2xl font-extrabold">{stats.totalMsgs}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Unread: {stats.unreadMsgs}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-green-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Notifications</div>
            <div className="text-2xl font-extrabold">{stats.totalNotifs}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Unread: {stats.unreadNotifs}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-green-100 dark:border-gray-700">
            <div className="font-bold mb-2">About</div>
            <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{bio || 'No bio yet. Update it from Settings.'}</div>
            <div className="mt-3 text-sm text-gray-700 dark:text-gray-200"><span className="font-semibold">Phone:</span> {phone || '—'}</div>
            <div className="text-sm text-gray-700 dark:text-gray-200"><span className="font-semibold">Address:</span> {address || '—'}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-green-100 dark:border-gray-700">
            <div className="font-bold mb-2">Recent Activity</div>
            <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Messages</div>
            {messages.slice(0,3).map(m => (
              <div key={m.id} className="flex items-center gap-2 mb-2">
                <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
                <div className="text-sm text-gray-800 dark:text-gray-100 truncate">{m.name}: {m.last}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 ml-auto">{timeAgo(m.time)}</div>
              </div>
            ))}
            <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mt-3 mb-1">Notifications</div>
            {notifications.slice(0,3).map(n => (
              <div key={n.id} className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${n.read ? 'bg-gray-400' : 'bg-green-500'}`}></span>
                <div className="text-sm text-gray-800 dark:text-gray-100 truncate">{n.text}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 ml-auto">{timeAgo(n.time)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


