import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

// Create a new note for a user
export async function createNote({ userId, title, content }) {
  const docRef = await addDoc(collection(db, 'notes'), {
    userId,
    title,
    content,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Read all notes for a specific user
export async function getUserNotes(userId) {
  if (!userId) return [];
  const notesCollection = collection(db, 'notes');
  const userNotesQuery = query(notesCollection, where('userId', '==', userId));
  const querySnapshot = await getDocs(userNotesQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Update a note by its document ID
export async function updateNote(noteId, updates) {
  if (!noteId || !updates || Object.keys(updates).length === 0) return;
  const noteRef = doc(db, 'notes', noteId);
  await updateDoc(noteRef, { ...updates, updatedAt: serverTimestamp() });
}

// Delete a note by its document ID
export async function deleteNote(noteId) {
  if (!noteId) return;
  const noteRef = doc(db, 'notes', noteId);
  await deleteDoc(noteRef);
}
