import { Link, useNavigate, useLocation } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';
import './Navbar.css';
import { useRef, useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { markAllNotificationsRead } from './services/chat';
import { useNewsSidebar } from './context/NewsSidebarContext';
import { useAuth } from './context/AuthContext';

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<'land' | 'livestock' | ''>('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMin, setFilterMin] = useState('');
  const [filterMax, setFilterMax] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; name: string; avatar: string; last: string; time: number; unread: number; listingId?: number }>>(() => {
    try {
      const raw = localStorage.getItem('of_messages');
      if (raw) return JSON.parse(raw);
    } catch {/* ignore */}
    return [
      { id: crypto.randomUUID(), name: 'Ramesh Kumar', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', last: 'Can we schedule a visit tomorrow?', time: Date.now() - 1000 * 60 * 15, unread: 2, listingId: 1 },
      { id: crypto.randomUUID(), name: 'Bhavesh Patel', avatar: 'https://randomuser.me/api/portraits/men/12.jpg', last: 'Gir cows are available.', time: Date.now() - 1000 * 60 * 90, unread: 0 },
    ];
  });
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; time: number; read: boolean }>>(() => {
    try {
      const raw = localStorage.getItem('of_notifications');
      if (raw) return JSON.parse(raw);
    } catch {/* ignore */}
    return [
      { id: crypto.randomUUID(), text: 'Price drop: 2 Acres Organic Farm now ₹6.2L', time: Date.now() - 1000 * 60 * 30, read: false },
      { id: crypto.randomUUID(), text: 'New message from Ramesh Kumar', time: Date.now() - 1000 * 60 * 120, read: false },
      { id: crypto.randomUUID(), text: 'New listing near Coimbatore', time: Date.now() - 1000 * 60 * 240, read: true },
    ];
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isNewsSidebarOpen, toggleNewsSidebar } = useNewsSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, /* loading: authLoading,*/ signInWithGoogle, signOutUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<{ name: string; email: string; avatar: string }>(() => {
    try {
      const raw = localStorage.getItem('of_profile');
      if (raw) return JSON.parse(raw);
    } catch {/* ignore */}
    return {
      name: 'OnlyFarmers User',
      email: 'user@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    };
  });

  const allSuggestions = [
    'Agricultural Land',
    'Livestock',
    'Cow',
    'Buffalo',
    'Goat',
    'Sheep',
    'Hen',
    'Duck',
    'Rabbit',
    'Organic Farm',
    'Irrigation',
    'Paddy',
    'Mango Orchard',
  ];
  const filteredSuggestions = allSuggestions.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 6);

  // Close search on outside click or Escape
  useEffect(() => {
    if (!searchOpen) return;
    function handleClick(e: MouseEvent) {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSearchOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close filter on outside click or Escape
  useEffect(() => {
    if (!filterOpen) return;
    function handleClick(e: MouseEvent) {
      const panel = document.querySelector('.nav-filter-panel');
      const btn = document.getElementById('nav-filter-btn');
      if (panel && !panel.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFilterOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [filterOpen]);

  // Sync filter inputs with URL params so opening the filter reflects current state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('type');
    const loc = params.get('loc');
    const mi = params.get('min');
    const ma = params.get('max');
    const cat = params.get('cat');
    const q = params.get('q');
    setFilterType(t === 'land' || t === 'livestock' ? (t as 'land' | 'livestock') : '');
    setFilterLocation(loc || '');
    setFilterMin(mi || '');
    setFilterMax(ma || '');
    setFilterCategory(cat || 'All');
    if (typeof q === 'string') setSearchTerm(q);
  }, [location.search]);

  // Close notifications on outside click or Escape
  useEffect(() => {
    if (!notifOpen) return;
    function handleClick(e: MouseEvent) {
      const panel = document.querySelector('.nav-notif-panel');
      const btn = document.getElementById('nav-notif-btn');
      if (panel && !panel.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [notifOpen]);

  // Persist notifications
  useEffect(() => {
    try { localStorage.setItem('of_notifications', JSON.stringify(notifications)); } catch {/* ignore */}
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;
  // Realtime notifications
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      type NotificationDoc = { text?: string; createdAt?: { toMillis?: () => number } | number; read?: boolean };
      const next = snap.docs.map(d => {
        const v = d.data() as NotificationDoc;
        const created = typeof v.createdAt === 'number' ? v.createdAt : (v.createdAt?.toMillis?.() || Date.now());
        return { id: d.id, text: v.text || 'Notification', time: created, read: !!v.read };
      });
      setNotifications(next);
    });
    return () => unsub();
  }, [user]);
  const formatAgo = (t: number) => {
    const diff = Math.floor((Date.now() - t) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Close messages on outside click or Escape
  useEffect(() => {
    if (!msgOpen) return;
    function handleClick(e: MouseEvent) {
      const panel = document.querySelector('.nav-msg-panel');
      const btn = document.getElementById('nav-msg-btn');
      if (panel && !panel.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) {
        setMsgOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMsgOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [msgOpen]);

  // Persist messages
  useEffect(() => {
    try { localStorage.setItem('of_messages', JSON.stringify(messages)); } catch {/* ignore */}
  }, [messages]);

  const unreadMsgs = messages.reduce((a, m) => a + (m.unread || 0), 0);
  // Realtime messages/threads
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'threads'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      type ThreadDoc = { peerName?: string; peerAvatar?: string; lastMessage?: string; updatedAt?: { toMillis?: () => number } | number; unreadCount?: number; listingId?: number };
      const next = snap.docs.map(d => {
        const v = d.data() as ThreadDoc;
        const updated = typeof v.updatedAt === 'number' ? v.updatedAt : (v.updatedAt?.toMillis?.() || Date.now());
        return { id: d.id, name: v.peerName || 'Chat', avatar: v.peerAvatar || 'https://randomuser.me/api/portraits/men/12.jpg', last: v.lastMessage || '', time: updated, unread: v.unreadCount || 0, listingId: v.listingId };
      });
      setMessages(next);
    });
    return () => unsub();
  }, [user]);

  // When user logs in, reflect their info in profile dropdown defaults
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        name: user.displayName || prev.name,
        email: user.email || prev.email,
        avatar: user.photoURL || prev.avatar,
      }));
    }
  }, [user]);

  // Mobile menu close on overlay click or Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileMenuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
  <Link to="/" className="logo-link">
    <i className='bx bx-leaf bx-fw farmer-icon'></i>
    <div className="logo-text">
      <span className="only">ONLY</span>
      <span className="farmers">FARMERS</span>
      <span className="dot-in">.in</span>
    </div>
  </Link>
  <Link to="/auction" className="nav-filter-apply" style={{ textDecoration: 'none', marginLeft: '0.75rem' }}>Auction</Link>
  <Link to="/sell" className="nav-filter-apply" style={{ textDecoration: 'none', marginLeft: '0.5rem' }}>Sell</Link>
  <Link to="/people" className="nav-filter-apply" style={{ textDecoration: 'none', marginLeft: '0.5rem' }}>People</Link>
</div>
<div className="mobile-controls">
  <button className="nav-mobile-toggle hamburger-btn" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Open menu">
    <i className={`bx ${mobileMenuOpen ? 'bx-x' : 'bx-menu'}`}></i>
  </button>
  <div className="h-6 w-0.5 bg-white/20"></div>
  <button className="nav-mobile-toggle news-icon-btn" onClick={toggleNewsSidebar} aria-label="Toggle news sidebar">
    <i className={`bx ${isNewsSidebarOpen ? 'bx-x' : 'bx-news'}`}></i>
  </button>
</div>
      <div className={`nav-mobile-overlay${mobileMenuOpen ? ' open' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
      <div className={`navbar-right${mobileMenuOpen ? ' open' : ''}`}> 
        <div className="nav-search-container">
          <button
            className={`nav-icon-btn${searchOpen ? ' active' : ''}`}
            title="Search"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Open search"
          >
            <i className='bx bx-search-alt-2 bx-fw'></i>
          </button>
          <input
            ref={searchInputRef}
            className={`nav-search-input${searchOpen ? ' open' : ''}`}
            type="text"
            placeholder="Search listings..."
            aria-label="Search listings"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (searchTerm.trim().length > 0) {
                  navigate(`/listings?q=${encodeURIComponent(searchTerm.trim())}`);
                } else {
                  navigate('/listings');
                }
                setSearchOpen(false);
                setShowSuggestions(false);
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
            tabIndex={searchOpen ? 0 : -1}
          />
          {searchOpen && searchTerm && (
            <button
              className="nav-icon-btn nav-search-clear"
              title="Clear search"
              aria-label="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setSearchTerm(''); searchInputRef.current?.focus(); }}
            >
              <i className='bx bx-x bx-fw'></i>
            </button>
          )}
          {searchOpen && showSuggestions && filteredSuggestions.length > 0 && (
            <div className="nav-suggestions" id="nav-suggestions">
              {filteredSuggestions.map(s => (
                <div
                  key={s}
                  tabIndex={0}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSearchTerm(s);
                    navigate(`/listings?q=${encodeURIComponent(s)}`);
                    setSearchOpen(false);
                    setShowSuggestions(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSearchTerm(s);
                      navigate(`/listings?q=${encodeURIComponent(s)}`);
                      setSearchOpen(false);
                      setShowSuggestions(false);
                    }
                  }}
                  className="nav-suggestion-btn"
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="nav-filter-container">
          <button id="nav-filter-btn" className={`nav-icon-btn${filterOpen ? ' active' : ''}`} title="Filter" aria-haspopup="dialog" onClick={() => setFilterOpen(v => !v)}>
            <i className='bx bx-slider-alt bx-fw'></i>
          </button>
          {filterOpen && (
            <div className="nav-filter-panel" role="dialog" aria-label="Filter listings">
              <div className="nav-filter-row">
                <label className="nav-filter-label">Type</label>
                <div className="nav-filter-chips">
                  <button className={`nav-filter-chip${filterType === 'land' ? ' active' : ''}`} onClick={() => setFilterType(filterType === 'land' ? '' : 'land')}>Land</button>
                  <button className={`nav-filter-chip${filterType === 'livestock' ? ' active' : ''}`} onClick={() => setFilterType(filterType === 'livestock' ? '' : 'livestock')}>Livestock</button>
                </div>
              </div>
              <div className="nav-filter-row">
                <label className="nav-filter-label" htmlFor="filter-location">Location</label>
                <input id="filter-location" className="nav-filter-input" type="text" value={filterLocation} onChange={e => setFilterLocation(e.target.value)} placeholder="City or state" />
              </div>
              <div className="nav-filter-row nav-filter-row-inline">
                <div>
                  <label className="nav-filter-label" htmlFor="filter-min">Min Price</label>
                  <input id="filter-min" className="nav-filter-input" type="number" value={filterMin} onChange={e => setFilterMin(e.target.value)} placeholder="₹" />
                </div>
                <div>
                  <label className="nav-filter-label" htmlFor="filter-max">Max Price</label>
                  <input id="filter-max" className="nav-filter-input" type="number" value={filterMax} onChange={e => setFilterMax(e.target.value)} placeholder="₹" />
                </div>
              </div>
              <div className="nav-filter-row">
                <label className="nav-filter-label" htmlFor="filter-category">Livestock Category</label>
                <select id="filter-category" className="nav-filter-input" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  {['All','Cow','Buffalo','Goat','Sheep','Hen','Duck','Rabbit'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="nav-filter-actions">
                <button className="nav-filter-reset" onClick={() => { setFilterType(''); setFilterLocation(''); setFilterMin(''); setFilterMax(''); setFilterCategory('All'); navigate('/listings'); setFilterOpen(false); }}>Reset</button>
                <button className="nav-filter-apply" onClick={() => {
                  const params = new URLSearchParams();
                  if (searchTerm) params.set('q', searchTerm);
                  if (filterType) params.set('type', filterType);
                  if (filterLocation) params.set('loc', filterLocation);
                  if (filterMin) params.set('min', filterMin);
                  if (filterMax) params.set('max', filterMax);
                  if (filterType === 'livestock' && filterCategory && filterCategory !== 'All') params.set('cat', filterCategory);
                  navigate({ pathname: '/listings', search: params.toString() });
                  setFilterOpen(false);
                }}>Apply</button>
              </div>
            </div>
          )}
        </div>
        <div className="nav-notif-container">
          <button id="nav-notif-btn" className={`nav-icon-btn${notifOpen ? ' active' : ''}`} title="Notifications" onClick={() => setNotifOpen(v => !v)} aria-haspopup="dialog">
            <i className='bx bxs-bell bx-fw'></i>
            {unreadCount > 0 && <span className="nav-notif-badge" aria-label={`${unreadCount} unread notifications`}>{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="nav-notif-panel" role="dialog" aria-label="Notifications">
              <div className="nav-notif-header">
                <div className="nav-notif-title">Notifications</div>
                <div className="nav-notif-actions">
                  <button className="nav-notif-action" onClick={async () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); if (user) { try { await markAllNotificationsRead(); } catch {/* ignore */} } }}>Mark all read</button>
                  <button className="nav-notif-action" onClick={() => setNotifications([])}>Clear all</button>
                </div>
              </div>
              <div className="nav-notif-list">
                {notifications.length === 0 ? (
                  <div className="nav-notif-empty">No notifications</div>
                ) : notifications.map(n => (
                  <button key={n.id} className={`nav-notif-item${n.read ? '' : ' unread'}`} onClick={async () => { setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x)); if (user) { try { await updateDoc(doc(collection(db, 'users', user.uid, 'notifications'), n.id), { read: true }); } catch {/* ignore */} } }}>
                    <span className="nav-notif-dot" aria-hidden="true"></span>
                    <div className="nav-notif-text">{n.text}</div>
                    <div className="nav-notif-time">{formatAgo(n.time)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="nav-msg-container">
          <button id="nav-msg-btn" className={`nav-icon-btn${msgOpen ? ' active' : ''}`} title="Messages" onClick={() => setMsgOpen(v => !v)} aria-haspopup="dialog">
            <i className='bx bxs-message-dots bx-fw'></i>
            {unreadMsgs > 0 && <span className="nav-notif-badge" aria-label={`${unreadMsgs} unread messages`}>{unreadMsgs}</span>}
          </button>
          {msgOpen && (
            <div className="nav-msg-panel" role="dialog" aria-label="Messages">
              <div className="nav-msg-header">
                <div className="nav-msg-title">Messages</div>
                <div className="nav-msg-actions">
                  <button className="nav-msg-action" onClick={() => { setMsgOpen(false); navigate('/messages'); }}>Open Messages</button>
                  <button className="nav-msg-action" onClick={() => setMessages(prev => prev.map(m => ({ ...m, unread: 0 })))}>Mark all read</button>
                  <button className="nav-msg-action" onClick={() => setMessages([])}>Clear all</button>
                </div>
              </div>
              <div className="nav-msg-list">
                {messages.length === 0 ? (
                  <div className="nav-msg-empty">No messages</div>
                ) : messages.map(m => (
                  <button key={m.id} className={`nav-msg-item${m.unread ? ' unread' : ''}`} onClick={async () => {
                    setMessages(prev => prev.map(x => x.id === m.id ? { ...x, unread: 0 } : x));
                    navigate('/messages', { state: { conversationId: m.id } });
                    setMsgOpen(false);
                  }}>
                    <img src={m.avatar} alt={m.name} className="nav-msg-avatar" />
                    <div className="nav-msg-texts">
                      <div className="nav-msg-name">{m.name}</div>
                      <div className="nav-msg-last">{m.last}</div>
                    </div>
                    <div className="nav-msg-meta">
                      <span className="nav-msg-time">{formatAgo(m.time)}</span>
                      {m.unread > 0 && <span className="nav-msg-pill">{m.unread}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="nav-prof-container">
          <button id="nav-prof-btn" className={`nav-icon-btn profile-btn${profileOpen ? ' active' : ''}`} title="Profile" onClick={() => setProfileOpen(v => !v)} aria-haspopup="dialog" aria-label="Profile">
            <img
              src={user?.photoURL || profile.avatar}
              alt={user?.displayName || profile.name}
              className="nav-prof-btn-avatar"
            />
          </button>
          {profileOpen && (
            <div className="nav-prof-panel" role="dialog" aria-label="Profile">
              <div className="nav-prof-header">
                <img src={user?.photoURL || profile.avatar} alt={user?.displayName || profile.name} className="nav-prof-avatar" />
                <div className="nav-prof-identity">
                  <div className="nav-prof-name">{user?.displayName || profile.name}</div>
                  <div className="nav-prof-email">{user?.email || profile.email}</div>
                </div>
              </div>
              <div className="nav-prof-body">
                {!user ? (
                  <button className="nav-filter-apply" onClick={signInWithGoogle}>Sign in with Google</button>
                ) : (
                  <>
                    <label className="nav-filter-label" htmlFor="prof-name">Name</label>
                    <input id="prof-name" className="nav-filter-input" placeholder="Your name" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                    <label className="nav-filter-label mt-2" htmlFor="prof-email">Email</label>
                    <input id="prof-email" className="nav-filter-input" type="email" placeholder="you@example.com" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                    <label className="nav-filter-label mt-2" htmlFor="prof-avatar">Avatar URL</label>
                    <input id="prof-avatar" className="nav-filter-input" placeholder="https://..." value={profile.avatar} onChange={e => setProfile(p => ({ ...p, avatar: e.target.value }))} />
                  </>
                )}
              </div>
              <div className="nav-prof-links">
                <button className="nav-prof-link" onClick={() => { setProfileOpen(false); navigate('/profile'); }}>View profile</button>
                <button className="nav-prof-link" onClick={() => { setProfileOpen(false); navigate('/my-listings'); }}>My listings</button>
                <button className="nav-prof-link" onClick={() => { alert('Settings coming soon'); }}>Settings</button>
                <button className="nav-prof-link danger" onClick={() => { signOutUser().catch(()=>{}); try { localStorage.removeItem('of_profile'); localStorage.removeItem('of_messages'); localStorage.removeItem('of_notifications'); } catch {/* ignore */}; setProfile({ name: 'OnlyFarmers User', email: 'user@example.com', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' }); setProfileOpen(false); }}>Sign out</button>
              </div>
              <div className="nav-prof-actions">
                <button className="nav-filter-reset" onClick={() => { setProfileOpen(false); }}>Close</button>
                <button className="nav-filter-apply" onClick={() => { try { localStorage.setItem('of_profile', JSON.stringify(profile)); } catch {/* ignore */}; setProfileOpen(false); }}>Save</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}