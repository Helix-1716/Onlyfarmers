import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ensureConversationWith } from './services/chat';
import { useNavigate } from 'react-router-dom';

type PublicUser = { uid: string; name: string; email: string; avatar: string };
type PublicUserData = { name: string; email: string; avatar: string; nameLower: string };

export default function PeoplePage() {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const search = async (qstr: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users_public'), where('nameLower', '>=', qstr.toLowerCase()), where('nameLower', '<=', qstr.toLowerCase() + '\uf8ff'));
      const snap = await getDocs(q);
      const arr: PublicUser[] = snap.docs.map(d => ({ uid: d.id, ...(d.data() as PublicUserData) }));
      setResults(arr);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (term) { const id = setTimeout(() => search(term), 250); return () => clearTimeout(id); } else setResults([]); }, [term]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-3">
        <h1 className="text-2xl font-extrabold text-green-800 dark:text-green-200 mb-4">Find People</h1>
        <input className="nav-filter-input w-full" placeholder="Search by name" value={term} onChange={e => setTerm(e.target.value)} />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {loading ? <div className="text-gray-700 dark:text-gray-300">Searching…</div> : results.map(u => (
            <div key={u.uid} className="rounded-xl border border-green-100 dark:border-gray-700 p-3 bg-white dark:bg-gray-900 flex items-center gap-3">
              <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 dark:text-white truncate">{u.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</div>
              </div>
              <button className="nav-filter-apply" onClick={async () => { const conv = await ensureConversationWith(u.uid, u.name, u.avatar); if (conv) navigate('/messages', { state: { conversationId: conv } }); }}>Message</button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}


