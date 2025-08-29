import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from './context/AuthContext';
import { useLocation } from 'react-router-dom';
import { db } from './firebase';
import { collection, doc, onSnapshot, orderBy, query, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { conversationIdFor, ensureConversationWith, sendConversationMessage } from './services/chat';

type Thread = { id: string; name: string; avatar: string; last: string; updatedAt: number };
type Message = { id: string; text: string; sender: 'me' | 'peer'; createdAt: number };

export default function MessagesPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  // List conversations where current user is a participant
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const next: Thread[] = snap.docs.map(d => {
        const v = d.data() as any;
        // Derive peer name/avatar
        const peerId = (v.participants || []).find((p: string) => p !== user.uid);
        const name = v.participantNames?.[peerId] || 'Chat';
        const avatar = v.participantAvatars?.[peerId] || 'https://randomuser.me/api/portraits/men/12.jpg';
        return { id: d.id, name, avatar, last: v.lastMessage || '', updatedAt: (v.updatedAt?.toMillis?.() || v.updatedAt || Date.now()) };
      });
      setThreads(next);
      if (!activeId && next.length) setActiveId(next[0].id);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !activeId) return;
    const msgs = query(collection(db, 'conversations', activeId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(msgs, (snap) => {
      const next: Message[] = snap.docs.map(d => {
        const v = d.data() as any;
        return { id: d.id, text: v.text || '', sender: (v.senderId === user.uid ? 'me' : 'peer') as 'me' | 'peer', createdAt: (v.createdAt?.toMillis?.() || v.createdAt || Date.now()) };
      });
      setMessages(next);
    });
    return () => unsub();
  }, [user, activeId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Accept navigation state to open a specific conversation
  useEffect(() => {
    const state = location.state as any;
    if (state?.conversationId) {
      setActiveId(state.conversationId as string);
    }
  }, [location.state]);

  const timeLabel = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const send = async () => {
    const text = draft.trim();
    if (!text || !user || !activeId) return;
    await sendConversationMessage(activeId, text);
    setDraft('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-3 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-green-200/60 dark:border-green-900/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur shadow">
          <div className="px-4 py-3 font-extrabold text-green-800 dark:text-green-200 border-b border-green-100/80 dark:border-green-900/60">Messages</div>
          <div className="max-h-[72vh] overflow-y-auto">
            {threads.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-600 dark:text-gray-400">No conversations yet.</div>
            ) : threads.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeId === t.id ? 'bg-green-50 dark:bg-gray-800' : 'hover:bg-green-50/70 dark:hover:bg-gray-800/70'}`}
              >
                <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-green-300/60" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{t.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.last}</div>
                </div>
                {activeId === t.id && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
              </button>
            ))}
          </div>
        </aside>

        {/* Conversation */}
        <section className="md:col-span-2 rounded-2xl border border-green-200/60 dark:border-green-900/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur shadow flex flex-col overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-green-100/80 dark:border-green-900/60">
            <div className="flex items-center gap-3">
              <img src={threads.find(t => t.id === activeId)?.avatar || 'https://randomuser.me/api/portraits/men/12.jpg'} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              <div className="font-extrabold text-gray-900 dark:text-white">{threads.find(t => t.id === activeId)?.name || 'Conversation'}</div>
            </div>
            {activeId && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[50%]">{threads.find(t => t.id === activeId)?.last || ''}</div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">Select a conversation to start chatting.</div>
            ) : messages.map(m => (
              <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.sender === 'me' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-l-2xl rounded-tr-2xl' : 'bg-gray-100/90 dark:bg-gray-800/90 text-gray-900 dark:text-white rounded-r-2xl rounded-tl-2xl'} max-w-[75%] px-3 py-2 shadow-md`}> 
                  <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.text}</div>
                  <div className={`text-[10px] mt-1 ${m.sender === 'me' ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'}`}>{timeLabel(m.createdAt)}</div>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="border-t border-green-100/80 dark:border-green-900/60 p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <textarea value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder="Type a message..." className="w-full resize-none rounded-2xl border border-green-200 dark:border-gray-700 px-3 py-2 bg-gray-50/90 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <button onClick={send} disabled={!draft.trim()} className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-600 hover:to-emerald-800 disabled:opacity-60 text-white font-bold px-5 py-2 rounded-2xl shadow">Send</button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}


