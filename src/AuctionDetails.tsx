import { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

type Category = 'Lands' | 'Houses' | 'Animals';
type AuctionItem = { id: string; title: string; description: string; image: string; currentBid: number; bidders: number; endTime: number; category: Category };
type LocationState = { item?: AuctionItem };
type FirebaseAuctionData = { title: string; description?: string; image?: string; currentBid?: number; bidders?: number; endTime?: number; category?: string };

function useCountdown(target: number) {
  const [remaining, setRemaining] = useState(Math.max(0, target - Date.now()));
  useEffect(() => { const id = setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000); return () => clearInterval(id); }, [target]);
  const s = Math.floor(remaining / 1000); const h = Math.floor((s % 86400) / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60; const d = Math.floor(s / 86400);
  return `${d > 0 ? d + 'd ' : ''}${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

export default function AuctionDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const initial = (location.state as LocationState)?.item;
  const [item, setItem] = useState<AuctionItem | undefined>(initial);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'auctions', id), (snap) => {
      if (snap.exists()) {
        const v = snap.data() as FirebaseAuctionData;
        setItem({ id, title: v.title, description: v.description || '', image: v.image || initial?.image || '', currentBid: v.currentBid || 0, bidders: v.bidders || 0, endTime: v.endTime || Date.now(), category: (v.category || 'Lands') as Category });
      }
    });
    return () => unsub();
  }, [id, initial?.image]);

  const time = useCountdown(item?.endTime || 0);

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="max-w-5xl mx-auto py-10 px-3 text-gray-700 dark:text-gray-200">Loading auction…</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto py-6 px-3 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl overflow-hidden border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 shadow">
          <img src={item.image} alt={item.title} className="w-full h-[360px] object-cover" />
        </div>
        <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 shadow p-5">
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{item.title}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">{item.description}</div>
          <div className="flex items-center gap-3 mb-3 text-sm">
            <span className="px-2 py-0.5 rounded-full bg-black/60 text-white">⏳ {time}</span>
            <span className="px-2 py-0.5 rounded-full bg-black/60 text-white">Bidders {item.bidders}</span>
          </div>
          <div className="text-yellow-700 dark:text-yellow-300 text-xl font-bold mb-4">Current: ₹{item.currentBid.toLocaleString()}</div>
          <Link to="/auction" className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-600 hover:to-emerald-800 text-white font-bold px-4 py-2 rounded-xl shadow inline-block">Back to Auctions</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}


