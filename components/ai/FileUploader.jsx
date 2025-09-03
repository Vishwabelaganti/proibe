import React, { useCallback, useState, useEffect } from 'react';
import { Upload, FileText, Image, FileX } from 'lucide-react';

export default function FileUploader({ onFileUpload, disabled = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || !mounted) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled, mounted]);

  const handleFiles = (files) => {
    if (!mounted) return;
    
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      return validTypes.includes(file.type) || file.name.endsWith('.txt');
    });

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      onFileUpload(validFiles);
    }
  };

  const handleInputChange = (e) => {
    if (disabled || !mounted) return;
    
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <Image size={16} className="text-blue-600" />;
    } else if (file.type === 'application/pdf') {
      return <FileText size={16} className="text-red-600" />;
    } else {
      return <FileText size={16} className="text-earth-600" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!mounted) {
    return (
      <div className="border-2 border-dashed border-earth-200 rounded-lg p-6 text-center">
        <Upload size={32} className="mx-auto mb-2 text-earth-400" />
        <p className="text-earth-500">Loading file uploader...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragActive 
            ? 'border-accent bg-accent/5' 
            : 'border-earth-200 hover:border-accent/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && mounted && typeof document !== 'undefined') {
            document.getElementById('file-input')?.click();
          }
        }}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.docx"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload size={32} className={`mx-auto mb-2 ${dragActive ? 'text-accent' : 'text-earth-400'}`} />
        <p className="text-earth-700 font-medium">
          {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-sm text-earth-500 mt-1">
          PDF, Images, Text files, Word documents
        </p>
      </div>

      {/* File List */}
      {selectedFiles.length > 0 && (
        <div className="border border-earth-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-earth-700">Selected Files</h4>
            <button
              onClick={clearFiles}
              className="text-sm text-earth-500 hover:text-earth-700"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-earth-50 rounded">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getFileIcon(file)}
                  <span className="text-sm text-earth-700 truncate">{file.name}</span>
                </div>
                <span className="text-xs text-earth-500">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supported Formats */}
      <div className="text-xs text-earth-500">
        <p className="font-medium mb-1">Supported formats:</p>
        <div className="grid grid-cols-2 gap-1">
          <div>• PDF documents</div>
          <div>• PNG, JPG, GIF images</div>
          <div>• Text files (.txt)</div>
          <div>• Word documents (.docx)</div>
        </div>
        <p className="mt-2 italic">Images with handwritten notes are automatically processed with OCR</p>
      </div>
    </div>
  );
}
