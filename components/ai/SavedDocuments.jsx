import React, { useState } from 'react';
import { useProcessedDocuments } from '../../context/ProcessedDocumentsContext';
import { useAISummaries } from '../../context/AISummariesContext';
import { useFlashcards } from '../../context/FlashcardsContext';
import { useDocumentProcessor } from '../../hooks/ai/useDocumentProcessor';
import { 
  FileText, 
  Search, 
  Trash2, 
  Download, 
  Copy, 
  ChevronDown, 
  ChevronRight,
  Calendar,
  Upload,
  FileImage,
  File,
  Sparkles,
  Brain,
  Loader
} from 'lucide-react';

export default function SavedDocuments() {
  const { documents, deleteDocument, searchDocuments } = useProcessedDocuments();
  const { addSummary } = useAISummaries();
  const { addFlashcardSet } = useFlashcards();
  const { generateSummary, generateFlashcards } = useDocumentProcessor();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDocument, setExpandedDocument] = useState(null);
  const [generatingContent, setGeneratingContent] = useState({});

  const filteredDocuments = searchDocuments(searchQuery);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentIcon = (document) => {
    if (document.sourceType === 'upload') {
      return document.fileType?.startsWith('image/') ? FileImage : File;
    }
    return FileText;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const exportDocument = (document) => {
    const dataStr = JSON.stringify(document, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `${document.title || 'document'}.json`);
      linkElement.click();
    }
  };

  // Generate AI summary from saved document
  const generateSummaryFromDocument = async (document) => {
    const loadingKey = `summary-${document.id}`;
    setGeneratingContent(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // Use the existing document processor hook with proper parameters
      const summary = await generateSummary(document, {
        length: 'medium',
        style: 'paragraph',
        focus: 'key-concepts'
      });
      
      if (summary) {
        // Save the summary
        const summaryData = {
          title: `Summary: ${document.title}`,
          content: summary,
          sourceDocument: {
            id: document.id,
            title: document.title,
            type: document.type
          },
          sourceType: document.sourceType || 'document',
          options: { length: 'medium', style: 'professional' },
          tags: ['ai-generated', 'summary', 'from-saved-document']
        };
        
        const savedSummary = addSummary(summaryData);
        console.log('Summary generated and saved:', savedSummary.id);
        alert('Summary generated and saved successfully!');
      }
      
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setGeneratingContent(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Generate flashcards from saved document
  const generateFlashcardsFromDocument = async (document) => {
    const loadingKey = `flashcards-${document.id}`;
    setGeneratingContent(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // Use the existing document processor hook with proper parameters
      const flashcards = await generateFlashcards(document, {
        count: 10,
        difficulty: 'medium',
        includeDefinitions: true,
        includeConcepts: true,
        includeFactuals: true,
        categories: []
      });
      
      if (flashcards && flashcards.length > 0) {
        // Save the flashcard set
        const flashcardSetData = {
          title: `Flashcards: ${document.title}`,
          flashcards: flashcards, // Keep as 'flashcards' to match SavedFlashcards.jsx structure
          sourceDocument: {
            id: document.id,
            title: document.title,
            type: document.type
          },
          sourceType: document.sourceType || 'document',
          options: { count: 10, difficulty: 'medium' },
          tags: ['ai-generated', 'flashcards', 'from-saved-document']
        };
        
        const savedFlashcardSet = addFlashcardSet(flashcardSetData);
        console.log('Flashcards generated and saved:', savedFlashcardSet.id);
        alert('Flashcards generated and saved successfully!');
      }
      
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
      alert('Failed to generate flashcards. Please try again.');
    } finally {
      setGeneratingContent(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-earth-300 mb-4" />
        <h3 className="text-lg font-medium text-earth-700 mb-2">No Processed Documents</h3>
        <p className="text-earth-500 max-w-md mx-auto">
          Upload files or process your notes to see them saved here automatically.
        </p>
      </div>
    );
  }

  if (filteredDocuments.length === 0) {
    return (
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-earth-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
        
        <div className="text-center py-8">
          <Search size={48} className="mx-auto text-earth-300 mb-4" />
          <p className="text-earth-500">No documents found matching "{searchQuery}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400" />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-earth-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      {/* Document List */}
      <div className="space-y-4">
        {filteredDocuments.map((document) => {
          const Icon = getDocumentIcon(document);
          const isExpanded = expandedDocument === document.id;
          
          return (
            <div key={document.id} className="bg-white border border-earth-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <Icon size={20} className="text-accent mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-earth-800 truncate">{document.title}</h3>
                      <div className="flex items-center text-sm text-earth-600 mt-1 space-x-4">
                        <span className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{formatDate(document.createdAt)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Upload size={14} />
                          <span className="capitalize">{document.sourceType || 'unknown'}</span>
                        </span>
                        <span>{Math.round(document.content.length / 100)} chars (100s)</span>
                      </div>
                      <p className="text-earth-600 mt-2 line-clamp-2">
                        {document.content.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-4">
                    <button
                      onClick={() => generateSummaryFromDocument(document)}
                      disabled={generatingContent[`summary-${document.id}`]}
                      className="flex items-center gap-1 px-2 py-1 bg-accent text-white hover:bg-accent-dark rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Generate AI summary"
                    >
                      {generatingContent[`summary-${document.id}`] ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      Summary
                    </button>
                    <button
                      onClick={() => generateFlashcardsFromDocument(document)}
                      disabled={generatingContent[`flashcards-${document.id}`]}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white hover:bg-purple-700 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Generate flashcards"
                    >
                      {generatingContent[`flashcards-${document.id}`] ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <Brain size={14} />
                      )}
                      Cards
                    </button>
                    <button
                      onClick={() => setExpandedDocument(isExpanded ? null : document.id)}
                      className="p-1 hover:bg-earth-100 rounded"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(document.content)}
                      className="p-1 hover:bg-earth-100 rounded text-earth-600"
                      title="Copy content"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => exportDocument(document)}
                      className="p-1 hover:bg-earth-100 rounded text-earth-600"
                      title="Export document"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => deleteDocument(document.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                      title="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-earth-200 p-4 bg-earth-50">
                  <h4 className="font-medium text-earth-800 mb-2">Full Content</h4>
                  <div className="max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-earth-700 font-sans">
                      {document.content}
                    </pre>
                  </div>
                  
                  {/* Document metadata */}
                  {document.metadata && (
                    <div className="mt-4 pt-4 border-t border-earth-200">
                      <h5 className="font-medium text-earth-800 mb-2">Metadata</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(document.metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium text-earth-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                            <span className="text-earth-600">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
