import React, { useState } from 'react';
import { useAISummaries } from '../../context/AISummariesContext';
import { 
  FileText, 
  Clock, 
  Tag, 
  Search, 
  Trash2, 
  Copy, 
  Download,
  ChevronDown,
  ChevronRight,
  Calendar,
  Hash,
  Brain,
  Play,
  CheckCircle,
  XCircle,
  RotateCcw,
  Edit3,
  Save,
  X
} from 'lucide-react';

export default function SavedSummaries() {
  const { summaries, deleteSummary, updateSummary, exportSummaries, searchSummaries } = useAISummaries();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSummary, setExpandedSummary] = useState(null);
  const [copied, setCopied] = useState(null);
  const [quizMode, setQuizMode] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizStats, setQuizStats] = useState({ correct: 0, incorrect: 0 });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSummaries = searchQuery.trim() ? searchSummaries(searchQuery) : summaries;

  // Generate quiz questions from summary content
  const generateQuizQuestions = (summaryContent) => {
    const sentences = summaryContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const questions = [];
    
    // Generate different types of questions
    for (let i = 0; i < Math.min(5, sentences.length); i++) {
      const sentence = sentences[i].trim();
      const words = sentence.split(' ');
      
      if (words.length > 5) {
        // Fill in the blank question
        const blankIndex = Math.floor(words.length / 2);
        const correctAnswer = words[blankIndex];
        const questionText = words.map((word, idx) => idx === blankIndex ? '____' : word).join(' ');
        
        // Generate distractors
        const distractors = [
          'information', 'important', 'significant', 'relevant', 'crucial'
        ].filter(d => d !== correctAnswer.toLowerCase()).slice(0, 3);
        
        const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
        
        questions.push({
          question: `Fill in the blank: ${questionText}`,
          options: options,
          correctAnswer: correctAnswer,
          type: 'fill-blank'
        });
      }
    }
    
    // Add a true/false question
    if (sentences.length > 0) {
      questions.push({
        question: `True or False: ${sentences[0].trim()}`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        type: 'true-false'
      });
    }
    
    return questions.slice(0, 5); // Limit to 5 questions
  };

  const startQuiz = (summary) => {
    const questions = generateQuizQuestions(summary.content);
    setQuizQuestions(questions);
    setQuizMode(summary);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setQuizStats({ correct: 0, incorrect: 0 });
  };

  const endQuiz = () => {
    setQuizMode(null);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setQuizStats({ correct: 0, incorrect: 0 });
  };

  const selectAnswer = (answer) => {
    setSelectedAnswer(answer);
    setShowAnswer(true);
    
    const isCorrect = answer === quizQuestions[currentQuestionIndex].correctAnswer;
    setQuizStats(prev => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const handleCopySummary = async (summary) => {
    try {
      await navigator.clipboard.writeText(summary.content);
      setCopied(summary.id);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy summary:', error);
    }
  };

  const handleDeleteSummary = (summaryId) => {
    if (confirm('Are you sure you want to delete this summary?')) {
      deleteSummary(summaryId);
    }
  };

  const startEditTitle = (summary) => {
    setEditingTitle(summary.id);
    setEditTitle(summary.title);
  };

  const saveTitle = (summaryId) => {
    if (editTitle.trim()) {
      updateSummary(summaryId, { title: editTitle.trim() });
    }
    setEditingTitle(null);
    setEditTitle('');
  };

  const cancelEditTitle = () => {
    setEditingTitle(null);
    setEditTitle('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncateContent = (content, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (filteredSummaries.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={64} className="mx-auto mb-4 text-earth-300" />
        <h3 className="text-lg font-medium text-earth-700 mb-2">
          {searchQuery ? 'No matching summaries found' : 'No saved summaries yet'}
        </h3>
        <p className="text-earth-500">Generate your first AI summary to see it saved here automatically.</p>
      </div>
    );
  }

  // Quiz Mode UI
  if (quizMode && quizQuestions.length > 0) {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg shadow-sm border border-earth-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-earth-800">Quiz: {quizMode.title}</h2>
              <p className="text-earth-600">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </p>
            </div>
            <button
              onClick={endQuiz}
              className="px-4 py-2 text-earth-600 hover:text-earth-800 hover:bg-earth-100 rounded-lg transition-colors"
            >
              Exit Quiz
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-earth-200 rounded-full h-2 mb-4">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle size={16} />
              Correct: {quizStats.correct}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <XCircle size={16} />
              Incorrect: {quizStats.incorrect}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-lg border border-earth-200 p-8 mb-6">
          <h3 className="text-xl font-semibold text-earth-800 mb-6">{currentQuestion.question}</h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              const showCorrectness = showAnswer;
              
              let buttonClass = "w-full p-4 text-left border rounded-lg transition-colors ";
              
              if (showCorrectness) {
                if (isCorrect) {
                  buttonClass += "border-green-500 bg-green-50 text-green-800";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-50 text-red-800";
                } else {
                  buttonClass += "border-earth-200 bg-earth-50 text-earth-600";
                }
              } else {
                buttonClass += isSelected 
                  ? "border-accent bg-accent/10 text-accent" 
                  : "border-earth-200 hover:border-accent hover:bg-accent/5 text-earth-700";
              }
              
              return (
                <button
                  key={index}
                  onClick={() => !showAnswer && selectAnswer(option)}
                  disabled={showAnswer}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showCorrectness && isCorrect && <CheckCircle size={20} className="text-green-600" />}
                    {showCorrectness && isSelected && !isCorrect && <XCircle size={20} className="text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {showAnswer && (
            <div className="mt-6 flex justify-center">
              {currentQuestionIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-accent text-white hover:bg-accent-dark rounded-lg transition-colors"
                >
                  Next Question →
                </button>
              ) : (
                <div className="text-center">
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Quiz Complete!</h3>
                    <p className="text-green-700">
                      Final Score: {quizStats.correct} out of {quizQuestions.length} correct
                      ({Math.round((quizStats.correct / quizQuestions.length) * 100)}%)
                    </p>
                  </div>
                  <button
                    onClick={endQuiz}
                    className="px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                  >
                    Finish Quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-earth-800">Saved Summaries</h2>
          <p className="text-sm text-earth-600">{summaries.length} summaries saved locally</p>
        </div>
        <button
          onClick={exportSummaries}
          className="flex items-center px-4 py-2 text-sm text-earth-600 border border-earth-200 rounded-lg hover:bg-earth-50 transition-colors"
        >
          <Download size={16} className="mr-2" />
          Export All
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400" />
        <input
          type="text"
          placeholder="Search summaries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-earth-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      {/* Summaries List */}
      <div className="space-y-4">
        {filteredSummaries.map((summary) => {
          const isExpanded = expandedSummary === summary.id;
          
          return (
            <div key={summary.id} className="bg-white border border-earth-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingTitle === summary.id ? (
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 px-3 py-1 border border-earth-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTitle(summary.id);
                            if (e.key === 'Escape') cancelEditTitle();
                          }}
                        />
                        <button
                          onClick={() => saveTitle(summary.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Save"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={cancelEditTitle}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-earth-800 truncate flex-1">{summary.title}</h3>
                        <button
                          onClick={() => startEditTitle(summary)}
                          className="p-1 text-earth-500 hover:text-earth-700 hover:bg-earth-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Rename"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-earth-600 mt-1 space-x-4">
                      <span className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(summary.createdAt)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Hash size={14} />
                        <span>{Math.round(summary.content.length / 100)} chars (100s)</span>
                      </span>
                      {summary.sourceDocument && (
                        <span className="text-accent">From: {summary.sourceDocument.title}</span>
                      )}
                    </div>
                    {summary.tags && summary.tags.length > 0 && (
                      <div className="flex items-center mt-2 space-x-2">
                        <Tag size={14} className="text-earth-400" />
                        {summary.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-earth-100 text-earth-600 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => startQuiz(summary)}
                      className="flex items-center gap-1 px-3 py-2 bg-accent text-white hover:bg-accent-dark rounded-lg transition-colors text-sm font-medium"
                      title="Take quiz on this summary"
                    >
                      <Brain size={16} />
                      Quiz
                    </button>
                    <button
                      onClick={() => handleCopySummary(summary)}
                      className="p-2 text-earth-500 hover:text-earth-700 hover:bg-earth-100 rounded-lg transition-colors"
                      title="Copy summary"
                    >
                      {copied === summary.id ? (
                        <span className="text-green-600 text-sm">Copied!</span>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteSummary(summary.id)}
                      className="p-2 text-earth-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete summary"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-earth-800">Summary</h4>
                  <button
                    onClick={() => setExpandedSummary(isExpanded ? null : summary.id)}
                    className="flex items-center text-sm text-earth-600 hover:text-earth-800"
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                    {isExpanded ? <ChevronDown size={16} className="ml-1" /> : <ChevronRight size={16} className="ml-1" />}
                  </button>
                </div>
                
                <div className="text-earth-700 leading-relaxed">
                  {isExpanded ? (
                    <div className="whitespace-pre-wrap">{summary.content}</div>
                  ) : (
                    <div>{truncateContent(summary.content)}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No results message */}
      {filteredSummaries.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <Search size={48} className="mx-auto text-earth-300 mb-4" />
          <p className="text-earth-500">No summaries found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
