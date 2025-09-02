import React from 'react';
import { Type, Heading1, Heading2, Image, Table, Code, Quote, Smile, Flag } from 'lucide-react';

export default function ContentPalette({ onContentSelect }) {
  const contentTypes = [
    { type: 'text', icon: Type, label: 'Text', description: 'Rich text content', color: 'bg-blue-100 text-blue-800' },
    { type: 'heading', icon: Heading1, label: 'Heading', description: 'Large heading', color: 'bg-purple-100 text-purple-800' },
    { type: 'subheading', icon: Heading2, label: 'Subheading', description: 'Medium heading', color: 'bg-purple-100 text-purple-700' },
    { type: 'image', icon: Image, label: 'Image', description: 'Image from URL', color: 'bg-green-100 text-green-800' },
    { type: 'table', icon: Table, label: 'Table', description: 'Data table', color: 'bg-orange-100 text-orange-800' },
    { type: 'code', icon: Code, label: 'Code', description: 'Code block', color: 'bg-gray-100 text-gray-800' },
    { type: 'quote', icon: Quote, label: 'Quote', description: 'Quote block', color: 'bg-yellow-100 text-yellow-800' },
    { type: 'icon', icon: Smile, label: 'Icon', description: 'Icon with text', color: 'bg-pink-100 text-pink-800' },
    { type: 'banner', icon: Flag, label: 'Banner', description: 'Announcement banner', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="bg-white border border-earth-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-earth-700 mb-3 flex items-center gap-2">
        🎨 Content Palette
        <span className="text-xs text-earth-500 font-normal">(Drag to frame panels)</span>
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {contentTypes.map((contentType) => {
          const Icon = contentType.icon;
          return (
            <div
              key={contentType.type}
              draggable="true"
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', contentType.type);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => onContentSelect && onContentSelect(contentType.type)}
              className={`
                p-3 rounded-lg border border-earth-200 cursor-move transition-all duration-200
                hover:shadow-md hover:scale-105 ${contentType.color}
                flex flex-col items-center gap-2 text-center
              `}
              title={`${contentType.description} - Drag to frame panel`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{contentType.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-earth-500 text-center">
        💡 Drag any content type to the drop zones in frame panels
      </div>
    </div>
  );
}
