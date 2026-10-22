import React, { useState, useEffect } from 'react';
import { Key, X, ExternalLink, Save, CheckCircle } from 'lucide-react';
import { getApiKey, setApiKey, removeApiKey, resolveApiKey } from '../../utils/ai/apiKeyManager';

const ApiKeySettings = ({ isOpen, onClose }) => {
  const [apiKey, setApiKeyValue] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedKey = getApiKey();
      if (savedKey) {
        setApiKeyValue(savedKey);
      } else {
        resolveApiKey().then((resolved) => {
          if (resolved) setApiKeyValue(resolved);
        }).catch(() => {});
      }
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      setApiKey(apiKey);
      setIsSaved(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleRemove = () => {
    removeApiKey();
    setApiKeyValue('');
    setIsSaved(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-earth-200 flex justify-between items-center bg-earth-50">
          <div className="flex items-center space-x-2 text-earth-800">
            <Key size={24} className="text-accent" />
            <h2 className="text-xl font-bold">API Key Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-earth-500 hover:text-earth-800 transition-colors rounded-full p-1 hover:bg-earth-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <h3 className="text-sm font-bold text-amber-800 mb-1">Why do I need this?</h3>
            <p className="text-sm text-amber-700">
              Proibe uses the Google Gemini AI to generate summaries and flashcards. 
              To ensure everyone has reliable access without hitting rate limits, please provide your own free Gemini API key.
            </p>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center mt-3 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Get a free API key from Google AI Studio
              <ExternalLink size={14} className="ml-1" />
            </a>
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-earth-700 mb-2">
              Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKeyValue(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-earth-200 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all font-mono text-sm"
            />
            <p className="text-xs text-earth-500 mt-2">
              Your key is stored locally in your browser (and synced to your private account settings if signed in).
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-earth-200 bg-earth-50 flex items-center justify-between">
          <button
            onClick={handleRemove}
            className="text-sm text-red-600 hover:text-red-800 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            Remove Key
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-earth-700 hover:bg-earth-200 rounded-lg transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || isSaved}
              className="flex items-center px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {isSaved ? (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Key
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySettings;
