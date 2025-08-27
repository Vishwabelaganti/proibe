import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Pin,
  Copy,
  Edit,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Palette,
  Type,
} from 'lucide-react';

import { cn } from '../utils/cn';
import RichTextEditor from './RichTextEditor';
import TableEditor from './TableEditor';
import ImageEditor from './ImageEditor';
import IconEditor from './IconEditor';
import BannerEditor from './BannerEditor';

const stripTags = (html) => html.replace(/<[^>]+>/g, '').trim();

export default function SortableSection({
  block,
  level = 0,
  draggedBlockId,
  setDraggedBlockId,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
  onToggleCollapse,
  onTogglePin,
  onAddChild,
  isDraggingOverlay = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content ?? '');
  const [showStylePanel, setShowStylePanel] = useState(false);

  // Heading style state
  const [headingColor, setHeadingColor] = useState(block.headingColor || '#4A3B2F');
  const [headingBold, setHeadingBold] = useState(!!block.headingBold);
  const [headingItalic, setHeadingItalic] = useState(!!block.headingItalic);
  const [headingUnderline, setHeadingUnderline] = useState(!!block.headingUnderline);
  const [headingFont, setHeadingFont] = useState(block.headingFont || '"Playfair Display", serif');

  const fontFamilies = [
    { label: 'Playfair Display', value: '"Playfair Display", serif' },
    { label: 'Inter', value: '"Inter", sans-serif' },
    { label: 'Georgia', value: '"Georgia", serif' },
    { label: 'Roboto', value: '"Roboto", sans-serif' },
    { label: 'Monospace', value: '"Courier New", monospace' },
  ];

  const colorPalette = [
    '#4A3B2F', '#8B4513', '#A0522D', '#DEB887', '#B5C18E',
    '#6B5B95', '#88D8C0', '#FF6B6B', '#4ECDC4', '#45B7D1'
  ];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = isDraggingOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
      };

  const handleSave = () => {
    const updates = { content };
    
    if (block.type === 'heading') {
      updates.headingColor = headingColor;
      updates.headingBold = headingBold;
      updates.headingItalic = headingItalic;
      updates.headingUnderline = headingUnderline;
      updates.headingFont = headingFont;
    }
    
    onUpdate(block.id, updates);
    setIsEditing(false);
    setShowStylePanel(false);
  };

  const handleCancel = () => {
    setContent(block.content ?? '');
    setIsEditing(false);
    setShowStylePanel(false);
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case 'heading': return <Type className="h-4 w-4 text-purple-600" />;
      case 'text': return <Edit className="h-4 w-4 text-gray-500" />;
      case 'table': return <div className="h-4 w-4 border border-gray-400 rounded-sm" />;
      case 'image': return <div className="h-4 w-4 bg-gray-300 rounded" />;
      case 'icon': return <div className="h-4 w-4 bg-yellow-300 rounded-full" />;
      case 'banner': return <div className="h-4 w-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded" />;
      default: return <Edit className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'table':
        return (
          <TableEditor
            content={content}
            onChange={setContent}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      case 'image':
        return (
          <ImageEditor
            content={content}
            onChange={setContent}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      case 'icon':
        return (
          <IconEditor
            content={content}
            onChange={setContent}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      case 'banner':
        return (
          <BannerEditor
            content={content}
            onChange={setContent}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      default:
        return (
          <RichTextEditor
            content={content}
            onChange={setContent}
            onSave={handleSave}
            onCancel={handleCancel}
            placeholder={block.type === 'heading' ? 'Enter heading...' : 'Type something...'}
          />
        );
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return renderEditor();
    }

    const commonStyles = "cursor-text hover:bg-white/30 rounded-lg transition-colors duration-200";

    switch (block.type) {
      case 'heading':
        const headingStyle = {
          color: headingColor,
          fontFamily: headingFont,
          fontWeight: headingBold ? 'bold' : 'normal',
          fontStyle: headingItalic ? 'italic' : 'normal',
          textDecoration: headingUnderline ? 'underline' : 'none',
        };
        
        return (
          <h2 
            className={cn("text-2xl font-bold py-4 px-6", commonStyles)}
            style={headingStyle}
            onClick={() => setIsEditing(true)}
          >
            {block.content || 'Untitled Note'}
          </h2>
        );
        
      case 'text':
        return (
          <div 
            className={cn("prose max-w-none py-3 px-6", commonStyles)}
            onClick={() => setIsEditing(true)}
            dangerouslySetInnerHTML={{ __html: block.content || '<p class="text-gray-400">Click to add content...</p>' }}
          />
        );
        
      case 'table':
        return (
          <div className={cn("py-3 px-6", commonStyles)} onClick={() => setIsEditing(true)}>
            {block.content ? (
              <div dangerouslySetInnerHTML={{ __html: block.content }} />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                Click to add table
              </div>
            )}
          </div>
        );
        
      case 'image':
        return (
          <div className={cn("py-3 px-6", commonStyles)} onClick={() => setIsEditing(true)}>
            {block.content ? (
              <div dangerouslySetInnerHTML={{ __html: block.content }} />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                Click to add image
              </div>
            )}
          </div>
        );
        
      case 'icon':
        return (
          <div className={cn("py-3 px-6", commonStyles)} onClick={() => setIsEditing(true)}>
            {block.content ? (
              <div dangerouslySetInnerHTML={{ __html: block.content }} />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                Click to add icon
              </div>
            )}
          </div>
        );
        
      case 'banner':
        return (
          <div className={cn("py-3 px-6", commonStyles)} onClick={() => setIsEditing(true)}>
            {block.content ? (
              <div dangerouslySetInnerHTML={{ __html: block.content }} />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 bg-gradient-to-r from-purple-50 to-blue-50">
                Click to add banner
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div 
            className={cn("py-3 px-6 text-gray-400", commonStyles)}
            onClick={() => setIsEditing(true)}
          >
            Click to add content...
          </div>
        );
    }
  };

  return (
    <div
      id={`block-${block.id}`}
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative transition-all duration-200",
        isDragging && "opacity-50",
        level > 0 && "ml-4"
      )}
    >
      {/* Block Container */}
      <div className={cn(
        "relative transition-all duration-200",
        block.type === 'heading' 
          ? "bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg" 
          : "bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg shadow-sm hover:shadow-md",
        isEditing && "ring-2 ring-purple-500/50"
      )}>
        {/* Block Header/Controls */}
        <div className="flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="p-1 rounded hover:bg-white/50 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </button>
            
            {/* Block Type Icon */}
            {getBlockIcon()}
            
            {/* Collapse Button (for headings with children) */}
            {block.type === 'heading' && onAddChild && (
              <button
                onClick={() => onToggleCollapse(block.id)}
                className="p-1 rounded hover:bg-white/50"
              >
                {block.collapsed ? (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Style Button (for headings) */}
            {block.type === 'heading' && (
              <button
                onClick={() => setShowStylePanel(!showStylePanel)}
                className="p-1 rounded hover:bg-white/50"
                title="Style heading"
              >
                <Palette className="h-4 w-4 text-gray-500" />
              </button>
            )}
            
            {/* Add Child Button */}
            {onAddChild && (
              <button
                onClick={() => onAddChild(block.id)}
                className="p-1 rounded hover:bg-white/50"
                title="Add child block"
              >
                <Plus className="h-4 w-4 text-gray-500" />
              </button>
            )}
            
            {/* Pin Button */}
            <button
              onClick={() => onTogglePin(block.id)}
              className={cn(
                "p-1 rounded hover:bg-white/50",
                block.pinned && "text-amber-500"
              )}
              title={block.pinned ? "Unpin" : "Pin"}
            >
              <Pin className="h-4 w-4" />
            </button>
            
            {/* Duplicate Button */}
            <button
              onClick={() => onDuplicate(block.id)}
              className="p-1 rounded hover:bg-white/50"
              title="Duplicate block"
            >
              <Copy className="h-4 w-4 text-gray-500" />
            </button>
            
            {/* Delete Button */}
            <button
              onClick={() => onDelete(block.id)}
              className="p-1 rounded hover:bg-red-50 hover:text-red-600"
              title="Delete block"
            >
              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
            </button>
          </div>
        </div>

        {/* Style Panel (for headings) */}
        {showStylePanel && block.type === 'heading' && (
          <div className="border-t border-white/20 p-4 bg-white/50">
            <div className="space-y-4">
              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font</label>
                <select
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  {fontFamilies.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      onClick={() => setHeadingColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all duration-200",
                        headingColor === color ? "border-gray-400 scale-110" : "border-gray-200 hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Style Options */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={headingBold}
                    onChange={(e) => setHeadingBold(e.target.checked)}
                  />
                  <Bold className="h-4 w-4" />
                  Bold
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={headingItalic}
                    onChange={(e) => setHeadingItalic(e.target.checked)}
                  />
                  <Italic className="h-4 w-4" />
                  Italic
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={headingUnderline}
                    onChange={(e) => setHeadingUnderline(e.target.checked)}
                  />
                  <UnderlineIcon className="h-4 w-4" />
                  Underline
                </label>
              </div>

              {/* Apply/Cancel Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    onUpdate(block.id, {
                      headingColor,
                      headingBold,
                      headingItalic,
                      headingUnderline,
                      headingFont,
                    });
                    setShowStylePanel(false);
                  }}
                  className="px-3 py-1 bg-purple-500 text-white rounded-md text-sm hover:bg-purple-600"
                >
                  Apply
                </button>
                <button
                  onClick={() => setShowStylePanel(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Block Content */}
        <div className="min-h-[2rem]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
