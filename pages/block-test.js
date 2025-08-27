import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { 
  createBlockNote, 
  getNoteWithBlocks
} from '../lib/firestoreBlocks';
import { auth } from '../lib/firebase';

export default function SimpleBlockTest() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [blockTitle, setBlockTitle] = useState('');
  const [createdNoteId, setCreatedNoteId] = useState(null);
  const [noteDetails, setNoteDetails] = useState(null);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  async function handleCreateBlockNote(e) {
    e.preventDefault();
    if (!blockTitle.trim()) return;
    
    setIsCreating(true);
    setError('');
    
    try {
      const result = await createBlockNote({ 
        userId: user.uid, 
        title: blockTitle.trim() 
      });
      
      console.log('Created note:', result);
      setCreatedNoteId(result);
      setBlockTitle('');
      
      // Fetch the created note details
      if (result) {
        const noteWithBlocks = await getNoteWithBlocks(user.uid, result);
        setNoteDetails(noteWithBlocks);
      }
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create block note: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  }

  function handleSignOut() {
    auth.signOut();
    router.push('/login');
  }

  if (loading || !user) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Simple Block Test</h1>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
      
      {error && <div style={{ color: 'red', marginBottom: 16, padding: 16, backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: 4 }}>
        <strong>Error:</strong> {error}
      </div>}

      {/* Create Block Note Form */}
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 24 }}>
        <h2>Create Block Note</h2>
        
        <form onSubmit={handleCreateBlockNote}>
          <input
            type="text"
            placeholder="Enter note title..."
            value={blockTitle}
            onChange={e => setBlockTitle(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 16, padding: 12, fontSize: '16px' }}
          />
          <button 
            type="submit" 
            disabled={isCreating || !blockTitle.trim()}
            style={{ 
              padding: '12px 24px', 
              fontSize: '16px',
              backgroundColor: isCreating ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: isCreating ? 'not-allowed' : 'pointer'
            }}
          >
            {isCreating ? 'Creating...' : 'Create Block Note'}
          </button>
        </form>
      </div>

      {/* Show Created Note Details */}
      {noteDetails && (
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
          <h2>Created Note Details</h2>
          
          <div style={{ marginBottom: 16 }}>
            <p><strong>Note ID:</strong> {noteDetails.id}</p>
            <p><strong>Title:</strong> {noteDetails.title}</p>
            <p><strong>User ID:</strong> {noteDetails.userId}</p>
            <p><strong>Block Order:</strong> [{noteDetails.blockOrder?.join(', ') || 'none'}]</p>
            <p><strong>Created:</strong> {noteDetails.createdAt ? new Date(noteDetails.createdAt.toDate()).toLocaleString() : 'Just now'}</p>
          </div>

          <h3>Blocks ({noteDetails.blocks?.length || 0}):</h3>
          {noteDetails.blocks && noteDetails.blocks.length > 0 ? (
            <div>
              {noteDetails.blocks.map((block, index) => (
                <div key={block.id} style={{ 
                  border: '1px solid #eee', 
                  borderRadius: 4, 
                  padding: 12, 
                  marginBottom: 8,
                  backgroundColor: '#f9f9f9'
                }}>
                  <p><strong>Block #{index + 1}</strong></p>
                  <p><strong>ID:</strong> {block.id}</p>
                  <p><strong>Type:</strong> {block.type}</p>
                  <p><strong>Content:</strong> {
                    typeof block.content === 'string' 
                      ? block.content
                      : JSON.stringify(block.content, null, 2)
                  }</p>
                  <p><strong>Parent ID:</strong> {block.parentId || 'null (top-level)'}</p>
                  <p><strong>Order:</strong> {block.order}</p>
                  {block.collapsed !== undefined && <p><strong>Collapsed:</strong> {block.collapsed.toString()}</p>}
                  {block.pinned !== undefined && <p><strong>Pinned:</strong> {block.pinned.toString()}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontStyle: 'italic', color: '#666' }}>No blocks found in this note.</p>
          )}
        </div>
      )}

      {createdNoteId && !noteDetails && (
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
          <p>Note created with ID: {createdNoteId}</p>
          <p>Loading details...</p>
        </div>
      )}
    </div>
  );
}
