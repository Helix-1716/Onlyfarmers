import './NewsSidebar.css';
import 'boxicons/css/boxicons.min.css';
import { useNewsSidebar } from './context/NewsSidebarContext';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

type NewsItem = {
  title: string;
  summary: string;
  link: string;
  category?: string;
  timestamp?: string;
  image?: string;
};

function formatTimeAgo(iso?: string): string | undefined {
  if (!iso) return undefined;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return undefined;
  const now = Date.now();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NewsSidebar() {
  const { isNewsSidebarOpen, closeNewsSidebar, openNewsSidebar } = useNewsSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  type EnvMeta = { env?: Record<string, string | undefined> };
  type NewsAPIArticle = {
    title?: string;
    description?: string;
    content?: string;
    url?: string;
    source?: { name?: string };
    publishedAt?: string;
    urlToImage?: string | null;
  };
  type NewsAPIResponse = { status?: string; totalResults?: number; articles?: NewsAPIArticle[] };

  const fetchNews = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Prefer live news via NewsAPI if key is configured
      const apiKey = (import.meta as unknown as EnvMeta)?.env?.VITE_NEWS_API_KEY as string | undefined;
      if (apiKey) {
        try {
          const params = new URLSearchParams({
            q: 'agriculture OR farming OR crops OR livestock',
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: '20',
          });
          const url = `https://newsapi.org/v2/everything?${params.toString()}`;
          const res = await fetch(url, { headers: { 'X-Api-Key': apiKey } });
          if (!res.ok) throw new Error(`NewsAPI HTTP ${res.status}`);
          const json: NewsAPIResponse = await res.json();
          const mapped: NewsItem[] = (json.articles || []).map((a: NewsAPIArticle) => ({
            title: a.title || 'Untitled',
            summary: a.description || a.content || '',
            link: a.url || '#',
            category: a.source?.name,
            timestamp: a.publishedAt,
            image: a.urlToImage || undefined,
          }));
          if (mapped.length) {
            setItems(mapped);
            return;
          }
        } catch (apiErr) {
          // Fall through to local fallback if API fails
          console.warn('NewsAPI error, falling back to local news.json', apiErr);
        }
      }

      // Fallback: local static file
      const res = await fetch('/news.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: NewsItem[] = await res.json();
      setItems(data);
    } catch {
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const id = setInterval(fetchNews, 1000 * 60 * 5);
    return () => clearInterval(id);
  }, [fetchNews]);

  // Default-open on desktop widths
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
      openNewsSidebar();
    }
  }, [openNewsSidebar]);

  // Close on route change (mobile behavior polish)
  useEffect(() => {
    closeNewsSidebar();
  }, [location.pathname, closeNewsSidebar]);

  // Handle swipe gesture to close sidebar (reduced threshold for better mobile UX)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (swipeDistance > 80) {
      closeNewsSidebar();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!isNewsSidebarOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        closeNewsSidebar();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') closeNewsSidebar();
    }

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isNewsSidebarOpen, closeNewsSidebar]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <li className="news-item">
          <div className="news-link" style={{ padding: '12px 16px', background: '#1a2a36', color: '#fff' }}>Loading news…</div>
        </li>
      );
    }
    if (error) {
      return (
        <li className="news-item">
          <div className="news-link" style={{ padding: '12px 16px', background: '#7f1d1d', color: '#fff' }}>{error}</div>
        </li>
      );
    }
    if (!items.length) {
      return (
        <li className="news-item">
          <div className="news-link" style={{ padding: '12px 16px', background: '#1a2a36', color: '#fff' }}>No news available.</div>
        </li>
      );
    }
    return items.map((item, idx) => {
      const timeAgo = formatTimeAgo(item.timestamp);
      return (
        <li key={idx} className="news-item">
          <a
            href={item.link}
            className="news-link"
            tabIndex={0}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'grid',
              gridTemplateColumns: item.image ? '56px 1fr' : '1fr',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#1a2a36',
              color: '#fff',
              textDecoration: 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#22384a';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#1a2a36';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
            }}
            aria-label={`${item.title}${item.category ? `, category ${item.category}` : ''}${timeAgo ? `, ${timeAgo}` : ''}`}
          >
            {item.image && (
              <img src={item.image} alt={item.title} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {item.category && (
                  <span style={{
                    background: '#16a34a', color: '#fff', padding: '2px 8px', borderRadius: 999,
                    fontSize: 12, fontWeight: 800, letterSpacing: 0.3
                  }}>
                    {item.category}
                  </span>
                )}
                {timeAgo && (
                  <span style={{ color: '#cbd5e1', fontSize: 12 }}>
                    {timeAgo}
                  </span>
                )}
              </div>
              <strong style={{ display: 'block' }}>{item.title}</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.95em', color: '#cfd8dc' }}>{item.summary}</p>
            </div>
          </a>
        </li>
      );
    });
  }, [items, loading, error]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-all duration-300 ease-in-out xl:hidden ${isNewsSidebarOpen ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none pointer-events-none'}`}
        onClick={closeNewsSidebar}
        aria-hidden="true"
      />

      <aside 
        ref={sidebarRef}
        className={`news-sidebar transform transition-transform duration-300 ease-in-out ${isNewsSidebarOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}`}
        style={{ 
          position: 'fixed', 
          top: 0, 
          right: 0, 
          height: '100vh', 
          width: '320px', 
          zIndex: 9999, 
          background: '#EEEFE0', 
          boxShadow: '-2px 0 8px rgba(0,0,0,0.08)' 
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="complementary"
        aria-label="Latest agriculture news"
      >
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="news-title" style={{ textAlign: 'center', margin: '16px 0' }}>
            <i className='bx bx-leaf news-leaf'></i>
            News
          </h3>
          <button 
            className="xl:hidden p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            onClick={closeNewsSidebar}
            aria-label="Close news sidebar"
          >
            <i className='bx bx-x text-2xl'></i>
          </button>
        </div>
        <ul className="news-list">
          {content}
        </ul>
      </aside>
    </>
  );
}
