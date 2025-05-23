import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';
import { Save, Plus, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import RichTextEditor from './RichTextEditor';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableSection({
  section,
  onSave,
  children,
  isOver,               // highlight flag from parent
  isDraggingOverlay,    // for the DragOverlay preview
}) {
  const { addSection, setActiveSection } = useNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent]     = useState(section.content);

  useEffect(() => setContent(section.content), [section.content]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging || isDraggingOverlay
      ? 'none'
      : 'transform 200ms ease',
    zIndex: isDraggingOverlay ? 999 : isDragging ? 1 : 'auto',
  };

  function save() {
    const trimmed = section.type === 'text' ? content : content.trim() || (section.type === 'heading' ? 'Untitled heading' : 'Untitled subheading');
    onSave(section.id, trimmed);
    setIsEditing(false);
    setActiveSection(section.id);
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={cn(
        'bg-white bg-opacity-90 rounded-xl shadow-sm mb-4',
        section.type === 'heading'    && 'border-2 border-light-brown/20',
        section.type === 'subheading' && 'border border-light-brown/10',
        isOver                         && 'ring-2 ring-accent/60',
        isDragging && 'opacity-50',
        isDraggingOverlay && 'opacity-80'
      )}
    >
      <div className="p-4 flex items-center justify-between group">
        <div className="flex items-center gap-2 flex-1">
          <div {...attributes} {...listeners} className="opacity-0 group-hover:opacity-100">
            <GripVertical className="cursor-grab text-light-brown/60 hover:text-light-brown" />
          </div>

          {!isEditing ? (
            section.type === 'text' ? (
              <div
                className="prose text-base flex-1 cursor-pointer"
                dangerouslySetInnerHTML={{ __html: content || '<em>Empty text…</em>' }}
                onClick={() => setIsEditing(true)}
              />
            ) : (
              <div
                className={cn(
                  'cursor-pointer flex-1',
                  section.type === 'heading'    ? 'text-2xl font-playfair font-bold'
                  : section.type === 'subheading'? 'text-xl font-medium'
                  : ''
                )}
                onClick={() => setIsEditing(true)}
              >
                {content || (section.type === 'heading' ? 'Empty heading…' : 'Empty subheading…')}
              </div>
            )
          ) : section.type === 'text' ? (
            <div className="w-full">
              <RichTextEditor content={content} onChange={setContent} type="text" />
              <button
                onClick={save}
                className="mt-2 px-3 py-1.5 bg-light-brown/10 rounded hover:bg-light-brown/20 text-light-brown flex items-center"
              >
                <Save size={14} className="mr-1" /> Save
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-2">
              <input
                className="flex-1 bg-earth-200 px-2 py-1 rounded focus:outline-none"
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()}
                placeholder={section.type === 'heading' ? 'New heading…' : 'New subheading…'}
              />
              <button
                onClick={save}
                className="px-3 py-1.5 bg-light-brown/10 rounded hover:bg-light-brown/20 text-light-brown flex items-center"
              >
                <Save size={14} className="mr-1" /> Save
              </button>
            </div>
          )}
        </div>

        {!isEditing && section.type !== 'text' && (
          <button
            onClick={() =>
              addSection(section.type === 'heading' ? 'subheading' : 'text', section.id)
            }
            className="opacity-0 group-hover:opacity-100 p-1.5 bg-light-brown/10 rounded-full hover:bg-light-brown/20 text-light-brown"
            title={section.type === 'heading' ? 'Add subheading' : 'Add text'}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {children && (
        <div
          className={cn(
            'space-y-2 pb-4',
            section.type === 'heading'    && 'px-6',
            section.type === 'subheading' && 'px-4'
          )}
        >
          {children}
        </div>
      )}
    </motion.div>
  );
}
