import React, { useState } from 'react';
import { Save, X, SplitSquareVertical, Move, Plus, Trash2, Type, Heading1, Heading2, Image, Table, Code, Quote, Smile, Flag } from 'lucide-react';

export default function FrameEditor({ content, onChange, onSave, onCancel }) {
  const [frameData, setFrameData] = useState(() => {
    if (content && content.leftContent !== undefined) {
      return content;
    }
    return {
      leftContent: {
        type: 'text',
        data: 'Click here to edit left content...'
      },
      rightContent: {
        type: 'text', 
        data: 'Click here to edit right content...'
      },
      splitRatio: 50, // Percentage for left side
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#e5e7eb'
    };
  });

  console.log('FrameEditor rendered with data:', frameData); // Debug log

  const updateFrameData = (updates) => {
    const newData = { ...frameData, ...updates };
    console.log('Updating frame data:', newData); // Debug log
    setFrameData(newData);
    if (onChange) {
      onChange(newData);
    }
  };

  const updateSideContent = (side, updates) => {
    console.log(`Updating ${side} content:`, updates);
    updateFrameData({
      [`${side}Content`]: { ...frameData[`${side}Content`], ...updates }
    });
  };

  const getDefaultContentForType = (type) => {
    switch (type) {
      case 'text':
        return 'Enter your text here...';
      case 'heading':
        return 'New Heading';
      case 'subheading':
        return 'New Subheading';
      case 'image':
        return { url: 'https://', alt: '', caption: '' };
      case 'placeholder':
        return 'placeholder';
      default:
        return '';
    }
  };

  const renderContentEditor = (side) => {
    const content = frameData[`${side}Content`];
    const isLeft = side === 'left';
    
    return (
      <div className="border border-earth-200 rounded-lg p-4 min-h-[200px]">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">{isLeft ? 'Left' : 'Right'} Panel</h4>
          <select
            value={content.type}
            onChange={(e) => {
              console.log(`Changing ${side} content type to:`, e.target.value);
              updateSideContent(side, { 
                type: e.target.value, 
                data: getDefaultContentForType(e.target.value) 
              });
            }}
            className="px-2 py-1 border border-earth-200 rounded text-sm"
          >
            <option value="text">📝 Text</option>
            <option value="heading">📋 Heading</option>
            <option value="subheading">📄 Subheading</option>
            <option value="image">🖼️ Image</option>
            <option value="placeholder">📦 Placeholder</option>
          </select>
        </div>
        
        {/* Simple Content Editors */}
        {content.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-2">Text Content</label>
            <textarea
              value={typeof content.data === 'string' ? content.data.replace(/<[^>]*>/g, '') : ''}
              onChange={(e) => {
                console.log(`Updating ${side} text:`, e.target.value);
                updateSideContent(side, { data: e.target.value });
              }}
              placeholder="Enter your text content..."
              className="w-full h-32 px-3 py-2 border border-earth-200 rounded-md resize-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        )}
        
        {(content.type === 'heading' || content.type === 'subheading') && (
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-2">
              {content.type === 'heading' ? 'Heading' : 'Subheading'} Text
            </label>
            <input
              type="text"
              value={content.data}
              onChange={(e) => updateSideContent(side, { data: e.target.value })}
              placeholder={`Enter your ${content.type}...`}
              className="w-full px-3 py-2 border border-earth-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        )}
        
        {content.type === 'image' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-earth-700">Image URL</label>
            <input
              type="text"
              value={content.data?.url || content.data || ''}
              onChange={(e) => updateSideContent(side, { 
                data: typeof content.data === 'object' ? 
                  { ...(content.data || {}), url: e.target.value } : 
                  { url: e.target.value } 
              })}
              placeholder="Enter image URL..."
              className="w-full px-3 py-2 border border-earth-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            {(content.data?.url || content.data) && (
              <div className="h-24 border border-earth-200 rounded-md overflow-hidden">
                <img
                  src={content.data?.url || content.data}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}
        
        {content.type === 'placeholder' && (
          <div className="border-2 border-dashed border-earth-300 rounded-lg p-8 text-center min-h-[120px] flex flex-col justify-center">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-earth-500 text-sm">
              Empty space for future content
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-earth-200 p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <SplitSquareVertical size={24} />
          Split Frame Editor
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-earth-300 text-earth-700 rounded-md hover:bg-earth-50 flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            onClick={() => onSave(frameData)}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 flex items-center gap-2"
          >
            <Save size={16} />
            Save Frame
          </button>
        </div>
      </div>

      {/* Layout Settings */}
      <div className="mb-6 p-4 bg-earth-50 rounded-lg">
        <h4 className="font-medium mb-4">Layout Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Split Ratio */}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-2">
              Split Ratio: {frameData.splitRatio}% | {100 - frameData.splitRatio}%
            </label>
            <input
              type="range"
              min="20"
              max="80"
              value={frameData.splitRatio}
              onChange={(e) => {
                console.log('Split ratio changed to:', e.target.value);
                updateFrameData({ splitRatio: parseInt(e.target.value) });
              }}
              className="w-full accent-accent"
            />
          </div>

          {/* Border Style */}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-2">Border Style</label>
            <select
              value={frameData.borderStyle}
              onChange={(e) => updateFrameData({ borderStyle: e.target.value })}
              className="w-full px-3 py-2 border border-earth-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
          
          {/* Border Width */}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-2">Border Width</label>
            <input
              type="number"
              min="0"
              max="10"
              value={frameData.borderWidth}
              onChange={(e) => updateFrameData({ borderWidth: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-earth-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {renderContentEditor('left')}
        {renderContentEditor('right')}
      </div>

      {/* Live Preview */}
      <div className="border-t border-earth-200 pt-6">
        <h4 className="font-medium mb-3">Live Preview</h4>
        <div 
          className="rounded-lg overflow-hidden bg-white min-h-[200px] border border-earth-200"
          style={{
            border: frameData.borderStyle !== 'none' ? `${frameData.borderWidth}px ${frameData.borderStyle} ${frameData.borderColor}` : '1px solid #e5e7eb'
          }}
        >
          <div className="flex h-full min-h-[200px]">
            {/* Left Panel */}
            <div 
              style={{ width: `${frameData.splitRatio}%` }} 
              className="p-4 h-full border-r border-earth-200"
            >
              {renderPreviewContent(frameData.leftContent)}
            </div>
            
            {/* Right Panel */}
            <div 
              style={{ width: `${100 - frameData.splitRatio}%` }} 
              className="p-4 h-full"
            >
              {renderPreviewContent(frameData.rightContent)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function renderPreviewContent(content) {
    if (!content || !content.data) {
      return <div className="text-earth-500 italic">No content</div>;
    }

    switch (content.type) {
      case 'text':
        return (
          <div className="text-earth-800">
            {content.data}
          </div>
        );
      
      case 'heading':
        return (
          <h1 className="text-2xl font-bold text-earth-800 mb-2">
            {content.data}
          </h1>
        );
      
      case 'subheading':
        return (
          <h2 className="text-xl font-semibold text-earth-800 mb-2">
            {content.data}
          </h2>
        );
      
      case 'image':
        const imageUrl = content.data?.url || content.data;
        if (!imageUrl || !imageUrl.startsWith('http')) {
          return <div className="text-earth-500 italic">No image URL</div>;
        }
        return (
          <div>
            <img
              src={imageUrl}
              alt="Frame content"
              className="w-full h-auto object-cover rounded"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        );
      
      case 'placeholder':
        return (
          <div className="border-2 border-dashed border-earth-300 rounded-lg h-full flex items-center justify-center">
            <div className="text-center text-earth-500">
              <div className="text-2xl mb-2">📦</div>
              <p className="text-sm">Empty Panel</p>
            </div>
          </div>
        );
      
      default:
        return <div className="text-earth-500 italic">Unknown content type: {content.type}</div>;
    }
  }
}
