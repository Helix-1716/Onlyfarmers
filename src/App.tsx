import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import './App.css';
import ListingsPage from './Listings';
import Loading from './Loading';
import ContactPage from './ContactPage';
import { NewsSidebarProvider } from './context/NewsSidebarContext';
import { AuthProvider } from './context/AuthContext';
import ProfilePage from './Profile';
import SettingsPage from './Settings';
import AuctionPage from './Auction';
import ContactUsPage from './ContactUs';
import MessagesPage from './Messages';
import MyListingsPage from './MyListings';
import AuctionDetailsPage from './AuctionDetails';
import PeoplePage from './People';
import SellPage from './Sell';

function LandingPage({ darkMode, setDarkMode }: { darkMode: boolean, setDarkMode: (v: boolean) => void }) {
  const subheadlineText = "  Land & Live Stock Market place for Rural India ";
  const [typedSubheadline, setTypedSubheadline] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    setTypedSubheadline("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < subheadlineText.length) {
        setTypedSubheadline((prev) => prev + subheadlineText.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [subheadlineText]);
  return (
    <div className={`landing-root${darkMode ? ' dark' : ''}`}> 
      {/* Animated Gradient Background */}
      <div className="animated-bg" aria-hidden="true" />
      {/* 3D Spline Model */}
      <div className="spline-container" aria-hidden="true">
        <Spline scene="https://prod.spline.design/BzyoLVhntaZ3qTX1/scene.splinecode" />
      </div>
      {/* Main Content */}
      <main className="landing-content">
        <header>
          <h1 className="headline">
            <span>ONLY</span><span className="farmers-gradient">FARMERS</span>
            <span className="dot-in">.in</span>
          </h1>
          <h2 className="subheadline">{typedSubheadline}<span className="type-cursor">|</span></h2>
        </header>
        <button className="explore-btn" tabIndex={0} aria-label="Explore Listings" onClick={() => navigate('/listings')}>
          Explore Listings
        </button>
        <Link to="/contact-us" className="explore-btn" aria-label="Contact OnlyFarmers" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '8px' }}>
          Contact Us
        </Link>
        <div className="toggle-switch" role="button" tabIndex={0} onClick={() => setDarkMode(!darkMode)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setDarkMode(!darkMode); }} aria-label="Toggle dark mode">
          <div className={`switch-thumb${darkMode ? ' dark' : ''}`}></div>
        </div>
      </main>
      <footer className="landing-footer">
        <small>Rooted in Nature. Driven by Tech.</small>
      </footer>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timeout);
  }, [location]);

  return (
    <AuthProvider>
    <NewsSidebarProvider>
      {loading && <Loading />}
      <Routes>
        <Route path="/" element={<LandingPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/contact/:id" element={<ContactPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/my-listings" element={<MyListingsPage />} />
        <Route path="/auction/:id" element={<AuctionDetailsPage />} />
        <Route path="/auction" element={<AuctionPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/people" element={<PeoplePage />} />
      </Routes>
    </NewsSidebarProvider>
    </AuthProvider>
  );
}
