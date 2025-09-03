export interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  type: 'pdf' | 'image' | 'text' | 'handwritten';
  timestamp: Date;
  summary?: string;
  flashcards?: Flashcard[];
  originalFile?: File;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  confidence?: number;
  mcqOptions?: string[]; // For multiple choice questions
  correctOption?: number; // Index of correct option (0-3)
  points?: number; // Points awarded for correct answer
}

export interface SummaryOptions {
  length: 'short' | 'medium' | 'long';
  style: 'bullet-points' | 'paragraph' | 'outline';
  focus: 'key-concepts' | 'details' | 'overview';
}

export interface FlashcardOptions {
  count: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  categories: string[];
  includeDefinitions: boolean;
  includeConcepts: boolean;
  includeFactuals: boolean;
  practiceMode?: boolean; // Generate MCQ format for practice tests
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes?: any[];
}

export interface ProcessingStatus {
  stage: 'idle' | 'uploading' | 'ocr' | 'processing' | 'generating' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv' | 'anki';
  includeOriginal: boolean;
  includeSummary: boolean;
  includeFlashcards: boolean;
}
