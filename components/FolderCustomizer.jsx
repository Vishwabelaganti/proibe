import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  Archive, 
  Briefcase, 
  Book, 
  Star, 
  Heart, 
  Zap, 
  Target, 
  Bookmark,
  X,
  Palette,
  Sparkles
} from 'lucide-react';

const FOLDER_COLORS = [
  { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
  { name: 'Purple', value: '#8B5CF6', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700' },
  { name: 'Green', value: '#10B981', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700' },
  { name: 'Orange', value: '#F59E0B', bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' },
  { name: 'Red', value: '#EF4444', bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700' },
  { name: 'Pink', value: '#EC4899', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-700' },
  { name: 'Teal', value: '#14B8A6', bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-700' },
  { name: 'Gray', value: '#6B7280', bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
  { name: 'Earth', value: '#8A6F53', bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700' }
];

const FOLDER_ICONS = [
  { name: 'Folder', icon: Folder, label: 'Default Folder' },
  { name: 'Archive', icon: Archive, label: 'Archive' },
  { name: 'Briefcase', icon: Briefcase, label: 'Work/Business' },
  { name: 'Book', icon: Book, label: 'Study/Research' },
  { name: 'Star', icon: Star, label: 'Important' },
  { name: 'Heart', icon: Heart, label: 'Personal' },
  { name: 'Zap', icon: Zap, label: 'Projects' },
  { name: 'Target', icon: Target, label: 'Goals' },
  { name: 'Bookmark', icon: Bookmark, label: 'References' },
  { name: 'Sparkles', icon: Sparkles, label: 'Ideas' }
];

export default function FolderCustomizer({ folder, onSave, onCancel }) {
  const [folderData, setFolderData] = useState({
    folderColor: folder.folderColor || '#3B82F6',
    folderIcon: folder.folderIcon || 'Folder',
    folderStyle: folder.folderStyle || 'default', // default, rounded, modern, minimal
    folderSize: folder.folderSize || 'medium', // small, medium, large
    showBadge: folder.showBadge !== false, // show item count badge
    gradientEnabled: folder.gradientEnabled || false,
    content: folder.content || 'New Folder'
  });

  const handleSave = () => {
    onSave({
      ...folder,
      ...folderData
    });
  };

  const getColorConfig = (colorValue) => {
    return FOLDER_COLORS.find(c => c.value === colorValue) || FOLDER_COLORS[0];
  };

  const getIconComponent = (iconName) => {
    const iconConfig = FOLDER_ICONS.find(i => i.name === iconName);
    return iconConfig ? iconConfig.icon : Folder;
  };

  const currentColor = getColorConfig(folderData.folderColor);
  const IconComponent = getIconComponent(folderData.folderIcon);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-earth-700 flex items-center gap-2">
            <Palette size={24} className="text-accent" />
            Customize Folder
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-earth-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-earth-500" />
          </button>
        </div>

        {/* Live Preview */}
        <div className="mb-6 p-4 bg-earth-50 rounded-lg">
          <h4 className="text-sm font-medium text-earth-700 mb-3">Preview</h4>
          <div 
            className={`
              inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
              ${currentColor.bg} ${currentColor.border}
              ${folderData.folderStyle === 'rounded' ? 'rounded-full' : ''}
              ${folderData.folderStyle === 'modern' ? 'shadow-lg border-0' : ''}
              ${folderData.folderStyle === 'minimal' ? 'border-0 bg-transparent' : ''}
              ${folderData.folderSize === 'small' ? 'text-sm' : ''}
              ${folderData.folderSize === 'large' ? 'text-lg' : ''}
              ${folderData.gradientEnabled ? 'bg-gradient-to-r from-current to-current/60' : ''}
            `}
            style={folderData.gradientEnabled ? {
              background: `linear-gradient(135deg, ${folderData.folderColor}20, ${folderData.folderColor}40)`
            } : {}}
          >
            <IconComponent 
              size={folderData.folderSize === 'small' ? 16 : folderData.folderSize === 'large' ? 24 : 20} 
              className={currentColor.text}
            />
            <span className={`font-medium ${currentColor.text}`}>
              {folderData.content}
            </span>
            {folderData.showBadge && (
              <span className="bg-white/80 text-xs px-1.5 py-0.5 rounded-full text-earth-600">
                3
              </span>
            )}
          </div>
        </div>

        {/* Folder Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-earth-700 mb-2">
            Folder Name
          </label>
          <input
            type="text"
            value={folderData.content}
            onChange={(e) => setFolderData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full px-3 py-2 border border-earth-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter folder name..."
          />
        </div>

        {/* Color Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-earth-700 mb-3">
            Color Theme
          </label>
          <div className="grid grid-cols-5 gap-2">
            {FOLDER_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setFolderData(prev => ({ ...prev, folderColor: color.value }))}
                className={`
                  w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110
                  ${color.bg} ${color.border}
                  ${folderData.folderColor === color.value ? 'ring-4 ring-accent/30 scale-105' : ''}
                `}
                title={color.name}
              >
                <Folder className={`w-6 h-6 mx-auto ${color.text}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Icon Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-earth-700 mb-3">
            Icon Style
          </label>
          <div className="grid grid-cols-5 gap-2">
            {FOLDER_ICONS.map((iconConfig) => {
              const IconComponent = iconConfig.icon;
              return (
                <button
                  key={iconConfig.name}
                  onClick={() => setFolderData(prev => ({ ...prev, folderIcon: iconConfig.name }))}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105
                    ${folderData.folderIcon === iconConfig.name 
                      ? 'border-accent bg-accent/10 scale-105' 
                      : 'border-earth-200 hover:border-accent/50'
                    }
                  `}
                  title={iconConfig.label}
                >
                  <IconComponent 
                    size={20} 
                    className={folderData.folderIcon === iconConfig.name ? 'text-accent' : 'text-earth-600'}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Options */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-earth-700 mb-3">
            Visual Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'default', label: 'Default' },
              { value: 'rounded', label: 'Rounded' },
              { value: 'modern', label: 'Modern' },
              { value: 'minimal', label: 'Minimal' }
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => setFolderData(prev => ({ ...prev, folderStyle: style.value }))}
                className={`
                  px-3 py-2 text-sm rounded-md border transition-colors
                  ${folderData.folderStyle === style.value
                    ? 'border-accent bg-accent text-white'
                    : 'border-earth-200 text-earth-700 hover:border-accent'
                  }
                `}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Size Options */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-earth-700 mb-3">
            Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' }
            ].map((size) => (
              <button
                key={size.value}
                onClick={() => setFolderData(prev => ({ ...prev, folderSize: size.value }))}
                className={`
                  px-3 py-2 text-sm rounded-md border transition-colors
                  ${folderData.folderSize === size.value
                    ? 'border-accent bg-accent text-white'
                    : 'border-earth-200 text-earth-700 hover:border-accent'
                  }
                `}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div className="mb-6 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={folderData.showBadge}
              onChange={(e) => setFolderData(prev => ({ ...prev, showBadge: e.target.checked }))}
              className="w-4 h-4 text-accent focus:ring-accent border-earth-300 rounded"
            />
            <span className="text-sm text-earth-700">Show item count badge</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={folderData.gradientEnabled}
              onChange={(e) => setFolderData(prev => ({ ...prev, gradientEnabled: e.target.checked }))}
              className="w-4 h-4 text-accent focus:ring-accent border-earth-300 rounded"
            />
            <span className="text-sm text-earth-700">Enable gradient background</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-earth-300 text-earth-700 rounded-md hover:bg-earth-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
