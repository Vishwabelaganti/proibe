import { GoogleGenerativeAI } from '@google/generative-ai';
import { SummaryOptions, FlashcardOptions, Flashcard } from '../../types/ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log('Gemini API Key present:', !!apiKey);

if (!apiKey) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not configured');
}

// Initialize with v1 API version (v1beta doesn't support gemini-1.5-flash/pro)
const genAI = new GoogleGenerativeAI(apiKey);

export class GeminiProcessor {
  private model: any;

  constructor() {
    // Use gemini-pro model which is the stable name supported by v1beta API
    // Note: gemini-1.5-flash and gemini-1.5-pro are not supported in v1beta
    this.model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 8192,
      }
    });

    console.log('Using Gemini model: gemini-pro');
  }

  async generateSummary(text: string, options: SummaryOptions): Promise<string> {
    console.log('Generating summary for text length:', text.length);
    console.log('Summary options:', options);

    const prompt = this.buildSummaryPrompt(text, options);
    console.log('Summary prompt:', prompt.substring(0, 200) + '...');

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();
      console.log('Summary generated successfully, length:', summary.length);
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);

      throw new Error(`Failed to generate summary: ${(error as Error).message || 'Unknown error'}`);
    }
  }

  async generateFlashcards(text: string, options: FlashcardOptions): Promise<Flashcard[]> {
    console.log('Generating flashcards for text length:', text.length);
    console.log('Flashcard options:', options);

    const prompt = this.buildFlashcardPrompt(text, options);
    console.log('Flashcard prompt:', prompt.substring(0, 200) + '...');

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let jsonResponse = response.text();
      console.log('Raw flashcard response:', jsonResponse);

      // Clean up the JSON response - remove any markdown formatting
      jsonResponse = jsonResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      jsonResponse = jsonResponse.trim();

      // Ensure it starts and ends properly
      if (!jsonResponse.startsWith('{')) {
        const startIndex = jsonResponse.indexOf('{');
        if (startIndex !== -1) {
          jsonResponse = jsonResponse.substring(startIndex);
        }
      }

      if (!jsonResponse.endsWith('}')) {
        const endIndex = jsonResponse.lastIndexOf('}');
        if (endIndex !== -1) {
          jsonResponse = jsonResponse.substring(0, endIndex + 1);
        }
      }

      console.log('Cleaned JSON response:', jsonResponse);

      // Parse the JSON response
      const parsed = JSON.parse(jsonResponse);
      const flashcards = parsed.flashcards || [];
      console.log('Flashcards parsed successfully, count:', flashcards.length);
      return flashcards;
    } catch (error) {
      console.error('Error generating flashcards:', error);

      // If JSON parsing failed, try to extract flashcards manually
      if (error instanceof SyntaxError) {
        console.log('JSON parsing failed, trying manual extraction...');
        try {
          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          const textResponse = response.text();

          // Try to extract flashcards from text format
          const flashcards = this.extractFlashcardsFromText(textResponse, options.practiceMode);
          if (flashcards.length > 0) {
            console.log('Manually extracted flashcards:', flashcards.length);
            return flashcards;
          }
        } catch (extractError) {
          console.error('Manual extraction also failed:', extractError);
        }
      }

      throw new Error(`Failed to generate flashcards: ${(error as Error).message || 'Unknown error'}`);
    }
  }

  private extractFlashcardsFromText(text: string, practiceMode?: boolean): Flashcard[] {
    const flashcards: Flashcard[] = [];

    if (practiceMode) {
      // Extract MCQ format questions
      const mcqPattern = /Q:\s*([^A]*?)\s*A\)\s*([^B]*?)\s*B\)\s*([^C]*?)\s*C\)\s*([^D]*?)\s*D\)\s*([^C]*?)\s*Correct:\s*([A-D])/gs;
      let match;

      while ((match = mcqPattern.exec(text)) !== null) {
        const question = match[1].trim();
        const options = [
          match[2].trim(),
          match[3].trim(),
          match[4].trim(),
          match[5].trim()
        ];
        const correctAnswer = match[6].trim();

        if (question && options.every(opt => opt)) {
          flashcards.push({
            id: `card-${flashcards.length + 1}`,
            front: question,
            back: options[correctAnswer.charCodeAt(0) - 65], // Convert A-D to 0-3
            mcqOptions: options,
            correctOption: correctAnswer.charCodeAt(0) - 65,
            difficulty: 'medium' as const
          });
        }
      }
    } else {
      // Try to find Q: and A: patterns for regular flashcards
      const qaPattern = /Q:\s*([^A]*?)\s*A:\s*([^Q]*?)(?=Q:|$)/gs;
      let match;

      while ((match = qaPattern.exec(text)) !== null) {
        const question = match[1].trim();
        const answer = match[2].trim();

        if (question && answer) {
          flashcards.push({
            id: `card-${flashcards.length + 1}`,
            front: question,
            back: answer,
            difficulty: 'medium' as const
          });
        }
      }
    }

    return flashcards;
  }

  private buildSummaryPrompt(text: string, options: SummaryOptions): string {
    const lengthInstructions = {
      short: 'in 2-3 sentences (approximately 50-75 words)',
      medium: 'in 1-2 paragraphs (approximately 100-200 words)',
      long: 'in 3-4 detailed paragraphs (approximately 300-500 words)'
    };

    const styleInstructions = {
      'bullet-points': 'Format the ENTIRE summary as clear bullet points. Use • for main points and start each point on a new line. Do NOT use paragraph format.',
      'paragraph': 'Write the summary in flowing paragraph format with complete sentences and proper transitions.',
      'outline': 'Structure the summary as a hierarchical outline using numbers and letters (1., a., b., 2., etc.). Use proper indentation and hierarchy.'
    };

    const focusInstructions = {
      'key-concepts': 'Focus specifically on the main concepts, theories, and fundamental ideas presented in the text.',
      'details': 'Include important details, examples, supporting information, and specific facts mentioned in the text.',
      'overview': 'Provide a high-level overview that captures the general theme and purpose of the content.'
    };

    let formatExample = '';
    if (options.style === 'bullet-points') {
      formatExample = `

IMPORTANT: Format your response EXACTLY like this example:
• Main concept or idea
• Supporting detail or second concept  
• Key finding or conclusion
• Additional important point

Do NOT use paragraph format. Use bullet points throughout.`;
    } else if (options.style === 'outline') {
      formatExample = `

IMPORTANT: Format your response EXACTLY like this example:
1. Main Topic
   a. Supporting detail
   b. Key concept
2. Secondary Topic
   a. Important finding
   b. Related information
3. Conclusion
   a. Summary point
   b. Final insight`;
    }

    return `Please summarize the following text ${lengthInstructions[options.length]}. 
${styleInstructions[options.style]}
${focusInstructions[options.focus]}.${formatExample}

Text to summarize:
${text}

Summary:`;
  }

  private buildFlashcardPrompt(text: string, options: FlashcardOptions): string {
    const difficultyInstruction = options.difficulty === 'mixed'
      ? 'Mix of easy, medium, and hard questions'
      : `${options.difficulty} difficulty questions`;

    const typeInstructions: string[] = [];
    if (options.includeDefinitions) typeInstructions.push('definitions');
    if (options.includeConcepts) typeInstructions.push('key concepts');
    if (options.includeFactuals) typeInstructions.push('factual information');

    if (options.practiceMode) {
      return `Create exactly ${options.count} multiple choice questions from the following text. 
Generate ${difficultyInstruction}.
Include: ${typeInstructions.join(', ')}.

IMPORTANT: Return the response as valid JSON in this exact format for MCQ questions:
{
  "flashcards": [
    {
      "id": "unique_id",
      "front": "Question text here?",
      "back": "Correct answer explanation",
      "mcqOptions": ["Option A", "Option B", "Option C", "Option D"],
      "correctOption": 0,
      "category": "category_name",
      "difficulty": "easy|medium|hard",
      "points": 5
    }
  ]
}

Rules for MCQ generation:
- Each question should have exactly 4 options
- Only one correct answer
- Options should be plausible but clearly distinguishable
- Include brief explanation in "back" field
- Points: easy=3, medium=5, hard=8

Text to process:
${text}`;
    } else {
      return `Create exactly ${options.count} flashcards from the following text. 
Generate ${difficultyInstruction}.
Include: ${typeInstructions.join(', ')}.

Return the response as valid JSON in this exact format:
{
  "flashcards": [
    {
      "id": "unique_id",
      "front": "Question or term",
      "back": "Answer or definition",
      "category": "category_name",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Text to process:
${text}`;
    }
  }

  async analyzeDocument(text: string): Promise<{
    wordCount: number;
    readingTime: number;
    topics: string[];
    complexity: 'low' | 'medium' | 'high';
  }> {
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 250); // Average 250 words per minute

    const analysisPrompt = `Analyze this text and provide:
    1. Main topics (list of 3-5 key topics)
    2. Complexity level (low/medium/high based on vocabulary and concepts)
    
    Return as JSON:
    {
      "topics": ["topic1", "topic2", "topic3"],
      "complexity": "low|medium|high"
    }
    
    Text: ${text.substring(0, 2000)}...`;

    try {
      const result = await this.model.generateContent(analysisPrompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());

      return {
        wordCount,
        readingTime,
        topics: analysis.topics || [],
        complexity: analysis.complexity || 'medium'
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      return {
        wordCount,
        readingTime,
        topics: [],
        complexity: 'medium'
      };
    }
  }
}
