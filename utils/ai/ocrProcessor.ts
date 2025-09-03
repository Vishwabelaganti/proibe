import Tesseract from 'tesseract.js';
import { OCRResult } from '../../types/ai';

export class OCRProcessor {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    if (this.worker) return;

    this.worker = await Tesseract.createWorker('eng');
    await this.worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,!?;:()-[]{}"\'/\\+=_@#$%^&*',
    });
  }

  async processImage(file: File | string): Promise<OCRResult> {
    await this.initialize();
    
    try {
      const { data } = await this.worker!.recognize(file);
      
      return {
        text: data.text.trim(),
        confidence: data.confidence,
        boundingBoxes: []
      };
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error('Failed to process image with OCR');
    }
  }

  async processMultipleImages(files: File[]): Promise<OCRResult[]> {
    const results: OCRResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.processImage(file);
        results.push(result);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        results.push({
          text: '',
          confidence: 0,
          boundingBoxes: []
        });
      }
    }
    
    return results;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  // Enhanced preprocessing for handwritten notes
  async processHandwrittenImage(file: File): Promise<OCRResult> {
    await this.initialize();
    
    try {
      // Configure Tesseract for handwriting recognition
      await this.worker!.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        tessedit_ocr_engine_mode: Tesseract.OEM.TESSERACT_LSTM_COMBINED,
        preserve_interword_spaces: '1',
      });

      const { data } = await this.worker!.recognize(file);
      
      return {
        text: this.cleanHandwrittenText(data.text),
        confidence: data.confidence,
        boundingBoxes: []
      };
    } catch (error) {
      console.error('Handwritten OCR processing error:', error);
      throw new Error('Failed to process handwritten image');
    }
  }

  private cleanHandwrittenText(text: string): string {
    // Clean up common OCR errors in handwritten text
    return text
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/[|]/g, 'l') // Common misrecognition
      .replace(/[0]/g, 'o') // Zero to o when contextually appropriate
      .replace(/(\w)[.,](\w)/g, '$1 $2') // Remove spurious punctuation between words
      .trim();
  }
}

// Singleton instance
export const ocrProcessor = new OCRProcessor();
