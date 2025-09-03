import React, { createContext, useContext, useState, useEffect } from 'react';

const FlashcardsContext = createContext();

export function useFlashcards() {
  const context = useContext(FlashcardsContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardsProvider');
  }
  return context;
}

export function FlashcardsProvider({ children }) {
  const [flashcardSets, setFlashcardSets] = useState([]);

  // Load flashcard sets from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('proibe-flashcard-sets');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setFlashcardSets(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to load flashcard sets from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever flashcard sets change
  useEffect(() => {
    if (typeof window !== 'undefined' && flashcardSets.length >= 0) {
      try {
        localStorage.setItem('proibe-flashcard-sets', JSON.stringify(flashcardSets));
      } catch (error) {
        console.error('Failed to save flashcard sets to localStorage:', error);
      }
    }
  }, [flashcardSets]);

  const addFlashcardSet = (flashcardData) => {
    const flashcardSet = {
      id: flashcardData.id || `flashcards-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: flashcardData.title || 'Untitled Flashcard Set',
      flashcards: flashcardData.flashcards || [],
      sourceDocument: flashcardData.sourceDocument || null,
      sourceType: flashcardData.sourceType || 'unknown',
      options: flashcardData.options || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: flashcardData.tags || ['flashcards', 'ai-generated']
    };

    setFlashcardSets(prev => [flashcardSet, ...prev]);
    return flashcardSet;
  };

  const updateFlashcardSet = (id, updates) => {
    setFlashcardSets(prev => prev.map(set => 
      set.id === id 
        ? { ...set, ...updates, updatedAt: new Date().toISOString() }
        : set
    ));
  };

  const deleteFlashcardSet = (id) => {
    setFlashcardSets(prev => prev.filter(set => set.id !== id));
  };

  const clearAllFlashcardSets = () => {
    setFlashcardSets([]);
  };

  const getFlashcardSet = (id) => {
    return flashcardSets.find(set => set.id === id);
  };

  const searchFlashcardSets = (query) => {
    if (!query) return flashcardSets;
    
    const searchTerm = query.toLowerCase();
    return flashcardSets.filter(set => 
      set.title?.toLowerCase().includes(searchTerm) ||
      set.flashcards?.some(card => 
        card.front?.toLowerCase().includes(searchTerm) ||
        card.back?.toLowerCase().includes(searchTerm) ||
        card.question?.toLowerCase().includes(searchTerm) ||
        card.answer?.toLowerCase().includes(searchTerm)
      ) ||
      set.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  };

  const exportFlashcardSet = (id) => {
    const flashcardSet = getFlashcardSet(id);
    if (!flashcardSet) return null;

    const exportData = {
      ...flashcardSet,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return exportData;
  };

  const value = {
    flashcardSets,
    addFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    clearAllFlashcardSets,
    getFlashcardSet,
    searchFlashcardSets,
    exportFlashcardSet
  };

  return (
    <FlashcardsContext.Provider value={value}>
      {children}
    </FlashcardsContext.Provider>
  );
}
