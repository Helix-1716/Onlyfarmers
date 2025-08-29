import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import NewsSidebar from './NewsSidebar';

interface Listing {
  id: number;
  type: 'land' | 'livestock';
  image: string;
  title: string;
  price: number;
  location: string;
  description: string;
  contact: string;
}

export default function ListingsPage() {
  const [tab, setTab] = useState<'land' | 'livestock'>('land');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [livestockCategory, setLivestockCategory] = useState<string>('All');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const locationRouter = useLocation();
  const navigate = useNavigate();
  const livestockCategories = [
    'All', 'Cow', 'Buffalo', 'Goat', 'Sheep', 'Hen', 'Duck', 'Rabbit'
  ];

  // Placeholder data
  const listings: Listing[] = useMemo(() => [
    {
      id: 1,
      type: 'land',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      title: '5 Acres Fertile Land',
      price: 1200000,
      location: 'Nashik, Maharashtra',
      description: 'Rich soil, water access, ideal for grapes and vegetables.',
      contact: '9876543210',
    },
    {
      id: 1,
      type: 'land',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      title: '5 Acres Fertile Land',
      price: 1200000,
      location: 'Nashik, Maharashtra',
      description: 'Rich soil, water access, ideal for grapes and vegetables.',
      contact: '9876543210',
    },
    {
      id: 1,
      type: 'land',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      title: '5 Acres Fertile Land',
      price: 1200000,
      location: 'Nashik, Maharashtra',
      description: 'Rich soil, water access, ideal for grapes and vegetables.',
      contact: '9876543210',
    },
    {
      id: 2,
      type: 'livestock',
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80',
      title: 'Pair of Gir Cows',
      price: 85000,
      location: 'Surat, Gujarat',
      description: 'Healthy, vaccinated, high milk yield. Cow breed: Gir.',
      contact: '9123456780',
    },
    {
      id: 3,
      type: 'land',
      image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
      title: '2 Acres Organic Farm',
      price: 650000,
      location: 'Coimbatore, Tamil Nadu',
      description: 'Certified organic, drip irrigation, ready for cultivation.',
      contact: '9988776655',
    },
    {
      id: 4,
      type: 'livestock',
      image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
      title: 'Murrah Buffalo',
      price: 60000,
      location: 'Karnal, Haryana',
      description: 'Strong, good for dairy, docile temperament. Buffalo breed: Murrah.',
      contact: '9001122334',
    },
    {
      id: 5,
      type: 'land',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80',
      title: '10 Acres Mango Orchard',
      price: 2500000,
      location: 'Ratnagiri, Maharashtra',
      description: 'Mature mango trees, drip irrigation, farm house included.',
      contact: '9876501234',
    },
    {
      id: 6,
      type: 'livestock',
      image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      title: 'Sahiwal Cow',
      price: 70000,
      location: 'Ludhiana, Punjab',
      description: 'High-yielding, healthy, and vaccinated. Cow breed: Sahiwal.',
      contact: '9988771122',
    },
    {
      id: 7,
      type: 'land',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80',
      title: '3 Acres Banana Plantation',
      price: 900000,
      location: 'Erode, Tamil Nadu',
      description: 'Well-maintained, high yield, water source available.',
      contact: '9001122445',
    },
    {
      id: 8,
      type: 'livestock',
      image: 'https://images.unsplash.com/photo-1518715308788-3005759c61d3?auto=format&fit=crop&w=400&q=80',
      title: 'Barbari Goat',
      price: 12000,
      location: 'Barmer, Rajasthan',
      description: 'Healthy Barbari goat, ideal for dairy and meat.',
      contact: '9112233445',
    },
    {
      id: 9,
      type: 'land',
      image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
      title: '4 Acres Paddy Field',
      price: 800000,
      location: 'Hooghly, West Bengal',
      description: 'Fertile, canal irrigation, close to market.',
      contact: '9123456789',
    },
    {
      id: 10,
      type: 'livestock',
      image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
      title: 'Jersey Cow',
      price: 65000,
      location: 'Salem, Tamil Nadu',
      description: 'Young, high milk yield, docile. Cow breed: Jersey.',
      contact: '9001122335',
    },
    // Sheep
    {
      id: 11,
      type: 'livestock',
      image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=400&q=80',
      title: 'Merino Sheep',
      price: 9000,
      location: 'Bikaner, Rajasthan',
      description: 'Healthy Merino sheep, good for wool and meat.',
      contact: '9001122336',
    },
    // Hen
    {
      id: 12,
      type: 'livestock',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      title: 'Desi Hen',
      price: 500,
      location: 'Kolkata, West Bengal',
      description: 'Egg-laying desi hen, healthy and active.',
      contact: '9001122337',
    },
    // Duck
    {
      id: 13,
      type: 'livestock',
      image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c5c?auto=format&fit=crop&w=400&q=80',
      title: 'White Pekin Duck',
      price: 800,
      location: 'Alappuzha, Kerala',
      description: 'White Pekin duck, good for eggs and meat.',
      contact: '9001122338',
    },
    // Rabbit
    {
      id: 14,
      type: 'livestock',
      image: 'https://images.unsplash.com/photo-1518715308788-3005759c61d3?auto=format&fit=crop&w=400&q=80',
      title: 'New Zealand White Rabbit',
      price: 1500,
      location: 'Bhopal, Madhya Pradesh',
      description: 'Healthy, fast-growing, ideal for breeding.',
      contact: '9001122339',
    },
  ], []);

  // Sync with q query param
  useEffect(() => {
    const params = new URLSearchParams(locationRouter.search);
    const q = params.get('q') || '';
    if (q) {
      setSearch(q);
      // best-effort: switch to livestock if query matches livestock keywords
      const ql = q.toLowerCase();
      if (['cow','buffalo','goat','sheep','hen','duck','rabbit','livestock'].some(k => ql.includes(k))) {
        setTab('livestock');
      }
    }
  }, [locationRouter.search]);

  // Keep URL in sync when search changes via inputs
  useEffect(() => {
    const params = new URLSearchParams(locationRouter.search);
    if (search) params.set('q', search); else params.delete('q');
    navigate({ pathname: '/listings', search: params.toString() }, { replace: true });
  }, [search, locationRouter.search, navigate]);

  // Filtering logic
  const filtered = useMemo(() => listings.filter(l =>
    l.type === tab &&
    (!search || l.title.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase())) &&
    (!location || l.location.toLowerCase().includes(location.toLowerCase())) &&
    (!minPrice || l.price >= parseInt(minPrice)) &&
    (!maxPrice || l.price <= parseInt(maxPrice)) &&
    (tab !== 'livestock' || livestockCategory === 'All' || (l.title.toLowerCase().includes(livestockCategory.toLowerCase()) || l.description.toLowerCase().includes(livestockCategory.toLowerCase())))
  ), [listings, tab, search, location, minPrice, maxPrice, livestockCategory]);

  // Read extra filters from URL (type, loc, min, max, cat)
  useEffect(() => {
    const params = new URLSearchParams(locationRouter.search);
    const t = params.get('type');
    const loc = params.get('loc');
    const mi = params.get('min');
    const ma = params.get('max');
    const cat = params.get('cat');
    if (t === 'land' || t === 'livestock') setTab(t);
    if (loc) setLocation(loc);
    if (mi) setMinPrice(mi);
    if (ma) setMaxPrice(ma);
    if (cat) setLivestockCategory(cat);
  }, [locationRouter.search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 listings-news-aware">
      <Navbar />
      <div className="py-8 px-2 xl:pr-[370px]">
        <div className="max-w-6xl mx-auto flex flex-row gap-0 xl:ml-20">
          <div className="flex-1">
            <div className="mb-15 gap-6">
              <div className="flex flex-row justify-center items-center gap-8 bg-white dark:bg-gray-800 rounded-xl shadow p-1 w-full mb-6">
                <button onClick={() => setTab('land')} className={`w-48 px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 ${tab === 'land' ? 'bg-green-600 text-white shadow-lg scale-105' : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700'}`}>🌱 Agricultural <br/>Land</button>
                <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-2" />
                <button onClick={() => setTab('livestock')} className={`w-48 px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 ${tab === 'livestock' ? 'bg-green-600 text-white shadow-lg scale-105' : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700'}`}>🐄 Cattle & Livestock</button>
              </div>
              {/* Livestock category filter buttons */}
              {tab === 'livestock' && (
                <div className="flex flex-wrap justify-center w-full gap-2 mb-6">
                  {livestockCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setLivestockCategory(cat)}
                      className={`px-4 py-1 rounded-full font-semibold border transition-all duration-150 text-sm
                        ${livestockCategory === cat
                          ? 'bg-green-600 text-white border-green-700 shadow'
                          : 'bg-white dark:bg-gray-700 text-green-700 dark:text-green-200 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-800'}
                      `}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 items-center bg-white dark:bg-gray-800 rounded-xl shadow p-2 w-full">
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all flex-1 min-w-[120px]" />
                <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all flex-1 min-w-[120px]" />
                <input type="number" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all flex-1 min-w-[100px]" />
                <input type="number" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all flex-1 min-w-[100px]" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {filtered.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 dark:text-gray-300 py-8">No listings found.</div>
              ) : filtered.map(listing => (
                <div key={listing.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-green-100 dark:border-gray-700 hover:shadow-green-200 dark:hover:shadow-green-900 hover:scale-[1.025] transition-all duration-300 group relative">
                  <div className="relative">
                    <img src={listing.image} alt={listing.title} className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-3 right-3 bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wide font-bold opacity-90">{listing.type === 'land' ? 'Land' : 'Livestock'}</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-2xl font-extrabold mb-1 text-green-700 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-200 transition-colors">{listing.title}</h2>
                    <div className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-1">₹{listing.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1"><i className='bx bx-map'></i>{listing.location}</div>
                    <p className="text-gray-700 dark:text-gray-200 flex-1 mb-2">{listing.description}</p>
                    <Link
                      to={`/contact/${listing.id}`}
                      state={{ listing }}
                      className="mt-auto bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-center !text-white hover:!text-white focus:!text-white"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {/* Contact Us section aligned left with image and effects */}
            <div className="mt-12 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-green-100 dark:border-gray-700 overflow-hidden group">
              <div className="h-1 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-yellow-400" />
              <div className="grid grid-cols-1 md:grid-cols-5">
                {/* Left: Form */}
                <div className="md:col-span-3 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-extrabold text-green-800 dark:text-green-200">Contact Us</h2>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSent(true);
                      setTimeout(() => setContactSent(false), 3000);
                      setContactName('');
                      setContactEmail('');
                      setContactMsg('');
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="md:col-span-1">
                      <label className="nav-filter-label" htmlFor="dev-name">Your Name</label>
                      <input id="dev-name" className="nav-filter-input" placeholder="Your name" value={contactName} onChange={e => setContactName(e.target.value)} required />
                    </div>
                    <div className="md:col-span-1">
                      <label className="nav-filter-label" htmlFor="dev-email">Email</label>
                      <input id="dev-email" className="nav-filter-input" type="email" placeholder="you@example.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="nav-filter-label" htmlFor="dev-msg">Message</label>
                      <textarea id="dev-msg" className="nav-filter-input" rows={4} placeholder="How can we help?" value={contactMsg} onChange={e => setContactMsg(e.target.value)} required />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <button className="nav-filter-apply" type="submit">Send</button>
                      {contactSent && <div className="text-green-700 dark:text-green-300">Thanks! We’ll get back to you shortly.</div>}
                    </div>
                  </form>
                </div>
                {/* Right: Illustration */}
                <div className="md:col-span-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-transparent to-yellow-500/10 pointer-events-none" />
                  <img
                    src="/help.jpeg"
                    alt="Contact the OnlyFarmers developers"
                    className="w-full h-full object-cover md:min-h-[320px] scale-100 group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 right-3 bg-white/80 dark:bg-gray-900/70 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700 shadow">
                    We’re here to help
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* NewsSidebar is now rendered directly without the container div */}
          <NewsSidebar />
        </div>
      </div>
      <Footer />
    </div>
  );
}