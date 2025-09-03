// context/AISummariesContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AISummariesContext = createContext();

export function useAISummaries() {
  const context = useContext(AISummariesContext);
  if (!context) {
    throw new Error('useAISummaries must be used within an AISummariesProvider');
  }
  return context;
}

export function AISummariesProvider({ children }) {
  // Initialize summaries from localStorage
  const [summaries, setSummaries] = useState(() => {
    try {
      const saved = localStorage.getItem('proibe-ai-summaries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load summaries from localStorage:', error);
    }
    return [];
  });

  // Save to localStorage whenever summaries change
  const saveToLocalStorage = useCallback((summariesData) => {
    try {
      localStorage.setItem('proibe-ai-summaries', JSON.stringify(summariesData));
    } catch (error) {
      console.error('Failed to save summaries to localStorage:', error);
    }
  }, []);

  // Auto-save when summaries change
  useEffect(() => {
    saveToLocalStorage(summaries);
  }, [summaries, saveToLocalStorage]);

  // Add a new summary
  const addSummary = useCallback((summaryData) => {
    const newSummary = {
      id: `summary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: summaryData.title || 'Untitled Summary',
      content: summaryData.content,
      sourceType: summaryData.sourceType || 'notes', // 'notes', 'document', 'file'
      sourceData: summaryData.sourceData || null, // sections, document info, etc.
      options: summaryData.options || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: summaryData.tags || [],
      wordCount: summaryData.content ? summaryData.content.trim().split(/\s+/).length : 0
    };

    setSummaries(prev => [newSummary, ...prev]);
    return newSummary;
  }, []);

  // Update an existing summary
  const updateSummary = useCallback((id, updates) => {
    setSummaries(prev => prev.map(summary => 
      summary.id === id 
        ? { 
            ...summary, 
            ...updates, 
            updatedAt: new Date().toISOString(),
            wordCount: updates.content ? updates.content.trim().split(/\s+/).length : summary.wordCount
          }
        : summary
    ));
  }, []);

  // Delete a summary
  const deleteSummary = useCallback((id) => {
    setSummaries(prev => prev.filter(summary => summary.id !== id));
  }, []);

  // Get summaries by source type
  const getSummariesByType = useCallback((sourceType) => {
    return summaries.filter(summary => summary.sourceType === sourceType);
  }, [summaries]);

  // Search summaries
  const searchSummaries = useCallback((query) => {
    if (!query.trim()) return summaries;
    
    const lowercaseQuery = query.toLowerCase();
    return summaries.filter(summary => 
      summary.title.toLowerCase().includes(lowercaseQuery) ||
      summary.content.toLowerCase().includes(lowercaseQuery) ||
      summary.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [summaries]);

  // Clear all summaries
  const clearAllSummaries = useCallback(() => {
    setSummaries([]);
  }, []);

  // Export summaries
  const exportSummaries = useCallback(() => {
    const exportData = {
      summaries,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `proibe-ai-summaries-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [summaries]);

  const value = {
    summaries,
    addSummary,
    updateSummary,
    deleteSummary,
    getSummariesByType,
    searchSummaries,
    clearAllSummaries,
    exportSummaries
  };

  return (
    <AISummariesContext.Provider value={value}>
      {children}
    </AISummariesContext.Provider>
  );
}
