import { db } from '../firebase';
import { auth } from '../firebase';
import { serverTimestamp, setDoc, doc, updateDoc, increment, collection, addDoc, writeBatch, getDocs, query, where, getDocs as getDocsOnce, orderBy } from 'firebase/firestore';

export type ThreadMeta = {
  peerName?: string;
  peerAvatar?: string;
  listingId?: number;
};

export async function sendMessageToThread(threadId: string, text: string, meta?: ThreadMeta) {
  const user = auth.currentUser;
  if (!user) return;
  const threadRef = doc(db, 'users', user.uid, 'threads', threadId);
  await setDoc(
    threadRef,
    {
      lastMessage: text,
      updatedAt: serverTimestamp(),
      unreadCount: increment(1),
      peerName: meta?.peerName,
      peerAvatar: meta?.peerAvatar,
      listingId: meta?.listingId,
    },
    { merge: true }
  );
  // Append message in messages subcollection
  const messagesCol = collection(threadRef, 'messages');
  await addDoc(messagesCol, {
    text,
    createdAt: serverTimestamp(),
    sender: 'me',
  });
}

export async function markThreadRead(threadId: string) {
  const user = auth.currentUser;
  if (!user) return;
  const threadRef = doc(db, 'users', user.uid, 'threads', threadId);
  await updateDoc(threadRef, { unreadCount: 0 });
}

export async function addNotification(text: string) {
  const user = auth.currentUser;
  if (!user) return;
  const notifCol = collection(db, 'users', user.uid, 'notifications');
  await addDoc(notifCol, { text, createdAt: serverTimestamp(), read: false });
}

export async function markAllNotificationsRead() {
  const user = auth.currentUser;
  if (!user) return;
  const notifCol = collection(db, 'users', user.uid, 'notifications');
  const snap = await getDocs(notifCol);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}

// 1:1 Conversations API (WhatsApp/LinkedIn style)
export function conversationIdFor(userIdA: string, userIdB: string): string {
  return [userIdA, userIdB].sort().join('_');
}

export async function ensureConversationWith(peerId: string, peerName?: string, peerAvatar?: string) {
  const me = auth.currentUser;
  if (!me) return null;
  const convId = conversationIdFor(me.uid, peerId);
  const ref = doc(db, 'conversations', convId);
  await setDoc(ref, {
    participants: [me.uid, peerId].sort(),
    participantNames: { [me.uid]: me.displayName || 'You', [peerId]: peerName || 'User' },
    participantAvatars: { [me.uid]: me.photoURL || '', [peerId]: peerAvatar || '' },
    updatedAt: serverTimestamp(),
    lastMessage: '',
  }, { merge: true });
  return convId;
}

export async function sendConversationMessage(conversationId: string, text: string) {
  const me = auth.currentUser;
  if (!me) return;
  const msgCol = collection(db, 'conversations', conversationId, 'messages');
  await addDoc(msgCol, { text, senderId: me.uid, createdAt: serverTimestamp() });
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  });
}



