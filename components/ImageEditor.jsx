import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Link, Image as ImageIcon } from 'lucide-react';

export default function ImageEditor({ content, onChange, onSave, onCancel }) {
  const [imageData, setImageData] = useState(() => {
    if (content && content.url) {
      return content;
    }
    return {
      url: '',
      alt: '',
      caption: '',
      width: 'auto',
      alignment: 'center'
    };
  });

  const [inputMethod, setInputMethod] = useState('url');
  const [dragOver, setDragOver] = useState(false);
  const [pastedImageData, setPastedImageData] = useState('');

  // Sync imageData when content prop changes
  useEffect(() => {
    if (content && typeof content === 'object' && content.url !== undefined) {
      setImageData(content);
    }
  }, [content]);

  const updateImageData = (updates) => {
    const newData = { ...imageData, ...updates };
    setImageData(newData);
    onChange && onChange(newData);
  };

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB for optimal performance');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target.result;
        if (result && typeof result === 'string' && result.startsWith('data:image/')) {
          updateImageData({ 
            url: result, 
            alt: file.name.replace(/\.[^/.]+$/, "")
          });
        } else {
          alert('Failed to process image. Please try a different file.');
        }
      };
      
      reader.onerror = () => {
        alert('Failed to read file. Please try again.');
      };
      
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file (PNG, JPEG, GIF, etc.).');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleFileUpload(imageFile);
    } else if (files.length > 0) {
      alert('Please drop an image file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide if leaving the drop zone completely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  };

  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        handleFileUpload(file);
      }
    }
  };

  const sampleImages = [
    'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  return (
    <div 
      className="bg-white rounded-lg border border-earth-200 p-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onPaste={handlePaste}
      tabIndex={0}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ImageIcon size={20} />
        Add Image
      </h3>

      {/* Input method selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setInputMethod('url')}
          className={`px-3 py-2 rounded text-sm ${
            inputMethod === 'url' 
              ? 'bg-accent text-white' 
              : 'bg-earth-100 hover:bg-earth-200'
          }`}
        >
          <Link size={14} className="inline mr-1" />
          URL
        </button>
        <button
          onClick={() => setInputMethod('upload')}
          className={`px-3 py-2 rounded text-sm ${
            inputMethod === 'upload' 
              ? 'bg-accent text-white' 
              : 'bg-earth-100 hover:bg-earth-200'
          }`}
        >
          <Upload size={14} className="inline mr-1" />
          Upload
        </button>
        <button
          onClick={() => setInputMethod('paste')}
          className={`px-3 py-2 rounded text-sm ${
            inputMethod === 'paste' 
              ? 'bg-accent text-white' 
              : 'bg-earth-100 hover:bg-earth-200'
          }`}
        >
          📋 Paste
        </button>
        <button
          onClick={() => setInputMethod('sample')}
          className={`px-3 py-2 rounded text-sm ${
            inputMethod === 'sample' 
              ? 'bg-accent text-white' 
              : 'bg-earth-100 hover:bg-earth-200'
          }`}
        >
          <ImageIcon size={14} className="inline mr-1" />
          Sample
        </button>
      </div>

      {/* Input fields */}
      {inputMethod === 'url' && (
        <div className="mb-4">
          <input
            type="text"
            value={imageData.url}
            onChange={e => updateImageData({ url: e.target.value })}
            placeholder="Paste image URL..."
            className="w-full px-3 py-2 border border-earth-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
      )}
      {inputMethod === 'upload' && (
        <div className="mb-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-accent bg-accent/5' 
                : 'border-earth-300 hover:border-accent'
            }`}
          >
            <Upload size={32} className="mx-auto mb-4 text-earth-400" />
            <p className="text-earth-600 mb-4">
              Drop an image here, paste from clipboard, or click to browse
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              id="image-upload"
            />
            <label 
              htmlFor="image-upload"
              className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 cursor-pointer inline-block"
            >
              Choose File
            </label>
          </div>
        </div>
      )}
      {inputMethod === 'paste' && (
        <div className="mb-4 space-y-4">
          <textarea
            value={pastedImageData}
            onChange={(e) => setPastedImageData(e.target.value)}
            placeholder="Paste image URL or data URL here..."
            className="w-full h-24 px-3 py-2 border border-earth-300 rounded-md resize-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <button
            onClick={() => {
              if (pastedImageData.trim()) {
                updateImageData({ url: pastedImageData.trim() });
                setPastedImageData('');
              }
            }}
            className="w-full bg-accent text-white py-2 px-4 rounded-md hover:bg-accent/90"
          >
            Load Image
          </button>
        </div>
      )}
      {inputMethod === 'sample' && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {sampleImages.map(url => (
            <img
              key={url}
              src={url}
              alt="Sample"
              className="rounded cursor-pointer border-2 border-transparent hover:border-accent"
              style={{ maxHeight: 80, objectFit: 'cover' }}
              onClick={() => updateImageData({ url })}
            />
          ))}
        </div>
      )}

      {/* Preview */}
      {imageData.url && (
        <div className="mb-4 text-center">
          <img
            src={imageData.url}
            alt={imageData.alt || ''}
            className="rounded max-w-full mx-auto"
            style={{ maxHeight: 240, display: 'block', margin: '0 auto' }}
          />
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={imageData.alt}
          onChange={e => updateImageData({ alt: e.target.value })}
          placeholder="Alt text (for accessibility)"
          className="flex-1 px-3 py-2 border border-earth-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
        />
        <input
          type="text"
          value={imageData.caption}
          onChange={e => updateImageData({ caption: e.target.value })}
          placeholder="Caption (optional)"
          className="flex-1 px-3 py-2 border border-earth-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button onClick={onCancel} className="px-3 py-1 rounded bg-earth-100 hover:bg-earth-200 text-earth-700">Cancel</button>
        )}
        {onSave && (
          <button onClick={() => onSave(imageData)} className="px-3 py-1 rounded bg-accent text-white hover:bg-accent/90 flex items-center gap-1">
            <Save size={16} /> Save
          </button>
        )}
      </div>
    </div>
  );
}
