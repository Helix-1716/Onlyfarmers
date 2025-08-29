import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';

type MsgPreview = { id: string; name: string; avatar: string; last: string; time: number; unread: number; listingId?: number };

type Listing = {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  description: string;
  image: string;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
  scope?: 'user' | 'global';
};

export default function MyListingsPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MsgPreview[]>([]);
  const [watchlist, setWatchlist] = useState<Record<string, boolean>>({});
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('of_messages');
      if (raw) setMessages(JSON.parse(raw));
    } catch {/* ignore */}
    try {
      const w = localStorage.getItem('of_watchlist');
      if (w) setWatchlist(JSON.parse(w));
    } catch {/* ignore */}
  }, []);

  const contactedListingIds = useMemo(() => Array.from(new Set(messages.map(m => m.listingId).filter(Boolean))) as number[], [messages]);

  const watchedAuctions = useMemo(() => Object.keys(watchlist).filter(id => watchlist[id]), [watchlist]);

  // Firestore: load my listings (either users/{uid}/listings or global with ownerId)
  useEffect(() => {
    if (!user) return;
    const userScoped = query(collection(db, 'users', user.uid, 'listings'), orderBy('createdAt', 'desc'));
    const unsubUser = onSnapshot(userScoped, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Listing, 'id' | 'scope'>), scope: 'user' as const }));
      setMyListings(prev => {
        const globalOnly = prev.filter(x => x.scope === 'global');
        return [...arr, ...globalOnly];
      });
    });
    const globalScoped = query(collection(db, 'listings'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubGlobal = onSnapshot(globalScoped, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Listing, 'id' | 'scope'>), scope: 'global' as const }));
      setMyListings(prev => {
        const userOnly = prev.filter(x => x.scope === 'user');
        return [...userOnly, ...arr];
      });
    });
    return () => { unsubUser(); unsubGlobal(); };
  }, [user]);

  const createListing = async () => {
    if (!user) return;
    setBusyId('new');
    const payload = {
      title: 'Untitled Listing',
      type: 'land',
      price: 0,
      location: '—',
      description: '',
      image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    // Prefer user-scoped collection for simpler rules
    const ref = await addDoc(collection(db, 'users', user.uid, 'listings'), payload);
    try { await setDoc(doc(db, 'listings', ref.id), payload); } catch {/* ignore mirroring errors */}
    setBusyId(null);
  };

  const saveListing = async (l: Listing) => {
    if (!user) return;
    setBusyId(l.id);
    const patch = { ...l, updatedAt: serverTimestamp() };
    try { await updateDoc(doc(db, 'users', user.uid, 'listings', l.id), patch); } catch {/* ignore if not exist */}
    try { await updateDoc(doc(db, 'listings', l.id), patch); } catch {/* ignore if not exist */}
    setBusyId(null);
  };

  const deleteListing = async (l: Listing) => {
    if (!user) return;
    setBusyId(l.id);
    try { await deleteDoc(doc(db, 'users', user.uid, 'listings', l.id)); } catch {/* ignore */}
    try { await deleteDoc(doc(db, 'listings', l.id)); } catch {/* ignore */}
    setBusyId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto py-8 px-3">
        <h1 className="text-2xl font-extrabold text-green-800 dark:text-green-200 mb-4">My Listings</h1>

        {/* Manage Listings */}
        <section className="mb-8 bg-white dark:bg-gray-900 rounded-2xl shadow border border-green-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold">Your Listings</div>
            <button onClick={createListing} className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg">Add Listing</button>
          </div>
          {myListings.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">You have not created any listings yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myListings.map(l => (
                <div key={l.id} className="rounded-xl border border-green-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
                  <img src={l.image} alt={l.title} className="w-full h-28 object-cover rounded-lg mb-2" />
                  <input aria-label="Listing title" placeholder="Title" className="nav-filter-input mb-2" value={l.title} onChange={e => setMyListings(arr => arr.map(x => x.id === l.id ? { ...x, title: e.target.value } : x))} />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select aria-label="Listing type" className="nav-filter-input" value={l.type} onChange={e => setMyListings(arr => arr.map(x => x.id === l.id ? { ...x, type: e.target.value } : x))}>
                      <option value="land">Land</option>
                      <option value="livestock">Livestock</option>
                    </select>
                    <input aria-label="Listing price" placeholder="Price" className="nav-filter-input" type="number" value={l.price} onChange={e => setMyListings(arr => arr.map(x => x.id === l.id ? { ...x, price: parseInt(e.target.value || '0') } : x))} />
                  </div>
                  <input aria-label="Listing location" placeholder="Location" className="nav-filter-input mb-2" value={l.location} onChange={e => setMyListings(arr => arr.map(x => x.id === l.id ? { ...x, location: e.target.value } : x))} />
                  <textarea aria-label="Listing description" placeholder="Description" className="nav-filter-input mb-2" rows={2} value={l.description} onChange={e => setMyListings(arr => arr.map(x => x.id === l.id ? { ...x, description: e.target.value } : x))} />
                  <input aria-label="Listing image URL" placeholder="https://..." className="nav-filter-input mb-3" value={l.image} onChange={e => setMyListings(arr => arr.map(x => x.id === l.id ? { ...x, image: e.target.value } : x))} />
                  <div className="flex items-center justify-between">
                    <button disabled={busyId === l.id} onClick={() => saveListing(l)} className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-3 py-1.5 rounded-lg">Save</button>
                    <button disabled={busyId === l.id} onClick={() => deleteListing(l)} className="bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white font-bold px-3 py-1.5 rounded-lg">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8 bg-white dark:bg-gray-900 rounded-2xl shadow border border-green-100 dark:border-gray-700 p-4">
          <div className="font-bold mb-2">Contacted Listings</div>
          {contactedListingIds.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">You haven't contacted any listing owners yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contactedListingIds.map(id => (
                <Link key={id} to={`/contact/${id}`} className="block rounded-xl border border-green-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="text-sm text-gray-700 dark:text-gray-200">Listing #{id}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Open chat</div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-green-100 dark:border-gray-700 p-4">
          <div className="font-bold mb-2">Auction Watchlist</div>
          {watchedAuctions.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">No items in your watchlist. Explore the <Link to="/auction" className="text-green-700 dark:text-green-300 underline">Auction</Link>.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {watchedAuctions.map(id => (
                <Link key={id} to="/auction" className="block rounded-xl border border-green-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="text-sm text-gray-700 dark:text-gray-200">Auction #{id}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">View in Auctions</div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}


