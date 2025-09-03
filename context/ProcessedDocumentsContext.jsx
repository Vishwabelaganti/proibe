import React, { createContext, useContext, useState, useEffect } from 'react';

const ProcessedDocumentsContext = createContext();

export function useProcessedDocuments() {
  const context = useContext(ProcessedDocumentsContext);
  if (!context) {
    throw new Error('useProcessedDocuments must be used within a ProcessedDocumentsProvider');
  }
  return context;
}

export function ProcessedDocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([]);

  // Load documents from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('proibe-processed-documents');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setDocuments(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to load processed documents from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever documents change
  useEffect(() => {
    if (typeof window !== 'undefined' && documents.length >= 0) {
      try {
        localStorage.setItem('proibe-processed-documents', JSON.stringify(documents));
      } catch (error) {
        console.error('Failed to save processed documents to localStorage:', error);
      }
    }
  }, [documents]);

  const addDocument = (document) => {
    const documentWithTimestamp = {
      ...document,
      id: document.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDocuments(prev => [documentWithTimestamp, ...prev]);
    return documentWithTimestamp;
  };

  const updateDocument = (id, updates) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
        : doc
    ));
  };

  const deleteDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const clearAllDocuments = () => {
    setDocuments([]);
  };

  const getDocument = (id) => {
    return documents.find(doc => doc.id === id);
  };

  const searchDocuments = (query) => {
    if (!query) return documents;
    
    const searchTerm = query.toLowerCase();
    return documents.filter(doc => 
      doc.title?.toLowerCase().includes(searchTerm) ||
      doc.content?.toLowerCase().includes(searchTerm) ||
      doc.type?.toLowerCase().includes(searchTerm)
    );
  };

  const value = {
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
    clearAllDocuments,
    getDocument,
    searchDocuments
  };

  return (
    <ProcessedDocumentsContext.Provider value={value}>
      {children}
    </ProcessedDocumentsContext.Provider>
  );
}
