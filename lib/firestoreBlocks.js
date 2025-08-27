// lib/firestoreBlocks.js
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// ===== NOTE OPERATIONS =====

export async function createBlockNote({ userId, title }) {
  try {
    const noteData = {
      userId,
      title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      blockOrder: [] // Array of top-level block IDs
    };
    
    const docRef = await addDoc(collection(db, 'notes'), noteData);
    const noteId = docRef.id;
    
    // Create a default welcome block
    const welcomeBlockData = {
      id: `welcome-${Date.now()}`,
      type: 'heading',
      content: title || 'Welcome to Your Note',
      parentId: null,
      order: 0,
      collapsed: false,
      pinned: false,
      headingColor: '#4A3B2F',
      headingBold: true,
      headingItalic: false,
      headingUnderline: false,
      headingFont: '"Playfair Display", serif'
    };
    
    const blockRef = await addDoc(collection(db, 'notes', noteId, 'blocks'), welcomeBlockData);
    
    // Update note with the block order
    await updateDoc(docRef, {
      blockOrder: [welcomeBlockData.id]
    });
    
    return noteId;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}

export async function getUserBlockNotes(userId) {
  try {
    const q = query(
      collection(db, 'notes'), 
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
}

export async function updateBlockNote(noteId, updates) {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}

export async function deleteBlockNote(noteId) {
  try {
    // First delete all blocks in the subcollection
    const blocksSnapshot = await getDocs(collection(db, 'notes', noteId, 'blocks'));
    const batch = writeBatch(db);
    
    blocksSnapshot.docs.forEach((blockDoc) => {
      batch.delete(blockDoc.ref);
    });
    
    // Then delete the note document
    const noteRef = doc(db, 'notes', noteId);
    batch.delete(noteRef);
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}

// ===== BLOCK OPERATIONS =====

export async function getNoteWithBlocks(userId, noteId) {
  try {
    // Get note metadata
    const noteRef = doc(db, 'notes', noteId);
    const noteDoc = await getDoc(noteRef);
    
    if (!noteDoc.exists()) {
      throw new Error('Note not found');
    }
    
    // Check if user owns this note
    const noteData = noteDoc.data();
    if (noteData.userId !== userId) {
      throw new Error('Access denied - not your note');
    }
    
    // Get all blocks for this note
    const blocksQuery = query(
      collection(db, 'notes', noteId, 'blocks'),
      orderBy('order')
    );
    const blocksSnapshot = await getDocs(blocksQuery);
    
    const blocks = blocksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      id: noteDoc.id,
      ...noteDoc.data(),
      blocks
    };
  } catch (error) {
    console.error('Error fetching note with blocks:', error);
    throw error;
  }
}

export async function createBlock(noteId, blockData) {
  try {
    const blocksRef = collection(db, 'notes', noteId, 'blocks');
    const docRef = await addDoc(blocksRef, {
      ...blockData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update note's updatedAt timestamp
    await updateBlockNote(noteId, {});
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating block:', error);
    throw error;
  }
}

export async function updateBlock(noteId, blockId, updates) {
  try {
    const blockRef = doc(db, 'notes', noteId, 'blocks', blockId);
    await updateDoc(blockRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    // Update note's updatedAt timestamp
    await updateBlockNote(noteId, {});
  } catch (error) {
    console.error('Error updating block:', error);
    throw error;
  }
}

export async function deleteBlock(noteId, blockId) {
  try {
    const blockRef = doc(db, 'notes', noteId, 'blocks', blockId);
    await deleteDoc(blockRef);
    
    // Update note's updatedAt timestamp
    await updateBlockNote(noteId, {});
  } catch (error) {
    console.error('Error deleting block:', error);
    throw error;
  }
}

export async function updateBlockOrder(noteId, blockOrder) {
  try {
    await updateBlockNote(noteId, { blockOrder });
  } catch (error) {
    console.error('Error updating block order:', error);
    throw error;
  }
}

export async function reorderBlocks(noteId, reorderedBlocks) {
  try {
    const batch = writeBatch(db);
    
    reorderedBlocks.forEach((block, index) => {
      const blockRef = doc(db, 'notes', noteId, 'blocks', block.id);
      batch.update(blockRef, { 
        order: index,
        updatedAt: serverTimestamp()
      });
    });
    
    // Update note's updatedAt timestamp
    const noteRef = doc(db, 'notes', noteId);
    batch.update(noteRef, { updatedAt: serverTimestamp() });
    
    await batch.commit();
  } catch (error) {
    console.error('Error reordering blocks:', error);
    throw error;
  }
}

// ===== REAL-TIME LISTENERS =====

export function subscribeToNoteBlocks(noteId, callback) {
  const blocksQuery = query(
    collection(db, 'notes', noteId, 'blocks'),
    orderBy('order')
  );
  
  return onSnapshot(blocksQuery, (snapshot) => {
    const blocks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(blocks);
  });
}

export function subscribeToUserNotes(userId, callback) {
  const notesQuery = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(notesQuery, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notes);
  });
}

// ===== UNIFIED WORKSPACE OPERATIONS =====

export async function getUserWorkspaceBlocks(userId) {
  try {
    const q = query(
      collection(db, 'workspace_blocks'),
      where('userId', '==', userId),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching workspace blocks:', error);
    throw error;
  }
}

export async function createWorkspaceBlock(userId, blockData) {
  try {
    const blockWithUser = {
      ...blockData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'workspace_blocks'), blockWithUser);
    return docRef.id;
  } catch (error) {
    console.error('Error creating workspace block:', error);
    throw error;
  }
}

export async function updateWorkspaceBlock(userId, blockId, updates) {
  try {
    const blockRef = doc(db, 'workspace_blocks', blockId);
    await updateDoc(blockRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating workspace block:', error);
    throw error;
  }
}

export async function deleteWorkspaceBlock(userId, blockId) {
  try {
    // First, delete all child blocks
    const childBlocksQuery = query(
      collection(db, 'workspace_blocks'),
      where('userId', '==', userId),
      where('parentId', '==', blockId)
    );
    const childBlocks = await getDocs(childBlocksQuery);
    
    const batch = writeBatch(db);
    
    // Delete all child blocks
    childBlocks.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete the main block
    batch.delete(doc(db, 'workspace_blocks', blockId));
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting workspace block:', error);
    throw error;
  }
}

export function subscribeToWorkspaceBlocks(userId, callback) {
  try {
    const q = query(
      collection(db, 'workspace_blocks'),
      where('userId', '==', userId),
      orderBy('order', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const blocks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(blocks);
    });
  } catch (error) {
    console.error('Error subscribing to workspace blocks:', error);
    throw error;
  }
}

// Migration function to move from old notes structure to unified workspace
export async function migrateToUnifiedWorkspace(userId) {
  try {
    // Get all existing notes
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId)
    );
    const notesSnapshot = await getDocs(notesQuery);
    
    const batch = writeBatch(db);
    let order = 0;
    
    for (const noteDoc of notesSnapshot.docs) {
      const noteData = noteDoc.data();
      
      // Create heading block for the note
      const headingBlock = {
        id: `heading-${noteDoc.id}`,
        type: 'heading',
        content: noteData.title,
        parentId: null,
        order: order++,
        collapsed: false,
        pinned: false,
        headingColor: '#4A3B2F',
        headingBold: true,
        headingItalic: false,
        headingUnderline: false,
        headingFont: '"Playfair Display", serif',
        userId,
        createdAt: noteData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const headingRef = doc(collection(db, 'workspace_blocks'));
      batch.set(headingRef, headingBlock);
      
      // Get all blocks for this note
      const blocksSnapshot = await getDocs(collection(db, 'notes', noteDoc.id, 'blocks'));
      let childOrder = 0;
      
      for (const blockDoc of blocksSnapshot.docs) {
        const blockData = blockDoc.data();
        
        const workspaceBlock = {
          ...blockData,
          parentId: headingBlock.id,
          order: childOrder++,
          userId,
          updatedAt: serverTimestamp()
        };
        
        const blockRef = doc(collection(db, 'workspace_blocks'));
        batch.set(blockRef, workspaceBlock);
      }
    }
    
    await batch.commit();
    console.log('Migration to unified workspace completed');
  } catch (error) {
    console.error('Error migrating to unified workspace:', error);
    throw error;
  }
}

// Initialize workspace for new users
export async function initializeUserWorkspace(userId) {
  try {
    // Check if user already has workspace blocks
    const existingBlocks = await getUserWorkspaceBlocks(userId);
    if (existingBlocks.length > 0) {
      return; // User already has blocks
    }

    // Create welcome note
    const welcomeBlock = {
      id: `welcome-${Date.now()}`,
      type: 'heading',
      content: 'Welcome to Proibe Notes! 🎉',
      parentId: null,
      order: 0,
      collapsed: false,
      pinned: false,
      headingColor: '#6B46C1',
      headingBold: true,
      headingItalic: false,
      headingUnderline: false,
      headingFont: '"Playfair Display", serif'
    };

    await createWorkspaceBlock(userId, welcomeBlock);

    // Create welcome content blocks
    const contentBlocks = [
      {
        id: `content-${Date.now()}-1`,
        type: 'text',
        content: '<p>This is your unified Notion-style workspace where each heading is a separate note, and all content blocks are organized underneath.</p>',
        parentId: welcomeBlock.id,
        order: 0,
        collapsed: false,
        pinned: false
      },
      {
        id: `content-${Date.now()}-2`,
        type: 'text',
        content: '<p><strong>Getting started:</strong></p><ul><li>Click on any text to edit it</li><li>Use the sidebar to navigate between notes</li><li>Add new notes using the "New Note" button</li><li>Drag blocks to reorder them</li></ul>',
        parentId: welcomeBlock.id,
        order: 1,
        collapsed: false,
        pinned: false
      }
    ];

    for (const block of contentBlocks) {
      await createWorkspaceBlock(userId, block);
    }

    console.log('User workspace initialized successfully');
  } catch (error) {
    console.error('Error initializing user workspace:', error);
    throw error;
  }
}

// ===== UTILITY FUNCTIONS =====

export function getDefaultBlockContent(type) {
  const defaults = {
    heading: 'New Heading',
    subheading: 'New Subheading',
    text: '<p>Start typing...</p>',
    image: { url: '', alt: '', caption: '' },
    table: { rows: 3, cols: 3, data: [] },
    banner: { text: 'Banner text', style: 'info' },
    icon: { name: 'star', size: 24 }
  };
  
  return defaults[type] || '';
}

export function convertSectionsToBlocks(sections) {
  return sections.map((section, index) => ({
    id: section.id,
    type: section.type,
    content: section.content,
    parentId: section.parent,
    order: section.order !== undefined ? section.order : index,
    metadata: {
      collapsed: section.collapsed,
      pinned: section.pinned,
      headingColor: section.headingColor,
      headingBold: section.headingBold,
      headingItalic: section.headingItalic,
      headingUnderline: section.headingUnderline,
      headingFont: section.headingFont
    }
  }));
}

export function convertBlocksToSections(blocks) {
  return blocks.map(block => ({
    id: block.id,
    type: block.type,
    content: block.content,
    parent: block.parentId,
    order: block.order,
    collapsed: block.metadata?.collapsed || false,
    pinned: block.metadata?.pinned || false,
    headingColor: block.metadata?.headingColor || '#4A3B2F',
    headingBold: block.metadata?.headingBold || true,
    headingItalic: block.metadata?.headingItalic || false,
    headingUnderline: block.metadata?.headingUnderline || false,
    headingFont: block.metadata?.headingFont || '"Playfair Display", serif'
  }));
}
