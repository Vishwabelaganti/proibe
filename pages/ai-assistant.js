import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';
import { useAISummaries } from '../context/AISummariesContext';
import { useProcessedDocuments } from '../context/ProcessedDocumentsContext';
import { useFlashcards } from '../context/FlashcardsContext';
import { useDocumentProcessor } from '../hooks/ai/useDocumentProcessor';
import { 
  Brain, 
  FileText, 
  Upload, 
  Sparkles, 
  BookOpen,
  ArrowLeft,
  FileDown,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import components that use browser APIs
const FileUploader = dynamic(() => import('../components/ai/FileUploader'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-earth-600">Loading file uploader...</div>
});

const DocumentProcessor = dynamic(() => import('../components/ai/DocumentProcessor'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-earth-600">Loading document processor...</div>
});

const SummaryGenerator = dynamic(() => import('../components/ai/SummaryGenerator'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-earth-600">Loading summary generator...</div>
});

const FlashcardCreator = dynamic(() => import('../components/ai/FlashcardCreator'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-earth-600">Loading flashcard creator...</div>
});

const ProcessingTabs = dynamic(() => import('../components/ai/ProcessingTabs'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-earth-600">Loading tabs...</div>
});

const SavedSummaries = dynamic(() => import('../components/ai/SavedSummaries'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-earth-600">Loading saved summaries...</div>
});

const SavedDocuments = dynamic(() => import('../components/ai/SavedDocuments'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-earth-600">Loading saved documents...</div>
});

const SavedFlashcards = dynamic(() => import('../components/ai/SavedFlashcards'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-earth-600">Loading saved flashcards...</div>
});

const NotesPrintView = dynamic(() => import('../components/NotesPrintView'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-earth-600">Loading notes view...</div>
});

export default function AIAssistant() {
  const [mounted, setMounted] = useState(false);
  const { sections } = useNotes();
  const { addSummary } = useAISummaries();
  const { addDocument: saveProcessedDocument } = useProcessedDocuments();
  const { addFlashcardSet } = useFlashcards();
  const [selectedSections, setSelectedSections] = useState([]);
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [savedContentTab, setSavedContentTab] = useState('summaries'); // New state for saved content tabs
  const {
    documents,
    currentDocument,
    status,
    processFile,
    processHandwrittenImage,
    generateSummary,
    generateFlashcards,
    processCurrentNotes,
    clearDocuments,
    deleteDocument,
    selectDocument,
    updateStatus
  } = useDocumentProcessor();

  const [activeTab, setActiveTab] = useState('upload');

  // Find root section for PDF generation
  const rootSection = sections.find(section => section.parent === null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle section selection
  const toggleSectionSelection = (sectionId) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedSections([]);
    } else {
      setSelectedSections(selectableSections.map(section => section.id));
    }
    setSelectAll(!selectAll);
  };

  // Get sections to process (selected ones and their children, or all if none selected)
  const getSectionsToProcess = () => {
    if (selectedSections.length === 0) {
      return sections; // If nothing selected, use all sections
    }
    
    // Get selected sections and all their children recursively
    const sectionsToInclude = new Set();
    
    const addSectionAndChildren = (sectionId) => {
      sectionsToInclude.add(sectionId);
      // Find all children of this section
      const children = sections.filter(s => s.parent === sectionId);
      children.forEach(child => addSectionAndChildren(child.id));
    };
    
    // Add each selected section and all its children
    selectedSections.forEach(sectionId => {
      addSectionAndChildren(sectionId);
    });
    
    return sections.filter(section => sectionsToInclude.has(section.id));
  };  // Filter sections to only show top-level elements (folders and root headings)
  const selectableSections = sections.filter(section => 
    section.parent === null && (section.type === 'heading' || section.type === 'folder')
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-earth-50 to-peach-50 flex items-center justify-center">
        <div className="text-center">
          <Brain size={48} className="mx-auto text-accent/50 mb-4 animate-pulse" />
          <p className="text-earth-600">Loading AI Assistant...</p>
        </div>
      </div>
    );
  }

  const processCurrentNotesAsPDF = async () => {
    try {
      console.log('Processing current notes...');
      updateStatus('processing', 30, 'Processing selected notes...');
      
      const sectionsToProcess = getSectionsToProcess();
      
      if (!sectionsToProcess || sectionsToProcess.length === 0) {
        throw new Error('No notes available to process');
      }

      console.log('Found sections to process:', sectionsToProcess.length);
      
      // Use the existing processCurrentNotes function which handles document creation
      const document = await processCurrentNotes(sectionsToProcess);
      
      if (document) {
        // Automatically save the processed document
        const savedDocument = saveProcessedDocument({
          ...document,
          sourceType: 'notes',
          selectedSectionsCount: selectedSections.length,
          totalSectionsProcessed: sectionsToProcess.length,
          selectionType: selectedSections.length === 0 ? 'all' : 'selective'
        });
        
        console.log('Document automatically saved:', savedDocument.id);
        
        setActiveTab('summary');
        console.log('Notes processed successfully!');
        return document;
      } else {
        throw new Error('Failed to process notes');
      }
      
    } catch (error) {
      console.error('Failed to process notes:', error);
      updateStatus('error', 0, 'Notes processing failed', error.message);
    }
  };

  // Enhanced generateSummary function that saves to localStorage
  const handleGenerateSummary = async (document, options) => {
    try {
      const summary = await generateSummary(document, options);
      
      // Save the summary locally
      const summaryData = {
        title: `Summary: ${document.title}`,
        content: summary,
        sourceType: 'notes',
        sourceData: {
          selectedSections: selectedSections.length > 0 ? selectedSections : 'all',
          sectionsCount: getSectionsToProcess().length,
          documentId: document.id
        },
        options: options,
        tags: ['ai-generated', 'summary']
      };
      
      const savedSummary = addSummary(summaryData);
      console.log('Summary saved locally:', savedSummary.id);
      
      return summary;
    } catch (error) {
      console.error('Failed to generate and save summary:', error);
      throw error;
    }
  };

  // Enhanced generateFlashcards function that saves to localStorage
  const handleGenerateFlashcards = async (document, options) => {
    try {
      const flashcards = await generateFlashcards(document, options);
      
      // Save the flashcard set locally
      const flashcardSetData = {
        title: `Flashcards: ${document.title}`,
        flashcards: flashcards,
        sourceDocument: {
          id: document.id,
          title: document.title,
          type: document.type
        },
        sourceType: document.sourceType || 'document',
        options: options,
        tags: ['ai-generated', 'flashcards', document.type]
      };
      
      const savedFlashcardSet = addFlashcardSet(flashcardSetData);
      console.log('Flashcard set saved locally:', savedFlashcardSet.id);
      
      return flashcards;
    } catch (error) {
      console.error('Failed to generate and save flashcards:', error);
      throw error;
    }
  };

  // Extract clean content from notes sections (similar to NotesPrintView logic)
  const extractNotesContentForAI = (sections) => {
    if (!sections || sections.length === 0) return '';
    
    let content = '';
    
    // Get child sections function (same as used in NotesPrintView)
    const getChildSections = (parentId) => {
      return sections.filter(s => s.parent === parentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    };
    
    // Process sections hierarchically
    const processSection = (section, level = 1) => {
      if (!section) return '';
      
      let sectionContent = '';
      const children = getChildSections(section.id);
      
      // Clean the section content
      const cleanText = stripHtmlContent(section.content || '');
      
      if (!cleanText.trim()) return '';
      
      switch (section.type) {
        case 'heading':
          sectionContent += `${'#'.repeat(Math.min(level, 6))} ${cleanText}

`;
          break;
        case 'subheading':
          sectionContent += `${'#'.repeat(Math.min(level + 1, 6))} ${cleanText}

`;
          break;
        case 'table':
          if (section.content && section.content.rows) {
            sectionContent += processTableContent(section.content);
          }
          break;
        case 'text':
        default:
          sectionContent += `${cleanText}

`;
          break;
      }
      
      // Process children
      if (children && children.length > 0) {
        children.forEach(child => {
          sectionContent += processSection(child, level + 1);
        });
      }
      
      return sectionContent;
    };
    
    // Find root sections (sections without parent)
    const rootSections = sections.filter(s => !s.parent)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Process all root sections
    rootSections.forEach(section => {
      content += processSection(section, 1);
    });
    
    return content.trim();
  };

  // Process table content into clean text format
  const processTableContent = (tableData) => {
    if (!tableData.rows || tableData.rows.length === 0) return '';
    
    let tableText = '\n';
    const headerRows = tableData.headerRows || (tableData.hasHeader ? [0] : []);
    
    tableData.rows.forEach((row, rowIndex) => {
      if (row && row.length > 0) {
        const cleanCells = row.map(cell => stripHtmlContent(cell || '').trim()).filter(cell => cell);
        if (cleanCells.length > 0) {
          if (headerRows.includes(rowIndex)) {
            tableText += `**${cleanCells.join(' | ')}**\n`;
            tableText += `${cleanCells.map(() => '---').join(' | ')}\n`;
          } else {
            tableText += `${cleanCells.join(' | ')}\n`;
          }
        }
      }
    });
    
    return tableText + '\n';
  };

  // Simple HTML stripping function
  const stripHtmlContent = (html) => {
    if (!html || typeof html !== 'string') return '';
    
    return html
      .replace(/<br[^>]*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n+/g, '\n\n')
      .trim();
  };

  const handleFileUpload = async (files) => {
    for (const file of files) {
      try {
        if (file.type.startsWith('image/')) {
          const document = await processHandwrittenImage(file);
          // Auto-save uploaded image document
          if (document) {
            saveProcessedDocument({
              ...document,
              sourceType: 'upload',
              fileType: 'image'
            });
          }
        } else {
          const document = await processFile(file);
          // Auto-save uploaded file document
          if (document) {
            saveProcessedDocument({
              ...document,
              sourceType: 'upload',
              fileType: file.type
            });
          }
        }
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
      }
    }
    if (files.length > 0) {
      setActiveTab('summary');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 to-peach-50">
      {/* Header */}
      <div className="bg-white border-b border-earth-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/app" className="flex items-center text-earth-600 hover:text-earth-800 transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Back to Notes
              </Link>
              <div className="h-6 w-px bg-earth-300"></div>
              <div className="flex items-center space-x-3">
                <Brain size={28} className="text-accent" />
                <div>
                  <h1 className="text-xl font-bold text-earth-800">AI Assistant</h1>
                  <p className="text-sm text-earth-600">Summarize & Create Flashcards</p>
                </div>
              </div>
            </div>
            
            {documents.length > 0 && (
              <button
                onClick={clearDocuments}
                className="px-4 py-2 text-sm text-earth-600 hover:text-earth-800 border border-earth-200 rounded-md hover:bg-earth-50 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Input Options */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-earth-200 p-6">
              <h2 className="text-lg font-semibold text-earth-800 mb-6 flex items-center">
                <Upload size={20} className="mr-2 text-accent" />
                Input Options
              </h2>

              {/* Process Current Notes with Section Selection */}
              <div className="mb-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-purple-800">Select Main Sections to Process</h3>
                    <button
                      onClick={() => setShowSectionSelector(!showSectionSelector)}
                      className="text-purple-600 hover:text-purple-800 flex items-center text-sm"
                    >
                      {showSectionSelector ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      {selectedSections.length > 0 ? `${selectedSections.length} main sections selected` : 'Select main sections'}
                    </button>
                  </div>
                  
                  {showSectionSelector && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      <div className="flex items-center mb-2 pb-2 border-b border-purple-200">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center text-sm text-purple-700 hover:text-purple-900"
                        >
                          {selectAll ? <CheckSquare size={16} className="mr-2" /> : <Square size={16} className="mr-2" />}
                          Select All ({selectableSections.length} main sections)
                        </button>
                      </div>
                      {selectableSections.length === 0 ? (
                        <div className="text-sm text-purple-600 text-center py-4">
                          No main sections found. Create some folders or main headings in your notes to organize your content.
                        </div>
                      ) : (
                        selectableSections.map((section) => {
                          // Safe content extraction that handles different content types
                          const getDisplayContent = (content) => {
                            if (typeof content === 'string') {
                              return content.replace(/<[^>]*>/g, '');
                            } else if (content && typeof content === 'object') {
                              // For table or other complex content, show a summary
                              return content.type || 'Complex content';
                            }
                            return '';
                          };
                          
                          const displayContent = getDisplayContent(section.content);
                          const truncatedContent = displayContent.substring(0, 50) || 'Untitled';
                          
                          return (
                            <div key={section.id} className="flex items-start space-x-2">
                              <button
                                onClick={() => toggleSectionSelection(section.id)}
                                className="mt-1 flex-shrink-0"
                              >
                                {selectedSections.includes(section.id) ? 
                                  <CheckSquare size={16} className="text-purple-600" /> : 
                                  <Square size={16} className="text-purple-400" />
                                }
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-purple-800 truncate">
                                  {section.type === 'heading' ? '📝 ' : section.type === 'folder' ? '📁 ' : '📋 '}
                                  {truncatedContent}
                                  {displayContent.length > 50 ? '...' : ''}
                                </div>
                                <div className="text-xs text-purple-600">
                                  {section.type} • {displayContent.length || 0} chars
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-purple-600 mt-2">
                    {selectedSections.length === 0 ? 
                      `All content will be processed (${selectableSections.length} main sections available for selection)` : 
                      `${selectedSections.length} of ${selectableSections.length} main sections selected`
                    }
                  </div>
                </div>

                <button
                  onClick={processCurrentNotesAsPDF}
                  disabled={sections.length === 0 || status.stage === 'processing'}
                  className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-center">
                    <FileDown size={32} className="mx-auto text-purple-600 mb-2" />
                    <p className="font-medium text-earth-800">Process Selected Notes</p>
                    <p className="text-sm text-earth-600 mt-1">
                      {selectedSections.length === 0 ? 
                        `Process all content (${selectableSections.length} main sections available)` : 
                        `Process ${selectedSections.length} selected main sections`}
                    </p>
                  </div>
                </button>
              </div>

              {/* File Upload */}
              <div className="border-t border-earth-200 pt-6">
                <h3 className="text-md font-medium text-earth-700 mb-3">Upload Documents</h3>
                <FileUploader
                  onFileUpload={handleFileUpload}
                  disabled={status.stage === 'processing'}
                />
              </div>

              {/* Processing Status */}
              {status.stage !== 'idle' && (
                <div className="mt-6 p-4 bg-earth-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-earth-700">{status.message}</span>
                    <span className="text-sm text-earth-600">{status.progress}%</span>
                  </div>
                  <div className="w-full bg-earth-200 rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${status.progress}%` }}
                    ></div>
                  </div>
                  {status.error && (
                    <p className="text-sm text-red-600 mt-2">{status.error}</p>
                  )}
                </div>
              )}

              {/* Document List */}
              {documents.length > 0 && (
                <div className="mt-6 border-t border-earth-200 pt-6">
                  <h3 className="text-md font-medium text-earth-700 mb-3">Processed Documents</h3>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          currentDocument?.id === doc.id
                            ? 'border-accent bg-accent/5'
                            : 'border-earth-200 hover:border-accent/50'
                        }`}
                        onClick={() => selectDocument(doc)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-earth-800 truncate">{doc.title}</p>
                            <p className="text-sm text-earth-600 capitalize">{doc.type}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id);
                            }}
                            className="text-earth-400 hover:text-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Processing & Results */}
          <div className="lg:col-span-2">
            {currentDocument ? (
              <div className="bg-white rounded-xl shadow-sm border border-earth-200">
                {/* Document Header */}
                <div className="p-6 border-b border-earth-200">
                  <h2 className="text-xl font-semibold text-earth-800">{currentDocument.title}</h2>
                  <p className="text-sm text-earth-600 mt-1">
                    {currentDocument.type.charAt(0).toUpperCase() + currentDocument.type.slice(1)} • 
                    {currentDocument.content.length} characters
                  </p>
                </div>

                {/* Tabs */}
                <ProcessingTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  document={currentDocument}
                />

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'content' && (
                    <DocumentProcessor document={currentDocument} />
                  )}
                  {activeTab === 'summary' && (
                    <SummaryGenerator
                      document={currentDocument}
                      onGenerateSummary={handleGenerateSummary}
                      disabled={status.stage === 'generating'}
                    />
                  )}
                  {activeTab === 'flashcards' && (
                    <FlashcardCreator
                      document={currentDocument}
                      onGenerateFlashcards={handleGenerateFlashcards}
                      disabled={status.stage === 'generating'}
                    />
                  )}
                  {activeTab === 'saved' && (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-earth-800 mb-2">Your Saved Content</h3>
                        <p className="text-sm text-earth-600">
                          All your AI-generated summaries, processed documents, and flashcards are automatically saved here
                        </p>
                      </div>
                      
                      {/* Tabs for saved content */}
                      <div className="flex space-x-1 mb-6">
                        <button
                          onClick={() => setSavedContentTab('summaries')}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            savedContentTab === 'summaries'
                              ? 'bg-accent text-white'
                              : 'text-earth-600 hover:bg-earth-100'
                          }`}
                        >
                          AI Summaries
                        </button>
                        <button
                          onClick={() => setSavedContentTab('documents')}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            savedContentTab === 'documents'
                              ? 'bg-accent text-white'
                              : 'text-earth-600 hover:bg-earth-100'
                          }`}
                        >
                          Processed Documents
                        </button>
                        <button
                          onClick={() => setSavedContentTab('flashcards')}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            savedContentTab === 'flashcards'
                              ? 'bg-accent text-white'
                              : 'text-earth-600 hover:bg-earth-100'
                          }`}
                        >
                          Flashcard Sets
                        </button>
                      </div>
                      
                      {/* Saved content display */}
                      <div>
                        {savedContentTab === 'summaries' && <SavedSummaries />}
                        {savedContentTab === 'documents' && <SavedDocuments />}
                        {savedContentTab === 'flashcards' && <SavedFlashcards />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Saved Content when no document is selected */
              <div className="bg-white rounded-xl shadow-sm border border-earth-200">
                <div className="p-6 border-b border-earth-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-earth-800">Your Saved Content</h2>
                      <p className="text-sm text-earth-600 mt-1">
                        All your processed documents and generated summaries are automatically saved here
                      </p>
                    </div>
                    <div className="text-sm text-earth-500">
                      Process notes or upload documents to see content here
                    </div>
                  </div>
                  
                  {/* Tabs for saved content */}
                  <div className="flex space-x-1 mt-4">
                    <button
                      onClick={() => setSavedContentTab('summaries')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        savedContentTab === 'summaries'
                          ? 'bg-accent text-white'
                          : 'text-earth-600 hover:bg-earth-100'
                      }`}
                    >
                      AI Summaries
                    </button>
                    <button
                      onClick={() => setSavedContentTab('documents')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        savedContentTab === 'documents'
                          ? 'bg-accent text-white'
                          : 'text-earth-600 hover:bg-earth-100'
                      }`}
                    >
                      Processed Documents
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {savedContentTab === 'summaries' ? <SavedSummaries /> : <SavedDocuments />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden print view for PDF export only (off-screen, but visible to html2canvas) */}
      {mounted && rootSection && (
        <div style={{ position: 'absolute', left: '-200vw', top: 0, width: '900px', minHeight: '100px', pointerEvents: 'none', zIndex: -1, opacity: 1 }}>
          <div id="pdf-print-view">
            <NotesPrintView rootId={rootSection.id} />
          </div>
        </div>
      )}
    </div>
  );
}
