import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from './context/AuthContext';
import { db, storage } from './firebase';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function SellPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'land' | 'livestock'>('land');
  const [price, setPrice] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [image, setImage] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onFile = async (f: File | null) => {
    if (!f) return;
    setErr(null);
    try {
      const path = `listing_images/${Date.now()}_${f.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, f);
      const url = await getDownloadURL(storageRef);
      setImage(url);
    } catch {
      setErr('Failed to upload image. Please try again.');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setOk(null);
    if (!title || !location || !description || !image) { setErr('Please fill all required fields and upload an image.'); return; }
    try {
      setSaving(true);
      const payload = {
        title,
        type,
        price: Number(price) || 0,
        location,
        description,
        contact,
        image, // URL in storage
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ownerId: user?.uid || 'anon',
        ownerName: user?.displayName || 'OnlyFarmers User',
        ownerAvatar: user?.photoURL || 'https://randomuser.me/api/portraits/men/75.jpg',
      };
      // Save under user scope if logged in
      if (user) await addDoc(collection(db, 'users', user.uid, 'listings'), payload);
      // Mirror to global
      const ref = await addDoc(collection(db, 'listings'), payload);
      // Ensure global doc has its id field for convenience
      await setDoc(doc(db, 'listings', ref.id), { id: ref.id }, { merge: true });
      setOk('Listing submitted! Our team will surface it shortly.');
      setTitle(''); setType('land'); setPrice(0); setLocation(''); setDescription(''); setContact(''); setImage('');
    } catch {
      setErr('Failed to submit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-3">
        <h1 className="text-2xl font-extrabold text-green-800 dark:text-green-200 mb-4">Sell on OnlyFarmers</h1>
        <form onSubmit={submit} className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-green-100 dark:border-gray-700 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="nav-filter-label" htmlFor="sell-title">Title</label>
            <input id="sell-title" className="nav-filter-input" placeholder="e.g., 2 Acres Agricultural Land" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="nav-filter-label" htmlFor="sell-type">Type</label>
            <select id="sell-type" className="nav-filter-input" value={type} onChange={e => setType(e.target.value as 'land' | 'livestock')}>
              <option value="land">Land</option>
              <option value="livestock">Livestock</option>
            </select>
          </div>
          <div>
            <label className="nav-filter-label" htmlFor="sell-price">Price (₹)</label>
            <input id="sell-price" className="nav-filter-input" type="number" placeholder="0" value={price} onChange={e => setPrice(parseInt(e.target.value || '0'))} />
          </div>
          <div className="md:col-span-2">
            <label className="nav-filter-label" htmlFor="sell-location">Location</label>
            <input id="sell-location" className="nav-filter-input" placeholder="City, State" value={location} onChange={e => setLocation(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="nav-filter-label" htmlFor="sell-desc">Description</label>
            <textarea id="sell-desc" className="nav-filter-input" rows={4} placeholder="Describe the property or item" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="nav-filter-label" htmlFor="sell-contact">Contact Phone (optional)</label>
            <input id="sell-contact" className="nav-filter-input" placeholder="+91 ..." value={contact} onChange={e => setContact(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="nav-filter-label" htmlFor="sell-image">Photos</label>
            <input id="sell-image" type="file" accept="image/*" onChange={e => onFile(e.target.files?.[0] || null)} />
            {image && <img src={image} alt="Preview" className="mt-2 w-full max-h-64 object-cover rounded-xl border border-green-100 dark:border-gray-700" />}
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={saving} className="nav-filter-apply">{saving ? 'Submitting...' : 'Submit for Listing'}</button>
            {ok && <div className="text-green-700 dark:text-green-300">{ok}</div>}
            {err && <div className="text-red-600">{err}</div>}
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}


