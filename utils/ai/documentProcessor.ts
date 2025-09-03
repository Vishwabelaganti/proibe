import { ProcessedDocument } from '../../types/ai';

export class DocumentProcessor {
  async processFile(file: File): Promise<ProcessedDocument> {
    const fileType = this.getFileType(file);
    let content = '';

    try {
      switch (fileType) {
        case 'pdf':
          content = await this.extractPDFTextClient(file);
          break;
        case 'image':
          // Will be handled by OCR processor
          content = 'Image content - to be processed by OCR';
          break;
        case 'text':
          content = await this.extractTextFile(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${file.type}`);
      }

      return {
        id: this.generateId(),
        title: this.generateTitle(file.name, content),
        content,
        type: fileType,
        timestamp: new Date(),
        originalFile: file
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Failed to process file: ${file.name}`);
    }
  }

  private async extractPDFTextClient(file: File): Promise<string> {
    // Dynamic import only on client side
    if (typeof window === 'undefined') {
      throw new Error('PDF processing only available on client side');
    }

    try {
      console.log('Starting PDF extraction for file:', file.name, 'Size:', file.size);
      
      // Import pdf.js with explicit configuration
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source to a reliable CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await file.arrayBuffer();
      console.log('File loaded, buffer size:', arrayBuffer.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0,
        disableAutoFetch: true,
        disableStream: true
      });
      
      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      let fullText = '';
      let extractedPages = 0;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .filter((item: any) => item.str && item.str.trim())
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
            
          if (pageText) {
            fullText += pageText + '\n\n';
            extractedPages++;
          }
          
          console.log(`Page ${pageNum}: extracted ${pageText.length} characters`);
          
          // Clean up page resources
          page.cleanup();
        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError);
          continue;
        }
      }

      // Clean up PDF resources
      pdf.destroy();

      const cleanedText = fullText.trim();
      console.log(`Extraction complete: ${extractedPages}/${pdf.numPages} pages, ${cleanedText.length} total characters`);
      
      if (!cleanedText || cleanedText.length < 10) {
        return 'No readable text found in this PDF. This might be a scanned document or image-based PDF. Try uploading individual pages as images for OCR processing.';
      }

      return cleanedText;
    } catch (error) {
      console.error('PDF extraction failed:', error);
      if (error.message.includes('Invalid PDF')) {
        return 'This file appears to be corrupted or not a valid PDF. Please try re-exporting or uploading a different file.';
      }
      return `PDF extraction failed: ${error.message}. Try uploading as images or text files instead.`;
    }
  }

  private async extractTextFile(file: File): Promise<string> {
    if (file.name.endsWith('.docx')) {
      try {
        // Dynamic import for client-side only
        if (typeof window === 'undefined') {
          throw new Error('DOCX processing only available on client side');
        }
        
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } catch (error) {
        console.error('DOCX extraction error:', error);
        return 'DOCX content could not be extracted. Please try uploading as plain text.';
      }
    } else {
      // Plain text file
      return await file.text();
    }
  }

  private getFileType(file: File): 'pdf' | 'image' | 'text' {
    if (file.type === 'application/pdf') {
      return 'pdf';
    } else if (file.type.startsWith('image/')) {
      return 'image';
    } else if (
      file.type.startsWith('text/') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.docx')
    ) {
      return 'text';
    } else {
      return 'text'; // Default fallback
    }
  }

  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Strip HTML tags and clean up text content
  private stripHtmlAndClean(html: string): string {
    if (!html || typeof html !== 'string') return '';
    
    // Create a temporary div to parse HTML
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Handle lists specially to preserve structure
      const lists = tempDiv.querySelectorAll('ul, ol');
      lists.forEach(list => {
        const items = list.querySelectorAll('li');
        let listText = '';
        items.forEach((item, index) => {
          const itemText = (item.textContent || '').trim();
          if (itemText) {
            listText += `${list.tagName === 'OL' ? `${index + 1}.` : '•'} ${itemText}\n`;
          }
        });
        list.replaceWith(document.createTextNode('\n' + listText + '\n'));
      });
      
      // Handle headings to preserve structure
      const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1));
        const prefix = '#'.repeat(level) + ' ';
        const text = (heading.textContent || '').trim();
        if (text) {
          heading.replaceWith(document.createTextNode('\n' + prefix + text + '\n\n'));
        }
      });
      
      // Handle paragraphs and divs to preserve structure
      const blocks = tempDiv.querySelectorAll('p, div');
      blocks.forEach(block => {
        const text = (block.textContent || '').trim();
        if (text) {
          block.replaceWith(document.createTextNode(text + '\n\n'));
        }
      });
      
      // Handle line breaks
      const breaks = tempDiv.querySelectorAll('br');
      breaks.forEach(br => {
        br.replaceWith(document.createTextNode('\n'));
      });
      
      // Get text content and clean it up
      let text = tempDiv.textContent || tempDiv.innerText || '';
      
      // Clean up extra whitespace and formatting
      text = text
        .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
        .replace(/\n\s*\n\s*\n+/g, '\n\n') // Replace multiple newlines with double
        .replace(/^\s+|\s+$/g, '') // Trim start and end
        .replace(/\n /g, '\n') // Remove spaces at start of lines
        .trim();
      
      return text;
    } else {
      // Server-side fallback - improved HTML stripping
      return html
        .replace(/<h([1-6])[^>]*>/gi, (match, level) => '\n' + '#'.repeat(parseInt(level)) + ' ')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<\/li>/gi, '\n')
        .replace(/<ul[^>]*>|<\/ul>/gi, '\n')
        .replace(/<ol[^>]*>|<\/ol>/gi, '\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<br[^>]*\/?>/gi, '\n')
        .replace(/<div[^>]*>/gi, '')
        .replace(/<\/div>/gi, '\n')
        .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&[^;]+;/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n\s*\n+/g, '\n\n')
        .trim();
    }
  }

  private generateTitle(fileName: string, content: string): string {
    // Remove file extension and clean up
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    
    // Try to extract a meaningful title from content (first line)
    const firstLine = content.split('\n')[0]?.trim();
    if (firstLine && firstLine.length < 100 && firstLine.length > 5) {
      return firstLine;
    }
    
    return baseName || 'Untitled Document';
  }

  // Convert current notes to processable document
  async convertNotesToDocument(sections: any[]): Promise<ProcessedDocument> {
    const content = this.extractNotesContent(sections);
    
    return {
      id: this.generateId(),
      title: 'Current Notes',
      content,
      type: 'text',
      timestamp: new Date()
    };
  }

  private extractNotesContent(sections: any[]): string {
    let content = '';
    
    const processSection = (section: any, depth = 0) => {
      if (!section) return '';
      
      const indent = '  '.repeat(depth);
      let sectionText = '';
      
      // Handle different section types with proper formatting
      switch (section.type) {
        case 'heading':
          const cleanHeading = this.extractCleanText(section.content || '');
          if (cleanHeading.trim()) {
            sectionText = `${indent}# ${cleanHeading}\n\n`;
          }
          break;
          
        case 'subheading':
          const cleanSubheading = this.extractCleanText(section.content || '');
          if (cleanSubheading.trim()) {
            sectionText = `${indent}## ${cleanSubheading}\n\n`;
          }
          break;
          
        case 'text':
          const cleanText = this.extractCleanText(section.content || '');
          if (cleanText.trim()) {
            sectionText = `${indent}${cleanText}\n\n`;
          }
          break;
          
        case 'table':
          if (section.content && section.content.rows) {
            sectionText = this.extractTableContent(section.content, indent);
          }
          break;
          
        case 'folder':
          const cleanFolder = this.extractCleanText(section.content || '');
          if (cleanFolder.trim()) {
            sectionText = `${indent}### ${cleanFolder}\n\n`;
          }
          break;
          
        default:
          const defaultContent = this.extractCleanText(section.content || '');
          if (defaultContent.trim()) {
            sectionText = `${indent}${defaultContent}\n\n`;
          }
      }
      
      content += sectionText;
    };

    // Process sections hierarchically
    const processHierarchy = (parentId: string | null, depth = 0) => {
      const children = sections.filter(s => s.parent === parentId);
      children.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      for (const section of children) {
        processSection(section, depth);
        // Recursively process children
        processHierarchy(section.id, depth + 1);
      }
    };

    processHierarchy(null);
    return content.trim();
  }

  // Extract table content with proper formatting
  private extractTableContent(tableData: any, indent = ''): string {
    if (!tableData.rows || tableData.rows.length === 0) return '';
    
    let tableText = `${indent}\n`;
    const headerRows = tableData.headerRows || (tableData.hasHeader ? [0] : []);
    
    tableData.rows.forEach((row: any[], rowIndex: number) => {
      if (row && row.length > 0) {
        const cleanCells = row.map(cell => {
          const cleanCell = this.extractCleanText(cell || '').trim();
          return cleanCell || '';
        }).filter(cell => cell);
        
        if (cleanCells.length > 0) {
          if (headerRows.includes(rowIndex)) {
            // Header row
            tableText += `${indent}| ${cleanCells.join(' | ')} |\n`;
            tableText += `${indent}|${cleanCells.map(() => ' --- ').join('|')}|\n`;
          } else {
            // Regular row
            tableText += `${indent}| ${cleanCells.join(' | ')} |\n`;
          }
        }
      }
    });
    
    return tableText + `${indent}\n`;
  }

  // Extract clean text while preserving basic formatting
  private extractCleanText(html: string): string {
    if (!html || typeof html !== 'string') return '';
    
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Client-side processing with DOM
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Handle lists specially to preserve structure
      const lists = tempDiv.querySelectorAll('ul, ol');
      lists.forEach(list => {
        const items = list.querySelectorAll('li');
        let listText = '\n';
        items.forEach((item, index) => {
          const itemText = (item.textContent || '').trim();
          if (itemText) {
            const bullet = list.tagName === 'OL' ? `${index + 1}.` : '•';
            listText += `${bullet} ${itemText}\n`;
          }
        });
        list.replaceWith(document.createTextNode(listText));
      });
      
      // Handle line breaks
      const breaks = tempDiv.querySelectorAll('br');
      breaks.forEach(br => {
        br.replaceWith(document.createTextNode('\n'));
      });
      
      // Handle paragraphs
      const paragraphs = tempDiv.querySelectorAll('p');
      paragraphs.forEach(p => {
        const text = (p.textContent || '').trim();
        if (text) {
          p.replaceWith(document.createTextNode(text + '\n\n'));
        }
      });
      
      // Get clean text
      let text = tempDiv.textContent || tempDiv.innerText || '';
      
      // Clean up formatting
      text = text
        .replace(/\n\s*\n\s*\n+/g, '\n\n') // Replace multiple newlines
        .replace(/[ \t]+/g, ' ') // Replace multiple spaces
        .trim();
      
      return text;
    } else {
      // Server-side fallback
      return html
        .replace(/<li[^>]*>/gi, '\n• ')
        .replace(/<\/li>/gi, '')
        .replace(/<br[^>]*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&[^;]+;/g, ' ')
        .replace(/\n\s*\n\s*\n+/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim();
    }
  }
}

export const documentProcessor = new DocumentProcessor();
