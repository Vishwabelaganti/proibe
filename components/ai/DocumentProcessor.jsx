import React from 'react';
import { FileText, Calendar, Type, Eye } from 'lucide-react';

export default function DocumentProcessor({ document }) {
  if (!document) {
    return (
      <div className="text-center py-8">
        <FileText size={48} className="mx-auto text-earth-300 mb-4" />
        <p className="text-earth-500">No document selected</p>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadingTime = (text) => {
    const wordCount = getWordCount(text);
    const wordsPerMinute = 250;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  return (
    <div className="space-y-6">
      {/* Document Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-earth-50 rounded-lg p-3 text-center">
          <Type size={20} className="mx-auto text-earth-600 mb-1" />
          <p className="text-sm text-earth-600">Words</p>
          <p className="font-semibold text-earth-800">{getWordCount(document.content).toLocaleString()}</p>
        </div>
        <div className="bg-earth-50 rounded-lg p-3 text-center">
          <Eye size={20} className="mx-auto text-earth-600 mb-1" />
          <p className="text-sm text-earth-600">Reading Time</p>
          <p className="font-semibold text-earth-800">{getReadingTime(document.content)} min</p>
        </div>
        <div className="bg-earth-50 rounded-lg p-3 text-center">
          <FileText size={20} className="mx-auto text-earth-600 mb-1" />
          <p className="text-sm text-earth-600">Type</p>
          <p className="font-semibold text-earth-800 capitalize">{document.type}</p>
        </div>
        <div className="bg-earth-50 rounded-lg p-3 text-center">
          <Calendar size={20} className="mx-auto text-earth-600 mb-1" />
          <p className="text-sm text-earth-600">Processed</p>
          <p className="font-semibold text-earth-800 text-xs">{formatDate(document.timestamp)}</p>
        </div>
      </div>

      {/* Document Content */}
      <div>
        <h3 className="text-lg font-semibold text-earth-800 mb-4 flex items-center">
          <FileText size={20} className="mr-2" />
          Document Content
        </h3>
        <div className="border border-earth-200 rounded-lg">
          <div className="bg-earth-50 px-4 py-2 border-b border-earth-200">
            <p className="text-sm text-earth-600">
              Original content • {document.content.length} characters
            </p>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              {document.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 text-earth-700 leading-relaxed">
                  {paragraph.trim() || <br />}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Original File Info */}
      {document.originalFile && (
        <div className="bg-earth-50 rounded-lg p-4">
          <h4 className="font-medium text-earth-700 mb-2">Original File</h4>
          <div className="space-y-1 text-sm text-earth-600">
            <p><span className="font-medium">Name:</span> {document.originalFile.name}</p>
            <p><span className="font-medium">Size:</span> {(document.originalFile.size / 1024).toFixed(1)} KB</p>
            <p><span className="font-medium">Type:</span> {document.originalFile.type || 'Unknown'}</p>
            <p><span className="font-medium">Last Modified:</span> {formatDate(document.originalFile.lastModified)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
