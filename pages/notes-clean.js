// pages/notes.js - Advanced Block-Based Notes with Firestore
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { 
  getUserBlockNotes, 
  createBlockNote, 
  deleteBlockNote
} from '../lib/firestoreBlocks';
import { FirestoreNotesProvider } from '../context/FirestoreNotesContext';
import FirestoreNotesApp from '../components/FirestoreNotesApp';
import { auth } from '../lib/firebase';

export default function NotesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) fetchNotes();
  }, [user, loading]);

  async function fetchNotes() {
    try {
      setNotesLoading(true);
      const userNotes = await getUserBlockNotes(user.uid);
      setNotes(userNotes);
      
      // Auto-select first note if none selected and we have notes
      if (userNotes.length > 0 && !selectedNoteId) {
        setSelectedNoteId(userNotes[0].id);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes. The index might still be building - try again in a few minutes.');
    } finally {
      setNotesLoading(false);
    }
  }

  async function handleCreateNote(e) {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    
    setIsCreating(true);
    setError('');
    
    try {
      const noteId = await createBlockNote({ 
        userId: user.uid, 
        title: newNoteTitle.trim() 
      });
      
      setNewNoteTitle('');
      setSelectedNoteId(noteId);
      await fetchNotes();
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note? This cannot be undone.')) {
      return;
    }
    
    try {
      await deleteBlockNote(noteId);
      
      if (selectedNoteId === noteId) {
        const remainingNotes = notes.filter(n => n.id !== noteId);
        setSelectedNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
      }
      
      await fetchNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note: ' + err.message);
    }
  }

  function handleSignOut() {
    auth.signOut();
    router.push('/login');
  }

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If a note is selected, show the advanced editor
  if (selectedNoteId) {
    return (
      <FirestoreNotesProvider noteId={selectedNoteId}>
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            padding: '12px 24px', 
            borderBottom: '1px solid #eee', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button 
                onClick={() => setSelectedNoteId(null)}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                ← All Notes
              </button>
              <h3 style={{ margin: 0 }}>
                {notes.find(n => n.id === selectedNoteId)?.title || 'Loading...'}
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button 
                onClick={() => handleDeleteNote(selectedNoteId)}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Delete Note
              </button>
              <button 
                onClick={handleSignOut}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
          
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <FirestoreNotesApp />
          </div>
        </div>
      </FirestoreNotesProvider>
    );
  }

  // Notes list view
  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, color: '#333' }}>Proibe Notes</h1>
        <button 
          onClick={handleSignOut} 
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>

      {error && (
        <div style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: 4,
          padding: 16, 
          marginBottom: 24 
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: 8,
        padding: 24,
        marginBottom: 32
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Create New Note</h2>
        <form onSubmit={handleCreateNote} style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder="Enter note title..."
            value={newNoteTitle}
            onChange={e => setNewNoteTitle(e.target.value)}
            required
            style={{ 
              flex: 1,
              padding: 12,
              fontSize: 16,
              border: '1px solid #ced4da',
              borderRadius: 4
            }}
          />
          <button 
            type="submit" 
            disabled={isCreating || !newNoteTitle.trim()}
            style={{ 
              padding: '12px 24px',
              fontSize: 16,
              backgroundColor: isCreating ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: isCreating ? 'not-allowed' : 'pointer',
              minWidth: 120
            }}
          >
            {isCreating ? 'Creating...' : 'Create Note'}
          </button>
        </form>
      </div>

      <div>
        <h2 style={{ marginBottom: 16 }}>Your Notes ({notes.length})</h2>
        
        {notesLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p>Loading your notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 40,
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            color: '#6c757d'
          }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>No notes yet!</p>
            <p>Create your first note using the form above.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {notes.map(note => (
              <div 
                key={note.id} 
                style={{ 
                  border: '1px solid #dee2e6',
                  borderRadius: 8,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white'
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.borderColor = '#007bff';
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#dee2e6';
                }}
                onClick={() => setSelectedNoteId(note.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
                      {note.title}
                    </h3>
                    <p style={{ margin: '0 0 8px 0', color: '#6c757d', fontSize: 14 }}>
                      Blocks: {note.blockOrder?.length || 0}
                    </p>
                    <p style={{ margin: 0, color: '#6c757d', fontSize: 12 }}>
                      {note.updatedAt ? new Date(note.updatedAt.toDate()).toLocaleString() : 'Just created'}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    style={{ 
                      padding: '6px 12px',
                      fontSize: 12,
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
