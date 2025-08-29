import './ContactPage.css';
import { useParams, Link, useLocation } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { sendMessageToThread, addNotification, ensureConversationWith } from './services/chat';
import { useNavigate } from 'react-router-dom';

// Local single-listing fallback (kept minimal)
const listings = [
  {
    id: 1,
    type: 'land',
    title: '5 Acres Fertile Land',
    price: 1200000,
    location: 'Nashik, Maharashtra',
    description: 'Rich soil, water access, ideal for grapes and vegetables.',
    contact: '9876543210',
    owner: {
      name: 'Ramesh Kumar',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      email: 'ramesh.kumar@email.com',
      address: 'Village Shivajinagar, Taluka Dindori, Nashik - 422202',
      family: [
        { relation: 'Father', name: 'Mahadev Kumar' },
        { relation: 'Spouse', name: 'Sita Kumari' },
        { relation: 'Son', name: 'Vikram' },
      ],
    },
    photos: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    ],
  }
];

type ChatMessage = {
  id: string;
  sender: 'me' | 'owner';
  text: string;
  time: number;
};

type Listing = {
  id: number;
  type: string;
  title: string;
  price: number;
  location: string;
  description: string;
  contact: string;
  owner: {
    name: string;
    avatar: string;
    email: string;
    address: string;
    family: Array<{ relation: string; name: string }>;
  };
  photos: string[];
  image?: string;
};

type LocationState = {
  listing?: Partial<Listing>;
};

export default function ContactPage() {
  const { id } = useParams();
  const location = useLocation();
  const routedListing = (location.state as LocationState)?.listing;

  // Normalize incoming routed listing to include owner/photos so chat page is rich for all cards
  const normalizedFromRoute = React.useMemo(() => {
    if (!routedListing) return undefined;
    const baseTitle = routedListing.title || 'Listing';
    return {
      id: Number(routedListing.id ?? id ?? 0),
      type: routedListing.type ?? 'land',
      title: baseTitle,
      price: routedListing.price ?? 0,
      location: routedListing.location ?? '',
      description: routedListing.description ?? '',
      contact: routedListing.contact ?? '',
      owner: routedListing.owner ?? {
        name: 'Listing Owner',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        email: `${baseTitle.replace(/\s+/g, '.').toLowerCase()}@example.com`,
        address: routedListing.location ?? '—',
        family: [
          { relation: 'Father', name: '—' },
          { relation: 'Spouse', name: '—' },
        ],
      },
      photos: routedListing.photos ?? [
        routedListing.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      ],
    };
  }, [routedListing, id]);

  const listing = normalizedFromRoute || listings.find(l => l.id === Number(id));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const threadId = `listing-${id || (listing?.id ?? '1')}`;
  const navigate = useNavigate();

  useEffect(() => {
    if (!listing) return;
    // Seed with a welcome message
    setMessages([
      {
        id: crypto.randomUUID(),
        sender: 'owner',
        text: `Hi! Interested in "${listing.title}"? Ask me anything.`,
        time: Date.now() - 1000 * 60 * 5,
      }
    ]);
  }, [listing]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!listing) {
    return <div className="p-8 text-center text-red-600">Listing not found.</div>;
  }

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    const mine: ChatMessage = { id: crypto.randomUUID(), sender: 'me', text, time: Date.now() };
    setMessages(prev => [...prev, mine]);
    setDraft('');
    if (user) {
      await sendMessageToThread(threadId, text, {
        peerName: listing?.owner?.name || 'Owner',
        peerAvatar: listing?.owner?.avatar,
        listingId: listing?.id,
      });
      await addNotification(`Message sent about ${listing?.title || 'listing'}`);
    }
    // Demo auto-reply
    setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'owner',
        text: 'Thanks for your message! I will call you shortly. 📞',
        time: Date.now()
      };
      setMessages(prev => [...prev, reply]);
      setSending(false);
    }, 900);
  };

  const timeLabel = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-4 px-2">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Owner / Listing details */}
        <aside className="lg:col-span-5 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-green-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-green-100 dark:border-gray-700 flex items-center gap-3">
            <img src={listing.owner.avatar} alt={listing.owner.name} className="w-14 h-14 rounded-full border-2 border-green-300 object-cover" />
            <div>
              <div className="font-extrabold text-green-800 dark:text-green-200 leading-tight">{listing.owner.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Owner of: {listing.title}</div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Contact</div>
              <div className="flex items-center gap-2"><i className='bx bx-phone text-green-700 dark:text-green-300'></i><a className="hover:underline" href={`tel:${listing.contact}`}>{listing.contact}</a></div>
              <div className="flex items-center gap-2"><i className='bx bx-envelope text-green-700 dark:text-green-300'></i><a className="hover:underline" href={`mailto:${listing.owner.email}`}>{listing.owner.email}</a></div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Address</div>
              <div className="text-gray-700 dark:text-gray-200">{listing.owner.address}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Price & Location</div>
              <div className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold">₹{listing.price.toLocaleString()}</div>
              <div className="text-gray-700 dark:text-gray-200">{listing.location}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Photos</div>
              <div className="grid grid-cols-3 gap-2">
                {listing.photos.map((src: string, i: number) => (
                  <img key={i} src={src} alt={`Land ${i+1}`} className="w-full h-20 object-cover rounded-lg border border-green-100 dark:border-gray-700" />
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Family</div>
              <ul className="list-disc ml-5 text-gray-700 dark:text-gray-200">
                {listing.owner.family.map((m: { relation: string; name: string }, i: number) => (
                  <li key={i}><span className="font-semibold">{m.relation}:</span> {m.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">About</div>
              <div className="text-gray-700 dark:text-gray-200">{listing.description}</div>
            </div>
          </div>
        </aside>

        {/* Right: Chat */}
        <section className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-green-100 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-green-100 dark:border-gray-700 bg-gradient-to-r from-green-700 via-green-800 to-yellow-900 text-white">
            <div className="font-bold">Chat with {listing.owner.name}</div>
            <div className="flex items-center gap-3 text-xl">
              <a href={`tel:${listing.contact}`} className="hover:text-yellow-300" title="Call"><i className='bx bx-phone'></i></a>
              <button
                className="hover:text-yellow-300"
                title="Message on OnlyFarmers"
                onClick={async () => {
                  const peerId = `owner-${listing.id}`;
                  const convId = await ensureConversationWith(peerId, listing.owner.name, listing.owner.avatar);
                  if (convId) navigate('/messages', { state: { conversationId: convId } });
                }}
              >
                <i className='bx bxs-message-dots'></i>
              </button>
              <Link to="/listings" className="hover:text-yellow-300" title="Back"><i className='bx bx-left-arrow-alt'></i></Link>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scroll">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.sender === 'me' ? 'bg-green-600 text-white rounded-l-2xl rounded-tr-2xl' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-r-2xl rounded-tl-2xl'} max-w-[75%] px-3 py-2 shadow`}>
                  <div className="whitespace-pre-wrap break-words text-sm">{m.text}</div>
                  <div className={`text-[10px] mt-1 ${m.sender === 'me' ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'}`}>{timeLabel(m.time)}</div>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="border-t border-green-100 dark:border-gray-700 p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
            <div className="flex items-end gap-2">
              <button className="nav-icon-btn !w-10 !h-10" title="Attach"><i className='bx bx-paperclip'></i></button>
              <div className="flex-1">
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  rows={1}
                  placeholder="Type a message..."
                  className="w-full resize-none rounded-2xl border border-green-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <button onClick={sendMessage} disabled={sending || !draft.trim()} className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-2xl shadow">Send</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
