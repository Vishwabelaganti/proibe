import React, { useState } from 'react';
import { FileText, Sparkles, Copy, Check, Settings } from 'lucide-react';

export default function SummaryGenerator({ document, onGenerateSummary, disabled = false }) {
  const [summary, setSummary] = useState(document?.summary || '');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState({
    length: 'medium',
    style: 'paragraph',
    focus: 'key-concepts'
  });
  const [showOptions, setShowOptions] = useState(false);

  const handleGenerateSummary = async () => {
    if (!document || isGenerating) return;

    console.log('Starting summary generation for document:', document.title);
    console.log('Document content length:', document.content?.length);
    console.log('Summary options:', options);

    setIsGenerating(true);
    try {
      const generatedSummary = await onGenerateSummary(document, options);
      console.log('Summary generated successfully:', generatedSummary?.substring(0, 100) + '...');
      setSummary(generatedSummary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('Failed to generate summary: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy summary:', error);
    }
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (!document) {
    return (
      <div className="text-center py-8">
        <FileText size={48} className="mx-auto text-earth-300 mb-4" />
        <p className="text-earth-500">Select a document to generate summary</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Options */}
      <div className="border border-earth-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-earth-800 flex items-center">
            <Settings size={20} className="mr-2" />
            Summary Options
          </h3>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm text-accent hover:text-accent/80"
          >
            {showOptions ? 'Hide' : 'Show'} Options
          </button>
        </div>

        {showOptions && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">Length</label>
              <select
                value={options.length}
                onChange={(e) => setOptions({ ...options, length: e.target.value })}
                className="w-full px-3 py-2 border border-earth-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="short">Short (2-3 sentences)</option>
                <option value="medium">Medium (1-2 paragraphs)</option>
                <option value="long">Long (3-4 paragraphs)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">Style</label>
              <select
                value={options.style}
                onChange={(e) => setOptions({ ...options, style: e.target.value })}
                className="w-full px-3 py-2 border border-earth-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="paragraph">Paragraph</option>
                <option value="bullet-points">Bullet Points</option>
                <option value="outline">Outline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">Focus</label>
              <select
                value={options.focus}
                onChange={(e) => setOptions({ ...options, focus: e.target.value })}
                className="w-full px-3 py-2 border border-earth-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="overview">Overview</option>
                <option value="key-concepts">Key Concepts</option>
                <option value="details">Important Details</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleGenerateSummary}
            disabled={disabled || isGenerating}
            className="w-full bg-accent text-white px-4 py-3 rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Summary...
              </>
            ) : (
              <>
                <Sparkles size={18} className="mr-2" />
                Generate Summary
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Display */}
      {summary && (
        <div className="border border-earth-200 rounded-lg">
          <div className="bg-earth-50 px-4 py-3 border-b border-earth-200 flex items-center justify-between">
            <div className="flex items-center">
              <FileText size={18} className="mr-2 text-earth-600" />
              <span className="font-medium text-earth-700">Generated Summary</span>
              <span className="ml-2 text-sm text-earth-500">
                ({getWordCount(summary)} words)
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center px-3 py-1 text-sm text-earth-600 hover:text-earth-800 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-1 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-4">
            <div className="prose prose-sm max-w-none">
              {summary.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 text-earth-700 leading-relaxed">
                  {paragraph.trim() || <br />}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {summary && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setOptions({ ...options, length: 'short' });
              handleGenerateSummary();
            }}
            disabled={disabled || isGenerating}
            className="px-3 py-1 text-sm border border-earth-200 rounded-md hover:border-accent text-earth-600 hover:text-accent transition-colors disabled:opacity-50"
          >
            Make Shorter
          </button>
          <button
            onClick={() => {
              setOptions({ ...options, length: 'long' });
              handleGenerateSummary();
            }}
            disabled={disabled || isGenerating}
            className="px-3 py-1 text-sm border border-earth-200 rounded-md hover:border-accent text-earth-600 hover:text-accent transition-colors disabled:opacity-50"
          >
            More Detail
          </button>
          <button
            onClick={() => {
              setOptions({ ...options, style: 'bullet-points' });
              handleGenerateSummary();
            }}
            disabled={disabled || isGenerating}
            className="px-3 py-1 text-sm border border-earth-200 rounded-md hover:border-accent text-earth-600 hover:text-accent transition-colors disabled:opacity-50"
          >
            Bullet Points
          </button>
        </div>
      )}
    </div>
  );
}
