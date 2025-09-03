import { useState, useCallback } from 'react';
import { ProcessedDocument, SummaryOptions, FlashcardOptions, Flashcard, ProcessingStatus, OCRResult } from '../../types/ai';
import { GeminiProcessor } from '../../utils/ai/geminiProcessor';
import { OCRProcessor } from '../../utils/ai/ocrProcessor';
import { DocumentProcessor } from '../../utils/ai/documentProcessor';

export const useDocumentProcessor = () => {
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [status, setStatus] = useState({
    stage: 'idle',
    progress: 0,
    message: 'Ready to process documents'
  });

  const geminiProcessor = new GeminiProcessor();
  const ocrProcessor = new OCRProcessor();
  const documentProcessor = new DocumentProcessor();

  const updateStatus = useCallback((stage, progress, message, error) => {
    setStatus({ stage, progress, message, error });
  }, []);

  const processFile = useCallback(async (file) => {
    try {
      updateStatus('uploading', 10, 'Uploading file...');
      
      let document;
      
      if (file.type.startsWith('image/')) {
        updateStatus('ocr', 30, 'Processing image with OCR...');
        const ocrResult = await ocrProcessor.processImage(file);
        
        document = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          content: ocrResult.text,
          type: 'image',
          timestamp: new Date(),
          originalFile: file
        };
      } else {
        updateStatus('processing', 30, 'Extracting content...');
        document = await documentProcessor.processFile(file);
      }

      updateStatus('complete', 100, 'Document processed successfully');
      
      setDocuments(prev => [...prev, document]);
      setCurrentDocument(document);
      
      return document;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Processing failed';
      updateStatus('error', 0, 'Processing failed', errorMessage);
      throw error;
    }
  }, [updateStatus, ocrProcessor, documentProcessor]);

  const processHandwrittenImage = useCallback(async (file) => {
    try {
      updateStatus('ocr', 20, 'Processing handwritten notes...');
      
      const ocrResult = await ocrProcessor.processHandwrittenImage(file);
      
      const document = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: file.name.replace(/\.[^/.]+$/, '') + ' (Handwritten)',
        content: ocrResult.text,
        type: 'handwritten',
        timestamp: new Date(),
        originalFile: file
      };

      updateStatus('complete', 100, 'Handwritten notes processed successfully');
      
      setDocuments(prev => [...prev, document]);
      setCurrentDocument(document);
      
      return document;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Handwriting processing failed';
      updateStatus('error', 0, 'Handwriting processing failed', errorMessage);
      throw error;
    }
  }, [updateStatus, ocrProcessor]);

  const generateSummary = useCallback(async (document, options) => {
    try {
      updateStatus('generating', 50, 'Generating summary...');
      
      if (!document.content.trim()) {
        throw new Error('Document has no content to summarize');
      }

      const summary = await geminiProcessor.generateSummary(document.content, options);
      
      // Update document with summary
      const updatedDocument = { ...document, summary };
      setDocuments(prev => prev.map(doc => doc.id === document.id ? updatedDocument : doc));
      
      if (currentDocument?.id === document.id) {
        setCurrentDocument(updatedDocument);
      }

      updateStatus('complete', 100, 'Summary generated successfully');
      return summary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Summary generation failed';
      updateStatus('error', 0, 'Summary generation failed', errorMessage);
      throw error;
    }
  }, [updateStatus, geminiProcessor, currentDocument]);

  const generateFlashcards = useCallback(async (document, options) => {
    try {
      updateStatus('generating', 50, 'Creating flashcards...');
      
      if (!document.content.trim()) {
        throw new Error('Document has no content for flashcards');
      }

      const flashcards = await geminiProcessor.generateFlashcards(document.content, options);
      
      // Update document with flashcards
      const updatedDocument = { ...document, flashcards };
      setDocuments(prev => prev.map(doc => doc.id === document.id ? updatedDocument : doc));
      
      if (currentDocument?.id === document.id) {
        setCurrentDocument(updatedDocument);
      }

      updateStatus('complete', 100, 'Flashcards created successfully');
      return flashcards;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Flashcard generation failed';
      updateStatus('error', 0, 'Flashcard generation failed', errorMessage);
      throw error;
    }
  }, [updateStatus, geminiProcessor, currentDocument]);

  const processCurrentNotes = useCallback(async (sections) => {
    try {
      updateStatus('processing', 30, 'Converting notes to document...');
      
      const document = await documentProcessor.convertNotesToDocument(sections);
      
      updateStatus('complete', 100, 'Notes converted successfully');
      
      setDocuments(prev => [...prev, document]);
      setCurrentDocument(document);
      
      return document;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Notes conversion failed';
      updateStatus('error', 0, 'Notes conversion failed', errorMessage);
      throw error;
    }
  }, [updateStatus, documentProcessor]);

  const clearDocuments = useCallback(() => {
    setDocuments([]);
    setCurrentDocument(null);
    updateStatus('idle', 0, 'Ready to process documents');
  }, [updateStatus]);

  const deleteDocument = useCallback((documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    if (currentDocument?.id === documentId) {
      setCurrentDocument(null);
    }
  }, [currentDocument]);

  const selectDocument = useCallback((document) => {
    setCurrentDocument(document);
  }, []);

  return {
    // State
    documents,
    currentDocument,
    status,
    
    // Actions
    processFile,
    processHandwrittenImage,
    generateSummary,
    generateFlashcards,
    processCurrentNotes,
    clearDocuments,
    deleteDocument,
    selectDocument,
    
    // Utilities
    updateStatus
  };
};
