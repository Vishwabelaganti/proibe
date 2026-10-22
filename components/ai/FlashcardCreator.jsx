import React, { useState, useEffect } from 'react';
import { Brain, Plus, RotateCcw, Download, Settings, Copy, ChevronLeft, ChevronRight, Shuffle, Check, X, SkipForward, Clock, Trophy, Target } from 'lucide-react';

export default function FlashcardCreator({ document, onGenerateFlashcards, disabled = false }) {
  const [flashcards, setFlashcards] = useState(document?.flashcards || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState('review'); // 'review', 'quiz', 'practice'
  const [cardFlipped, setCardFlipped] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });
  
  // Practice mode specific states
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [testDuration, setTestDuration] = useState(30); // minutes
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  
  const [options, setOptions] = useState({
    count: 10,
    difficulty: 'mixed',
    includeDefinitions: true,
    includeConcepts: true,
    includeFactuals: true,
    practiceMode: false
  });
  const [showOptions, setShowOptions] = useState(false);

  // Timer effect for practice mode
  useEffect(() => {
    let interval;
    if (studyMode === 'practice' && timerEnabled && testStarted && timeRemaining > 0 && !testCompleted) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTestCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [studyMode, timerEnabled, testStarted, timeRemaining, testCompleted]);

  // Update practice mode flag when study mode changes
  useEffect(() => {
    setOptions(prev => ({
      ...prev,
      practiceMode: studyMode === 'practice'
    }));
  }, [studyMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (flashcards.length === 0) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (studyMode !== 'practice') prevCard();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (studyMode !== 'practice') nextCard();
          break;
        case ' ':
          e.preventDefault();
          if (studyMode !== 'practice') flipCard();
          break;
        case '1':
          if (studyMode === 'quiz' && showAnswer) {
            markAnswer('correct');
          } else if (studyMode === 'practice' && !showAnswer) {
            selectOption(0);
          }
          break;
        case '2':
          if (studyMode === 'quiz' && showAnswer) {
            markAnswer('incorrect');
          } else if (studyMode === 'practice' && !showAnswer) {
            selectOption(1);
          }
          break;
        case '3':
          if (studyMode === 'quiz' && showAnswer) {
            markAnswer('skip');
          } else if (studyMode === 'practice' && !showAnswer) {
            selectOption(2);
          }
          break;
        case '4':
          if (studyMode === 'practice' && !showAnswer) {
            selectOption(3);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [flashcards.length, showAnswer, studyMode]);

  const startPracticeTest = () => {
    setTestStarted(true);
    setTestCompleted(false);
    setCurrentCardIndex(0);
    setPracticeScore(0);
    setPracticeAnswers({});
    setSelectedOption(null);
    setShowAnswer(false);
    
    if (timerEnabled) {
      setTimeRemaining(testDuration * 60); // Convert minutes to seconds
    }
  };

  const selectOption = (optionIndex) => {
    if (testCompleted || showAnswer) return;
    setSelectedOption(optionIndex);
  };

  const submitAnswer = () => {
    if (selectedOption === null || testCompleted) return;
    
    const currentCard = flashcards[currentCardIndex];
    const isCorrect = selectedOption === currentCard.correctOption;
    const points = isCorrect ? (currentCard.points || 5) : 0;
    
    setPracticeAnswers(prev => ({
      ...prev,
      [currentCard.id]: {
        selected: selectedOption,
        correct: currentCard.correctOption,
        isCorrect,
        points
      }
    }));
    
    if (isCorrect) {
      setPracticeScore(prev => prev + points);
    }
    
    setShowAnswer(true);
    
    // Auto advance after 2 seconds
    setTimeout(() => {
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowAnswer(false);
      } else {
        setTestCompleted(true);
      }
    }, 2000);
  };

  const handleGenerateFlashcards = async () => {
    if (!document || isGenerating) return;

    console.log('Starting flashcard generation for document:', document.title);
    console.log('Document content length:', document.content?.length);
    console.log('Flashcard options:', options);

    setIsGenerating(true);
    try {
      const generatedFlashcards = await onGenerateFlashcards(document, options);
      console.log('Flashcards generated successfully, count:', generatedFlashcards?.length);
      setFlashcards(generatedFlashcards);
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setUserAnswers({});
      setStudyStats({ correct: 0, incorrect: 0, skipped: 0 });
      setPracticeScore(0);
      setPracticeAnswers({});
      setTestStarted(false);
      setTestCompleted(false);
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
      if (!error.message?.includes('API_KEY_MISSING')) {
        alert('Failed to generate flashcards: ' + error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const flipCard = () => {
    setCardFlipped(true);
    setTimeout(() => {
      setShowAnswer(!showAnswer);
      setCardFlipped(false);
    }, 150);
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
      setSelectedOption(null);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setShowAnswer(false);
      setSelectedOption(null);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSelectedOption(null);
  };

  const markAnswer = (result) => {
    const cardId = flashcards[currentCardIndex].id;
    setUserAnswers(prev => ({ ...prev, [cardId]: result }));
    
    setStudyStats(prev => ({
      ...prev,
      [result]: prev[result] + 1
    }));

    // Auto advance after marking
    setTimeout(() => {
      if (currentCardIndex < flashcards.length - 1) {
        nextCard();
      }
    }, 500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePracticeResults = () => {
    const totalQuestions = flashcards.length;
    const answeredQuestions = Object.keys(practiceAnswers).length;
    const correctAnswers = Object.values(practiceAnswers).filter(answer => answer.isCorrect).length;
    const totalPossiblePoints = flashcards.reduce((sum, card) => sum + (card.points || 5), 0);
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      percentage,
      totalPossiblePoints,
      earnedPoints: practiceScore
    };
  };

  const exportFlashcards = () => {
    const exportData = {
      title: document.title,
      flashcards: flashcards,
      studyStats: studyStats,
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${document.title}-flashcards.json`;
    
    // Check if we're in the browser before using document
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const copyAllCards = async () => {
    const cardsText = flashcards.map((card, index) => 
      `Card ${index + 1}:\nQ: ${card.front}\nA: ${card.back}\n`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(cardsText);
      alert('All flashcards copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy flashcards:', error);
    }
  };

  if (!document) {
    return (
      <div className="text-center py-8">
        <Brain size={48} className="mx-auto text-earth-300 mb-4" />
        <p className="text-earth-500">Select a document to create flashcards</p>
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];
  const progress = flashcards.length > 0 ? ((currentCardIndex + 1) / flashcards.length) * 100 : 0;
  return (
    <div className="space-y-6">
      {/* Study Mode Selector */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={() => setStudyMode('review')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            studyMode === 'review' 
              ? 'bg-accent text-white' 
              : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
          }`}
        >
          Review Mode
        </button>
        <button
          onClick={() => setStudyMode('quiz')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            studyMode === 'quiz' 
              ? 'bg-accent text-white' 
              : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
          }`}
        >
          Quiz Mode
        </button>
        <button
          onClick={() => setStudyMode('practice')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            studyMode === 'practice' 
              ? 'bg-accent text-white' 
              : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
          }`}
        >
          Practice Test
        </button>
      </div>

      {/* Practice Mode Timer Settings */}
      {studyMode === 'practice' && !testStarted && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3 flex items-center">
            <Clock size={20} className="mr-2" />
            Practice Test Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="timer-enabled"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="timer-enabled" className="text-sm text-blue-700">
                Enable Timer
              </label>
            </div>
            {timerEnabled && (
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={testDuration}
                  onChange={(e) => setTestDuration(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flashcard Options */}
      <div className="border border-earth-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-earth-800 flex items-center">
            <Settings size={20} className="mr-2" />
            {studyMode === 'practice' ? 'Practice Test Options' : 'Flashcard Options'}
          </h3>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm text-accent hover:text-accent/80"
          >
            {showOptions ? 'Hide' : 'Show'} Options
          </button>
        </div>

        {showOptions && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-2">
                  Number of {studyMode === 'practice' ? 'Questions' : 'Cards'}
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={options.count}
                  onChange={(e) => setOptions({ ...options, count: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-earth-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-earth-700 mb-2">Difficulty</label>
                <select
                  value={options.difficulty}
                  onChange={(e) => setOptions({ ...options, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-earth-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">Include Question Types</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeDefinitions}
                    onChange={(e) => setOptions({ ...options, includeDefinitions: e.target.checked })}
                    className="rounded border-earth-300 text-accent focus:ring-accent"
                  />
                  <span className="ml-2 text-sm text-earth-700">Definitions & Terms</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeConcepts}
                    onChange={(e) => setOptions({ ...options, includeConcepts: e.target.checked })}
                    className="rounded border-earth-300 text-accent focus:ring-accent"
                  />
                  <span className="ml-2 text-sm text-earth-700">Key Concepts</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeFactuals}
                    onChange={(e) => setOptions({ ...options, includeFactuals: e.target.checked })}
                    className="rounded border-earth-300 text-accent focus:ring-accent"
                  />
                  <span className="ml-2 text-sm text-earth-700">Factual Information</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleGenerateFlashcards}
            disabled={disabled || isGenerating}
            className="w-full bg-accent text-white px-4 py-3 rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating {studyMode === 'practice' ? 'Practice Test' : 'Flashcards'}...
              </>
            ) : (
              <>
                <Brain size={18} className="mr-2" />
                Generate {options.count} {studyMode === 'practice' ? 'MCQ Questions' : 'Flashcards'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Practice Test Start Button */}
      {studyMode === 'practice' && flashcards.length > 0 && !testStarted && (
        <div className="text-center">
          <button
            onClick={startPracticeTest}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
          >
            <Target size={24} className="mr-3" />
            Start Practice Test
          </button>
        </div>
      )}

      {/* Practice Test Results */}
      {studyMode === 'practice' && testCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
            <Trophy size={24} className="mr-2" />
            Test Completed!
          </h3>
          {(() => {
            const results = calculatePracticeResults();
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
                  <div className="text-sm text-green-700">Correct</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">{results.percentage}%</div>
                  <div className="text-sm text-blue-700">Score</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">{practiceScore}</div>
                  <div className="text-sm text-purple-700">Points</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-earth-600">{results.answeredQuestions}/{results.totalQuestions}</div>
                  <div className="text-sm text-earth-700">Answered</div>
                </div>
              </div>
            );
          })()}
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => {
                setTestStarted(false);
                setTestCompleted(false);
                setCurrentCardIndex(0);
                setPracticeScore(0);
                setPracticeAnswers({});
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retake Test
            </button>
            <button
              onClick={() => setStudyMode('review')}
              className="bg-earth-600 text-white px-4 py-2 rounded-lg hover:bg-earth-700 transition-colors"
            >
              Review Mode
            </button>
          </div>
        </div>
      )}

      {/* Timer Display for Practice Mode */}
      {studyMode === 'practice' && testStarted && timerEnabled && !testCompleted && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600 flex items-center justify-center">
            <Clock size={24} className="mr-2" />
            {formatTime(timeRemaining)}
          </div>
          <div className="text-sm text-red-700">Time Remaining</div>
        </div>
      )}

      {/* Study Stats */}
      {studyMode === 'quiz' && flashcards.length > 0 && (
        <div className="bg-earth-50 border border-earth-200 rounded-lg p-4">
          <h4 className="font-medium text-earth-800 mb-3">Study Progress</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="text-green-600">
              <div className="text-2xl font-bold">{studyStats.correct}</div>
              <div className="text-sm">Correct</div>
            </div>
            <div className="text-red-600">
              <div className="text-2xl font-bold">{studyStats.incorrect}</div>
              <div className="text-sm">Incorrect</div>
            </div>
            <div className="text-earth-500">
              <div className="text-2xl font-bold">{studyStats.skipped}</div>
              <div className="text-sm">Skipped</div>
            </div>
          </div>
        </div>
      )}

      {/* Practice Score Display */}
      {studyMode === 'practice' && testStarted && !testCompleted && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{practiceScore}</div>
              <div className="text-sm text-blue-700">Points</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{currentCardIndex + 1}/{flashcards.length}</div>
              <div className="text-sm text-blue-700">Question</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {Object.values(practiceAnswers).filter(a => a.isCorrect).length}
              </div>
              <div className="text-sm text-blue-700">Correct</div>
            </div>
          </div>
        </div>
      )}

      {/* Flashcard Display */}
      {flashcards.length > 0 && ((studyMode !== 'practice') || (studyMode === 'practice' && testStarted)) && (
        <div className="space-y-4">
          {/* Card Counter & Controls (not for practice mode) */}
          {studyMode !== 'practice' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-earth-600">
                  Card {currentCardIndex + 1} of {flashcards.length}
                </div>
                <button
                  onClick={shuffleCards}
                  className="p-2 text-earth-600 hover:text-earth-800 border border-earth-200 rounded-md hover:border-accent transition-colors"
                  title="Shuffle cards"
                >
                  <Shuffle size={16} />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyAllCards}
                  className="p-2 text-earth-600 hover:text-earth-800 border border-earth-200 rounded-md hover:border-accent transition-colors"
                  title="Copy all flashcards"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={exportFlashcards}
                  className="p-2 text-earth-600 hover:text-earth-800 border border-earth-200 rounded-md hover:border-accent transition-colors"
                  title="Export flashcards"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Practice Mode MCQ Card */}
          {studyMode === 'practice' && testStarted && !testCompleted && (
            <div className="relative">
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6 min-h-[400px]">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-blue-500 uppercase tracking-wide font-medium">
                      Question {currentCardIndex + 1} of {flashcards.length}
                    </div>
                    {flashcards[currentCardIndex].points && (
                      <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {flashcards[currentCardIndex].points} points
                      </div>
                    )}
                  </div>
                  <p className="text-xl text-earth-800 leading-relaxed mb-6">
                    {flashcards[currentCardIndex].front}
                  </p>
                </div>

                {/* MCQ Options */}
                {flashcards[currentCardIndex].mcqOptions && (
                  <div className="space-y-3">
                    {flashcards[currentCardIndex].mcqOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => selectOption(index)}
                        disabled={showAnswer}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedOption === index
                            ? showAnswer
                              ? index === flashcards[currentCardIndex].correctOption
                                ? 'border-green-500 bg-green-100 text-green-800'
                                : 'border-red-500 bg-red-100 text-red-800'
                              : 'border-blue-500 bg-blue-50 text-blue-800'
                            : showAnswer && index === flashcards[currentCardIndex].correctOption
                            ? 'border-green-500 bg-green-100 text-green-800'
                            : 'border-earth-200 hover:border-blue-300 text-earth-700'
                        } ${showAnswer ? 'cursor-default' : 'cursor-pointer hover:bg-earth-50'}`}
                      >
                        <div className="flex items-start">
                          <span className="font-medium mr-3 mt-1">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span>{option}</span>
                          {showAnswer && selectedOption === index && index !== flashcards[currentCardIndex].correctOption && (
                            <X size={20} className="ml-auto text-red-500" />
                          )}
                          {showAnswer && index === flashcards[currentCardIndex].correctOption && (
                            <Check size={20} className="ml-auto text-green-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Answer Explanation */}
                {showAnswer && (
                  <div className="mt-6 p-4 bg-earth-50 rounded-lg">
                    <div className="text-sm text-earth-600 font-medium mb-2">Explanation:</div>
                    <p className="text-earth-700">{flashcards[currentCardIndex].back}</p>
                  </div>
                )}

                {/* Submit Button */}
                {!showAnswer && selectedOption !== null && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={submitAnswer}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Submit Answer
                    </button>
                  </div>
                )}
              </div>
              
              {/* Keyboard hints for practice mode */}
              <div className="absolute bottom-4 right-4 text-xs text-earth-400 bg-white/80 rounded px-2 py-1">
                Use keys 1-4 to select options
              </div>
            </div>
          )}

          {/* Regular Interactive Flashcard (Review/Quiz modes) */}
          {studyMode !== 'practice' && (
            <div className="relative">
              <div 
                className={`bg-white border-2 border-earth-200 rounded-xl p-8 min-h-[300px] cursor-pointer hover:border-accent transition-all duration-300 transform ${
                  cardFlipped ? 'scale-95' : 'scale-100'
                } ${showAnswer ? 'bg-gradient-to-br from-accent/5 to-accent/10' : ''}`}
                onClick={flipCard}
              >
                <div className="text-center h-full flex flex-col justify-center">
                  {!showAnswer ? (
                    <div>
                      <div className="text-sm text-earth-500 uppercase tracking-wide mb-6">Question</div>
                      <p className="text-xl text-earth-800 leading-relaxed">{flashcards[currentCardIndex].front}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-accent uppercase tracking-wide mb-6">Answer</div>
                      <p className="text-xl text-earth-800 leading-relaxed mb-4">{flashcards[currentCardIndex].back}</p>
                      {flashcards[currentCardIndex].category && (
                        <div className="text-sm text-earth-500 bg-earth-100 rounded-full px-3 py-1 inline-block">
                          {flashcards[currentCardIndex].category}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Click hint */}
                <div className="absolute bottom-4 right-4 text-xs text-earth-400 bg-white/80 rounded px-2 py-1">
                  Click to {showAnswer ? 'hide' : 'reveal'} answer
                </div>
              </div>
              
              {/* Difficulty indicator */}
              {flashcards[currentCardIndex].difficulty && (
                <div className="absolute top-4 left-4">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    flashcards[currentCardIndex].difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    flashcards[currentCardIndex].difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {flashcards[currentCardIndex].difficulty}
                  </span>
                </div>
              )}

              {/* Answer status */}
              {userAnswers[flashcards[currentCardIndex].id] && (
                <div className="absolute top-4 right-4">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    userAnswers[flashcards[currentCardIndex].id] === 'correct' ? 'bg-green-100 text-green-800' :
                    userAnswers[flashcards[currentCardIndex].id] === 'incorrect' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {userAnswers[flashcards[currentCardIndex].id] === 'correct' ? '✓' : 
                     userAnswers[flashcards[currentCardIndex].id] === 'incorrect' ? '✗' : 'Skipped'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quiz Mode Controls */}
          {studyMode === 'quiz' && showAnswer && (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => markAnswer('incorrect')}
                className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X size={20} className="mr-2" />
                Incorrect (2)
              </button>
              <button
                onClick={() => markAnswer('skip')}
                className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <SkipForward size={20} className="mr-2" />
                Skip (3)
              </button>
              <button
                onClick={() => markAnswer('correct')}
                className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Check size={20} className="mr-2" />
                Correct (1)
              </button>
            </div>
          )}

          {/* Navigation (not for practice mode during test) */}
          {studyMode !== 'practice' && (
            <div className="flex items-center justify-between">
              <button
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className="flex items-center px-6 py-3 text-earth-600 border border-earth-200 rounded-lg hover:border-accent hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} className="mr-2" />
                Previous
              </button>
              
              <button
                onClick={flipCard}
                className="flex items-center px-6 py-3 bg-earth-100 text-earth-700 rounded-lg hover:bg-earth-200 transition-colors"
              >
                <RotateCcw size={16} className="mr-2" />
                {showAnswer ? 'Show Question' : 'Show Answer'} (Space)
              </button>

              <button
                onClick={nextCard}
                disabled={currentCardIndex === flashcards.length - 1}
                className="flex items-center px-6 py-3 text-earth-600 border border-earth-200 rounded-lg hover:border-accent hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={20} className="ml-2" />
              </button>
            </div>
          )}

          {/* Progress bar */}
          <div className="w-full bg-earth-200 rounded-full h-3">
            <div
              className="bg-accent h-3 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>

          {/* Keyboard shortcuts help */}
          <div className="text-xs text-earth-500 text-center space-y-1">
            {studyMode === 'practice' ? (
              <div>Use number keys 1-4 to select answer options</div>
            ) : (
              <div>Keyboard shortcuts: ← → arrows to navigate, Space to flip, 1/2/3 for quiz answers</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}