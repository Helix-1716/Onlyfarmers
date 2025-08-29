import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import NewsSidebar from './NewsSidebar';
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import { collection, doc, onSnapshot, orderBy, query, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

type Category = 'Lands' | 'Houses' | 'Animals';

type AuctionItem = {
  id: string;
  category: Category;
  title: string;
  description: string;
  image: string;
  currentBid: number;
  bidders: number;
  endTime: number; // epoch ms
  featured?: boolean;
};

const now = () => Date.now();

function useCountdown(target: number) {
  const [remaining, setRemaining] = useState(Math.max(0, target - now()));
  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, target - now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  const seconds = Math.floor(remaining / 1000);
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const label = `${d > 0 ? d + 'd ' : ''}${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return { remaining, label };
}

export default function AuctionPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Category>('Lands');
  const [sort, setSort] = useState<'ending' | 'bid_high' | 'bid_low'>('ending');
  const [watchlist, setWatchlist] = useState<Record<string, boolean>>(() => {
    try { const raw = localStorage.getItem('of_watchlist'); if (raw) return JSON.parse(raw); } catch {/* ignore */}
    return {};
  });
  useEffect(() => { try { localStorage.setItem('of_watchlist', JSON.stringify(watchlist)); } catch {/* ignore */} }, [watchlist]);
  const [stateBids, setStateBids] = useState<Record<string, { bid: number; bidders: number }>>({});
  const [bidItem, setBidItem] = useState<AuctionItem | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const featuredColor = (c: Category) =>
    c === 'Lands' ? 'from-green-500 to-emerald-600' : c === 'Houses' ? 'from-sky-500 to-blue-600' : 'from-amber-500 to-orange-600';

  const items: AuctionItem[] = useMemo(
    () => [
      {
        id: 'a1',
        category: 'Lands',
        title: '2 Acres Agricultural Land',
        description: 'Fertile soil, canal access, excellent for paddy and vegetables.',
        image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
        currentBid: 820000,
        bidders: 12,
        endTime: now() + 1000 * 60 * 45,
        featured: true,
      },
      {
        id: 'a2',
        category: 'Animals',
        title: 'Purebred Horse',
        description: 'Healthy, trained, perfect temperament. Vet-checked.',
        image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
        currentBid: 120000,
        bidders: 8,
        endTime: now() + 1000 * 60 * 20,
        featured: true,
      },
      {
        id: 'a3',
        category: 'Houses',
        title: 'Farmhouse with Mango Orchard',
        description: '3BHK farmhouse with 1 acre orchard, solar powered.',
        image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
        currentBid: 3200000,
        bidders: 26,
        endTime: now() + 1000 * 60 * 120,
      },
      {
        id: 'a4',
        category: 'Animals',
        title: 'Gir Cow (High Yield)',
        description: 'Vaccinated, docile, 10L/day yield, 3 years old.',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80',
        currentBid: 78000,
        bidders: 14,
        endTime: now() + 1000 * 60 * 10,
      },
      {
        id: 'a5',
        category: 'Lands',
        title: '3 Acres Banana Plantation',
        description: 'Well-maintained, water source available, high yield.',
        image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
        currentBid: 980000,
        bidders: 9,
        endTime: now() + 1000 * 60 * 75,
      },
      {
        id: 'a5',
        category: 'Lands',
        title: '3 Acres Banana Plantation',
        description: 'Well-maintained, water source available, high yield.',
        image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
        currentBid: 980000,
        bidders: 9,
        endTime: now() + 1000 * 60 * 75,
      },
      {
        id: 'a5',
        category: 'Lands',
        title: '3 Acres Banana Plantation',
        description: 'Well-maintained, water source available, high yield.',
        image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
        currentBid: 980000,
        bidders: 9,
        endTime: now() + 1000 * 60 * 75,
      },
      
    ],
    []
  );

  // Initialize local bid state from initial items
  useEffect(() => {
    const init: Record<string, { bid: number; bidders: number }> = {};
    items.forEach(i => { init[i.id] = { bid: i.currentBid, bidders: i.bidders }; });
    setStateBids(prev => Object.keys(prev).length ? prev : init);
  }, [items]);

  // Firestore: live auctions (optional). If collection exists, it will drive UI.
  useEffect(() => {
    const q = query(collection(db, 'auctions'), orderBy('endTime', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return; // keep local seed
      const bids: Record<string, { bid: number; bidders: number }> = {};
      snap.docs.forEach(d => {
        const v = d.data() as { currentBid?: number; bidders?: number };
        bids[d.id] = { bid: Number(v.currentBid) || 0, bidders: Number(v.bidders) || 0 };
      });
      setStateBids(prev => ({ ...prev, ...bids }));
    });
    return () => unsub();
  }, []);

  // Firestore: watchlist for user
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'watchlist'));
    const unsub = onSnapshot(q, (snap) => {
      const next: Record<string, boolean> = {};
      snap.docs.forEach(d => { next[d.id] = true; });
      setWatchlist(w => ({ ...w, ...next }));
    });
    return () => unsub();
  }, [user]);

  const filtered = items
    .filter((i) => i.category === tab || (tab === 'Animals' && i.category === 'Animals'))
    .sort((a, b) => {
      const abid = stateBids[a.id]?.bid ?? a.currentBid;
      const bbid = stateBids[b.id]?.bid ?? b.currentBid;
      if (sort === 'ending') return a.endTime - b.endTime;
      if (sort === 'bid_high') return bbid - abid;
      return abid - bbid;
    });

  // Live updates ticker (simulated)
  const [ticker, setTicker] = useState<string[]>([
    'Harsh bid ₹78,000 on Gir Cow',
    'Priya bid ₹8,20,000 on 2 Acres Agricultural Land',
  ]);
  useEffect(() => {
    const id = setInterval(() => {
      const sample = items[Math.floor(Math.random() * items.length)];
      const inc = Math.floor(1000 + Math.random() * 5000);
      setTicker((t) => [`New bid ₹${((stateBids[sample.id]?.bid ?? sample.currentBid) + inc).toLocaleString()} on ${sample.title}`, ...t].slice(0, 8));
    }, 4000);
    return () => clearInterval(id);
  }, [items, stateBids]);

  const placeBid = async (item: AuctionItem, amount: number) => {
    const current = stateBids[item.id]?.bid ?? item.currentBid;
    if (amount <= current) return;
    const nextBidders = (stateBids[item.id]?.bidders ?? item.bidders) + 1;
    setStateBids(prev => ({ ...prev, [item.id]: { bid: amount, bidders: nextBidders } }));
    setTicker(t => [`You bid ₹${amount.toLocaleString()} on ${item.title}`, ...t].slice(0, 12));
    try {
      // Upsert auction doc
      await setDoc(doc(db, 'auctions', item.id), {
        title: item.title,
        category: item.category,
        currentBid: amount,
        bidders: nextBidders,
        endTime: item.endTime,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch {/* ignore */}
  };

  const openBid = (item: AuctionItem) => {
    const live = stateBids[item.id]?.bid ?? item.currentBid;
    setBidItem(item);
    setBidAmount(live + 1000);
  };
  const confirmBid = async () => {
    if (!bidItem) return;
    setBidError(null);
    if (!user) { setBidError('Please sign in to place a bid.'); return; }
    const live = stateBids[bidItem.id]?.bid ?? bidItem.currentBid;
    const min = live + 1;
    if (!bidAmount || bidAmount < min) { setBidError(`Bid must be at least ₹${min.toLocaleString()}`); return; }
    try {
      setBidding(true);
      await placeBid(bidItem, bidAmount);
      setBidItem(null);
    } catch {
      setBidError('Failed to place bid. Please try again.');
    } finally {
      setBidding(false);
    }
  };

  const Card: React.FC<{ item: AuctionItem }> = ({ item }) => {
    const { label } = useCountdown(item.endTime);
    const color = item.category === 'Lands' ? 'green' : item.category === 'Houses' ? 'blue' : 'amber';
    const liveBid = stateBids[item.id]?.bid ?? item.currentBid;
    const liveBidders = stateBids[item.id]?.bidders ?? item.bidders;
    const [myBid, setMyBid] = useState<number>(liveBid + 1000);
    return (
      <div className="group rounded-3xl p-[2px] bg-gradient-to-br from-emerald-400/60 via-green-300/40 to-yellow-300/40 hover:from-emerald-400 hover:via-green-300 hover:to-yellow-300 transition-all duration-300 shadow-xl h-full">
        <div className="bg-white dark:bg-gray-950 rounded-[22px] shadow-xl overflow-hidden h-full flex flex-col">
          <div className="relative">
            <img src={item.image} alt={item.title} className="h-48 w-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
            <span className={`absolute top-3 left-3 text-[11px] font-extrabold px-3 py-1 rounded-full bg-${color}-600 text-white shadow`}>{item.category}</span>
            <span className="absolute top-3 right-3 text-[11px] font-bold px-3 py-1 rounded-full bg-black/70 text-white backdrop-blur shadow">⏳ {label}</span>
            <button
            onClick={async () => {
              const next = !watchlist[item.id];
              setWatchlist(w => ({ ...w, [item.id]: next }));
              if (user) {
                try {
                  const ref = doc(db, 'users', user.uid, 'watchlist', item.id);
                  if (next) await setDoc(ref, { addedAt: serverTimestamp(), title: item.title });
                  else await deleteDoc(ref);
                } catch {/* ignore */}
              }
            }}
            className={`absolute bottom-3 right-3 text-lg px-2 py-1 rounded-full ${watchlist[item.id] ? 'bg-yellow-400 text-black' : 'bg-black/60 text-white'} shadow`}
            title={watchlist[item.id] ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            {watchlist[item.id] ? '★' : '☆'}
          </button>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <div className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight">{item.title}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-3">{item.description}</div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm">
                <div className="text-gray-500 dark:text-gray-400">Current Bid</div>
                <div className="font-extrabold text-yellow-700 dark:text-yellow-300 text-lg">₹{liveBid.toLocaleString()}</div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Bidders: {liveBidders}</div>
            </div>
            <div className="flex items-center gap-2 mt-auto pt-3">
              <input
                type="number"
                min={liveBid + 1}
                value={myBid}
                onChange={e => setMyBid(parseInt(e.target.value || '0'))}
                className="flex-1 nav-filter-input"
                placeholder={`₹${(liveBid + 1000).toLocaleString()}`}
              />
              <button
                onClick={() => placeBid(item, Math.max(myBid, liveBid + 1))}
                className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-600 hover:to-emerald-800 text-white font-bold px-4 py-2 rounded-xl shadow"
              >
                Place Bid
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FeaturedCard: React.FC<{ item: AuctionItem }> = ({ item }) => {
    const { label } = useCountdown(item.endTime);
    return (
      <div className={`rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 grid grid-cols-1 md:grid-cols-2 relative`}> 
        <span className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Featured</span>
        <img src={item.image} alt={item.title} className="w-full h-64 md:h-full object-cover" />
        <div className="p-6 flex flex-col">
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{item.title}</div>
          <div className="text-gray-600 dark:text-gray-300 mb-2">{item.description}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
            <span className="px-2 py-0.5 rounded-full bg-black/60 text-white">⏳ {label}</span>
            <span className="px-2 py-0.5 rounded-full bg-black/60 text-white">Bidders {item.bidders}</span>
          </div>
          <div className="text-yellow-700 dark:text-yellow-300 text-xl font-bold">₹{(stateBids[item.id]?.bid ?? item.currentBid).toLocaleString()}</div>
          <div className="mt-auto flex gap-3">
            <button onClick={() => openBid(item)} className={`bg-gradient-to-r ${featuredColor(item.category)} text-white font-bold px-4 py-2 rounded-xl shadow hover:brightness-110`}>Start Bidding</button>
            <button onClick={() => window.location.assign(`/auction/${item.id}`)} className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold px-4 py-2 rounded-xl">Details</button>
            <button className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold px-4 py-2 rounded-xl">List Your Item</button>
          </div>
        </div>
      </div>
    );
  };

  const featured = items.filter((i) => i.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 listings-news-aware">
      <Navbar />
      <div className="py-8 px-2 xl:pr-[370px]">
        <div className="max-w-6xl mx-auto flex flex-row gap-0 xl:ml-20">
          <div className="flex-1">
            <header className="mb-6">
              <h1 className="text-3xl font-extrabold text-green-800 dark:text-green-200">Live Auctions</h1>
              <p className="text-gray-700 dark:text-gray-300">Bid on lands, houses, and pet animals in real-time.</p>
            </header>

            {/* Featured */}
            {featured.length > 0 && (
              <div className="grid grid-cols-1 gap-6 mb-8">
                {featured.map((f) => (
                  <FeaturedCard key={f.id} item={f} />
                ))}
              </div>
            )}

            {/* Category Tabs */}
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow p-2 w-full mb-6">
              {(['Lands','Houses','Animals'] as Category[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setTab(c)}
                  className={`px-5 py-2 rounded-lg font-semibold transition-all ${tab === c ? 'bg-green-600 text-white shadow' : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700'}`}
                >
                  {c}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-300" htmlFor="auction-sort">Sort</label>
                <select id="auction-sort" aria-label="Sort auctions" value={sort} onChange={e => setSort(e.target.value as 'ending' | 'bid_high' | 'bid_low')} className="nav-filter-input w-44">
                  <option value="ending">Ending Soon</option>
                  <option value="bid_high">Highest Bid</option>
                  <option value="bid_low">Lowest Bid</option>
                </select>
              </div>
            </div>

            {/* Grid - equal card sizes and consistent spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {filtered.map((it) => (
                <div key={it.id} className="h-full">
                  <Card item={it} />
                </div>
              ))}
            </div>
          </div>

          {/* Live ticker */}
          <aside className="hidden xl:block w-[340px] ml-6">
            <div className="sticky top-24 rounded-2xl border border-green-200 dark:border-green-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur shadow p-4">
              <div className="font-extrabold text-green-800 dark:text-green-200 mb-2">Live Updates</div>
              <div className="space-y-2">
                {ticker.map((t, i) => (
                  <div key={i} className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-green-100 dark:border-gray-700 rounded-lg px-3 py-2">{t}</div>
                ))}
              </div>
            </div>
          </aside>

          <NewsSidebar />
        </div>
      </div>
      <Footer />
      {/* Bid Modal */}
      {bidItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Place bid">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-green-200 dark:border-green-800 w-[90vw] max-w-md overflow-hidden">
            <div className="p-4 border-b border-green-100 dark:border-green-800 flex items-center justify-between">
              <div className="font-extrabold text-gray-900 dark:text-white">Place Bid</div>
              <button className="nav-filter-reset" onClick={() => setBidItem(null)} aria-label="Close">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={bidItem.image} alt={bidItem.title} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{bidItem.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Current: ₹{(stateBids[bidItem.id]?.bid ?? bidItem.currentBid).toLocaleString()}</div>
                </div>
              </div>
              <div>
                <label className="nav-filter-label" htmlFor="bid-amount">Your bid</label>
                <input id="bid-amount" type="number" className="nav-filter-input w-full" min={(stateBids[bidItem.id]?.bid ?? bidItem.currentBid) + 1} value={bidAmount} onChange={e => setBidAmount(parseInt(e.target.value || '0'))} />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum: ₹{(((stateBids[bidItem.id]?.bid ?? bidItem.currentBid) + 1)).toLocaleString()}</div>
              </div>
              {bidError && <div className="text-sm text-red-600">{bidError}</div>}
              <div className="flex items-center gap-2">
                <button onClick={() => setBidItem(null)} className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold px-4 py-2 rounded-xl shadow">Cancel</button>
                <button onClick={confirmBid} disabled={bidding} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-600 hover:to-emerald-800 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-xl shadow">{bidding ? 'Placing…' : 'Confirm Bid'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


