import React from 'react';
import { FileText, FileX, Brain, Sparkles, Archive } from 'lucide-react';

export default function ProcessingTabs({ activeTab, onTabChange, document }) {
  const tabs = [
    {
      id: 'content',
      label: 'Content',
      icon: FileText,
      count: document ? Math.round(document.content.length / 100) : 0,
      countLabel: document ? 'chars (100s)' : ''
    },
    {
      id: 'summary',
      label: 'Summary',
      icon: Sparkles,
      count: document?.summary ? Math.round(document.summary.length / 100) : 0,
      countLabel: document?.summary ? 'chars (100s)' : '',
      hasContent: !!document?.summary
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      icon: Brain,
      count: document?.flashcards?.length || 0,
      countLabel: 'cards',
      hasContent: !!(document?.flashcards?.length)
    },
    {
      id: 'saved',
      label: 'Saved Content',
      icon: Archive,
      count: 0, // This will be updated dynamically
      countLabel: 'items',
      hasContent: true // Always show as available
    }
  ];

  return (
    <div className="border-b border-earth-200">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${isActive
                  ? 'border-accent text-accent'
                  : 'border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300'
                }
              `}
            >
              <Icon size={18} className="mr-2" />
              {tab.label}
              
              {/* Content indicator */}
              {tab.count > 0 && (
                <span className={`
                  ml-2 px-2 py-1 text-xs rounded-full
                  ${isActive
                    ? 'bg-accent/10 text-accent'
                    : 'bg-earth-100 text-earth-600'
                  }
                `}>
                  {tab.count} {tab.countLabel}
                </span>
              )}
              
              {/* Generated content indicator */}
              {tab.hasContent && (
                <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
