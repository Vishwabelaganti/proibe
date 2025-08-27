import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
// Simple notes functions
import { getUserNotes, createNote, updateNote, deleteNote } from '../lib/firestoreNotes';
// Block-based notes functions
import { 
  getUserBlockNotes, 
  createBlockNote, 
  updateBlockNote, 
  deleteBlockNote,
  getNoteWithBlocks
} from '../lib/firestoreBlocks';
import { auth } from '../lib/firebase';

export default function NotesTestPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [simpleNotes, setSimpleNotes] = useState([]);
  const [blockNotes, setBlockNotes] = useState([]);
  const [error, setError] = useState('');
  const [selectedBlockNote, setSelectedBlockNote] = useState(null);

  // Simple note form state
  const [simpleTitle, setSimpleTitle] = useState('');
  const [simpleContent, setSimpleContent] = useState('');

  // Block note form state
  const [blockTitle, setBlockTitle] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      fetchSimpleNotes();
      fetchBlockNotes();
    }
  }, [user, loading]);

  async function fetchSimpleNotes() {
    try {
      const notes = await getUserNotes(user.uid);
      setSimpleNotes(notes);
    } catch (err) {
      setError('Failed to fetch simple notes');
    }
  }

  async function fetchBlockNotes() {
    try {
      const notes = await getUserBlockNotes(user.uid);
      setBlockNotes(notes);
    } catch (err) {
      setError('Failed to fetch block notes');
    }
  }

  async function handleCreateSimpleNote(e) {
    e.preventDefault();
    setError('');
    try {
      await createNote({ userId: user.uid, title: simpleTitle, content: simpleContent });
      setSimpleTitle('');
      setSimpleContent('');
      fetchSimpleNotes();
    } catch (err) {
      setError('Failed to create simple note');
    }
  }

  async function handleCreateBlockNote(e) {
    e.preventDefault();
    setError('');
    try {
      await createBlockNote({ userId: user.uid, title: blockTitle });
      setBlockTitle('');
      fetchBlockNotes();
    } catch (err) {
      setError('Failed to create block note');
    }
  }

  async function handleViewBlockNote(noteId) {
    try {
      const noteWithBlocks = await getNoteWithBlocks(user.uid, noteId);
      setSelectedBlockNote(noteWithBlocks);
    } catch (err) {
      setError('Failed to load block note');
    }
  }

  function handleSignOut() {
    auth.signOut();
    router.push('/login');
  }

  if (loading || !user) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Notes Test Page</h1>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
      
      {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        
        {/* Simple Notes Column */}
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
          <h2>Simple Notes (Current)</h2>
          
          <form onSubmit={handleCreateSimpleNote} style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Simple Note Title"
              value={simpleTitle}
              onChange={e => setSimpleTitle(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8 }}
            />
            <textarea
              placeholder="Simple Note Content"
              value={simpleContent}
              onChange={e => setSimpleContent(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8, height: 80 }}
            />
            <button type="submit" style={{ width: '100%', padding: 8 }}>
              Create Simple Note
            </button>
          </form>

          <div>
            <h3>Your Simple Notes:</h3>
            {simpleNotes.length === 0 ? (
              <p>No simple notes yet.</p>
            ) : (
              simpleNotes.map(note => (
                <div key={note.id} style={{ border: '1px solid #eee', borderRadius: 4, padding: 8, marginBottom: 8 }}>
                  <h4>{note.title}</h4>
                  <p style={{ fontSize: '0.9em', color: '#666' }}>{note.content.substring(0, 100)}...</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Block Notes Column */}
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
          <h2>Block Notes (New)</h2>
          
          <form onSubmit={handleCreateBlockNote} style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Block Note Title"
              value={blockTitle}
              onChange={e => setBlockTitle(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8 }}
            />
            <button type="submit" style={{ width: '100%', padding: 8 }}>
              Create Block Note
            </button>
          </form>

          <div>
            <h3>Your Block Notes:</h3>
            {blockNotes.length === 0 ? (
              <p>No block notes yet.</p>
            ) : (
              blockNotes.map(note => (
                <div key={note.id} style={{ border: '1px solid #eee', borderRadius: 4, padding: 8, marginBottom: 8 }}>
                  <h4>{note.title}</h4>
                  <p style={{ fontSize: '0.8em', color: '#666' }}>
                    Blocks: {note.blockOrder?.length || 0}
                  </p>
                  <button 
                    onClick={() => handleViewBlockNote(note.id)}
                    style={{ fontSize: '0.8em', padding: '4px 8px' }}
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Block Note Details Column */}
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
          <h2>Block Note Details</h2>
          
          {selectedBlockNote ? (
            <div>
              <h3>{selectedBlockNote.title}</h3>
              <p><strong>Note ID:</strong> {selectedBlockNote.id}</p>
              <p><strong>Block Order:</strong> [{selectedBlockNote.blockOrder?.join(', ') || 'none'}]</p>
              
              <h4>Blocks ({selectedBlockNote.blocks?.length || 0}):</h4>
              {selectedBlockNote.blocks?.map(block => (
                <div key={block.id} style={{ 
                  border: '1px solid #f0f0f0', 
                  borderRadius: 4, 
                  padding: 8, 
                  marginBottom: 8,
                  backgroundColor: '#fafafa'
                }}>
                  <p><strong>Type:</strong> {block.type}</p>
                  <p><strong>Content:</strong> {
                    typeof block.content === 'string' 
                      ? block.content.substring(0, 50) + (block.content.length > 50 ? '...' : '')
                      : JSON.stringify(block.content).substring(0, 50) + '...'
                  }</p>
                  <p><strong>Parent:</strong> {block.parentId || 'none'}</p>
                  <p><strong>Order:</strong> {block.order}</p>
                </div>
              )) || <p>No blocks in this note.</p>}
            </div>
          ) : (
            <p>Select a block note to view its details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
