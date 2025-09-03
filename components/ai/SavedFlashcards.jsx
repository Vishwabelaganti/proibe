import React, { useState } from 'react';
import { useFlashcards } from '../../context/FlashcardsContext';
import { Brain, Search, Trash2, Download, Calendar, FileText, ExternalLink, Play, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

export default function SavedFlashcards() {
  const { flashcardSets, deleteFlashcardSet, searchFlashcardSets } = useFlashcards();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSet, setExpandedSet] = useState(null);
  const [studyMode, setStudyMode] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0 });

  const filteredFlashcardSets = searchTerm 
    ? searchFlashcardSets(searchTerm)
    : flashcardSets;

  const startStudyMode = (flashcardSet) => {
    setStudyMode(flashcardSet);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyStats({ correct: 0, incorrect: 0 });
  };

  const endStudyMode = () => {
    setStudyMode(null);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyStats({ correct: 0, incorrect: 0 });
  };

  const nextCard = () => {
    if (currentCardIndex < studyMode.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const markAnswer = (isCorrect) => {
    setStudyStats(prev => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1
    }));
    setTimeout(() => {
      if (currentCardIndex < studyMode.flashcards.length - 1) {
        nextCard();
      }
    }, 500);
  };

  const handleExportFlashcards = (flashcardSet) => {
    const exportData = {
      title: flashcardSet.title,
      flashcards: flashcardSet.flashcards,
      metadata: {
        createdAt: flashcardSet.createdAt,
        sourceDocument: flashcardSet.sourceDocument,
        exportedAt: new Date().toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${flashcardSet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpandSet = (setId) => {
    setExpandedSet(expandedSet === setId ? null : setId);
  };

  // Study Mode UI
  if (studyMode) {
    const currentCard = studyMode.flashcards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / studyMode.flashcards.length) * 100;

    // Debug logging
    console.log('Study Mode - Current Card:', currentCard);
    console.log('Study Mode - All Flashcards:', studyMode.flashcards);

    // Safety check
    if (!currentCard) {
      return (
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-red-600">Error: No flashcard data found</p>
          <button
            onClick={endStudyMode}
            className="mt-4 px-4 py-2 bg-earth-600 text-white rounded-lg"
          >
            Exit Study Mode
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        {/* Study Mode Header */}
        <div className="bg-white rounded-lg shadow-sm border border-earth-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-earth-800">{studyMode.title}</h2>
              <p className="text-earth-600">
                Card {currentCardIndex + 1} of {studyMode.flashcards.length}
              </p>
            </div>
            <button
              onClick={endStudyMode}
              className="px-4 py-2 text-earth-600 hover:text-earth-800 hover:bg-earth-100 rounded-lg transition-colors"
            >
              Exit Study Mode
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
              Correct: {studyStats.correct}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <XCircle size={16} />
              Incorrect: {studyStats.incorrect}
            </span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="bg-white rounded-lg shadow-lg border border-earth-200 p-8 mb-6 min-h-[300px] flex flex-col justify-center">
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-earth-800 mb-4">Question</h3>
              <p className="text-xl text-earth-700 leading-relaxed">
                {currentCard.front || currentCard.question || 'No question available'}
              </p>
            </div>
            
            {showAnswer ? (
              <div className="border-t border-earth-200 pt-6">
                <h3 className="text-lg font-medium text-earth-800 mb-4">Answer</h3>
                <p className="text-xl text-earth-600 leading-relaxed">
                  {currentCard.back || currentCard.answer || 'No answer available'}
                </p>
                
                {/* Answer feedback */}
                <div className="flex justify-center gap-4 mt-8">
                  <button
                    onClick={() => markAnswer(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    <XCircle size={20} />
                    Incorrect
                  </button>
                  <button
                    onClick={() => markAnswer(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                  >
                    <CheckCircle size={20} />
                    Correct
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="px-8 py-3 bg-accent text-white hover:bg-accent-dark rounded-lg transition-colors"
              >
                Show Answer
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevCard}
            disabled={currentCardIndex === 0}
            className="px-4 py-2 text-earth-600 hover:text-earth-800 hover:bg-earth-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => setStudyMode({ ...studyMode, flashcards: [...studyMode.flashcards].sort(() => Math.random() - 0.5) })}
              className="p-2 text-earth-600 hover:text-earth-800 hover:bg-earth-100 rounded-lg transition-colors"
              title="Shuffle cards"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          <button
            onClick={nextCard}
            disabled={currentCardIndex === studyMode.flashcards.length - 1}
            className="px-4 py-2 text-earth-600 hover:text-earth-800 hover:bg-earth-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>

        {/* Completion message */}
        {currentCardIndex === studyMode.flashcards.length - 1 && showAnswer && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <h3 className="font-semibold text-green-800 mb-2">Study Session Complete!</h3>
            <p className="text-green-700">
              Final Score: {studyStats.correct} correct, {studyStats.incorrect} incorrect
            </p>
            <button
              onClick={endStudyMode}
              className="mt-3 px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              Finish Session
            </button>
          </div>
        )}
      </div>
    );
  }

  if (filteredFlashcardSets.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain size={64} className="mx-auto mb-4 text-earth-300" />
        <h3 className="text-lg font-medium text-earth-700 mb-2">
          {searchTerm ? 'No matching flashcard sets found' : 'No saved flashcard sets yet'}
        </h3>
        <p className="text-earth-500 mb-4">
          {searchTerm 
            ? 'Try adjusting your search terms'
            : 'Generate flashcards from any document to see them saved here automatically'
          }
        </p>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-accent hover:text-accent-dark font-medium"
          >
            Clear search
          </button>
        )}
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
          placeholder="Search flashcard sets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-earth-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      {/* Flashcard Sets */}
      <div className="space-y-4">
        {filteredFlashcardSets.map((flashcardSet) => (
          <div key={flashcardSet.id} className="bg-white border border-earth-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain size={20} className="text-accent flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-earth-800 truncate">{flashcardSet.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-earth-600 mb-3">
                    <span className="flex items-center gap-1">
                      <FileText size={16} />
                      {flashcardSet.flashcards.length} cards
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(flashcardSet.createdAt).toLocaleDateString()}
                    </span>
                    {flashcardSet.sourceDocument && (
                      <span className="flex items-center gap-1">
                        <ExternalLink size={16} />
                        {flashcardSet.sourceDocument.title}
                      </span>
                    )}
                  </div>

                  {flashcardSet.tags && flashcardSet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {flashcardSet.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-earth-100 text-earth-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => startStudyMode(flashcardSet)}
                    className="flex items-center gap-1 px-3 py-2 bg-accent text-white hover:bg-accent-dark rounded-lg transition-colors text-sm font-medium"
                    title="Start studying"
                  >
                    <Play size={16} />
                    Study
                  </button>
                  <button
                    onClick={() => toggleExpandSet(flashcardSet.id)}
                    className="p-2 text-earth-500 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                    title="View flashcards"
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button
                    onClick={() => handleExportFlashcards(flashcardSet)}
                    className="p-2 text-earth-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Export flashcards"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => deleteFlashcardSet(flashcardSet.id)}
                    className="p-2 text-earth-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete flashcard set"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Expanded flashcards view */}
              {expandedSet === flashcardSet.id && (
                <div className="mt-4 pt-4 border-t border-earth-200">
                  <h4 className="font-medium text-earth-800 mb-3">Flashcards Preview</h4>
                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {flashcardSet.flashcards.slice(0, 5).map((card, index) => (
                      <div key={index} className="bg-earth-50 rounded-lg p-3">
                        <div className="font-medium text-earth-800 mb-2">
                          {card.front || card.question || 'No question'}
                        </div>
                        <div className="text-earth-600 text-sm">
                          {card.back || card.answer || 'No answer'}
                        </div>
                      </div>
                    ))}
                    {flashcardSet.flashcards.length > 5 && (
                      <div className="text-center py-2 text-earth-500 text-sm">
                        + {flashcardSet.flashcards.length - 5} more cards
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
