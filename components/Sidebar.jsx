import React, { useState } from 'react';
import FolderCustomizer from './FolderCustomizer';
import {
  Plus,
  Heading1,
  Trash2,
  ChevronDown,
  ChevronRight,
  Star,
  Pin,
  Table,
  Image,
  Smile,
  Flag,
  Folder,
  FolderOpen,
  FolderPlus,
  Settings,
  Edit3,
  Archive,
  Briefcase,
  Book,
  Heart,
  Zap,
  Target,
  Bookmark,
  Sparkles,
  Brain
} from 'lucide-react';
import { GripVertical } from 'lucide-react';
import { useSensors, useSensor, PointerSensor, DndContext, rectIntersection, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

import { motion } from 'framer-motion';
import { useNotes } from '../context/NotesContext';
import { cn } from '../utils/cn';          // helper to join classes

// Helper function to get folder icon component
const getFolderIcon = (iconName) => {
  const iconMap = {
    Folder: Folder,
    Archive: Archive,
    Briefcase: Briefcase,
    Book: Book,
    Star: Star,
    Heart: Heart,
    Zap: Zap,
    Target: Target,
    Bookmark: Bookmark,
    Sparkles: Sparkles
  };
  return iconMap[iconName] || Folder;
};

function RootDropZone({ children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'root-drop-zone',
  });

  return (
    <div 
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-2' : ''
      }`}
    >
      {children}
      {isOver && (
        <div className="mt-4 p-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-100 text-center">
          <div className="text-blue-600 text-sm font-medium">
            📤 Drop here to move to root level
          </div>
          <div className="text-blue-500 text-xs mt-1">
            Remove from folders and organize at the top level
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyStateMessage() {
  return (
    <div className="text-center py-12">
      <div className="text-earth-500 text-sm mb-2">No sections yet</div>
      <div className="text-earth-400 text-xs">
        Add your first heading or note above
      </div>
    </div>
  );
}

export default function Sidebar() {
  const {
    sections,
    activeSection,
    setActiveSection,
    toggleCollapse,
    getChildSections,
    togglePin,
    updateSection,
  } = useNotes();

  const addSection = React.useCallback(useNotes().addSection, []);
  const deleteSection = React.useCallback(useNotes().deleteSection, []);
  const reorderSections = React.useCallback(useNotes().reorderSections, []);
  const pinnedSections = sections.filter((s) => s.pinned);
  const rootSections = getChildSections(null).filter((s) => !s.pinned);
  const [editingId, setEditingId] = React.useState(null);
  const [draftLabel, setDraftLabel] = React.useState('');
  const [openedDuringDrag, setOpenedDuringDrag] = React.useState([]);
  const [customizingFolder, setCustomizingFolder] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    function allowedChildTypes(type) {
      if (type === 'heading')    return ['subheading','text','table','image','icon','banner','folder'];
      if (type === 'subheading') return ['text','table','image','icon','banner','folder'];
      if (type === 'folder')     return ['heading','subheading','text','table','image','icon','banner','folder'];
      return [];
    }
    function handleDragEnd(event) {
    const { active, over } = event;
    if (!active) return;

    const dragged = sections.find((s) => s.id === active.id);
    if (!dragged) return;

    // If no target (dropped on empty space), move to root level
    if (!over) {
      if (dragged.parent !== null) {
        updateSection(dragged.id, { parent: null });
      }
      return;
    }

    // If target is the same as dragged, do nothing
    if (active.id === over.id) return;

    const target = sections.find((s) => s.id === over.id);
    if (!target) return;

    // Special handling for root-level drop zone
    if (over.id === 'root-drop-zone') {
      updateSection(dragged.id, { parent: null });
      return;
    }

    // Drag onto heading → become its child
    if (target.type === 'heading' && ['subheading','text','table','image','icon','banner','folder'].includes(dragged.type)) {
      updateSection(dragged.id, { parent: target.id });
      return;
    }

    // Drag onto subheading → become its child
    if (target.type === 'subheading' && ['text','table','image','icon','banner','folder'].includes(dragged.type)) {
      updateSection(dragged.id, { parent: target.id });
      return;
    }

    // Drag onto folder → become its child
    if (target.type === 'folder' && ['heading','subheading','text','table','image','icon','banner','folder'].includes(dragged.type)) {
      updateSection(dragged.id, { parent: target.id });
      return;
    }

    // Same-parent reorder
    if (dragged.parent === target.parent) {
      reorderSections(dragged.id, target.id);
    }
  }

  // Folder customization handlers
  const handleFolderCustomize = (folder) => {
    setCustomizingFolder(folder);
  };

  const handleCustomizationSave = (updatedFolder) => {
    updateSection(updatedFolder.id, updatedFolder);
    setCustomizingFolder(null);
  };

  const handleCustomizationCancel = () => {
    setCustomizingFolder(null);
  };

  // Helper function to get folder styling based on custom properties
  const getFolderStyling = (section) => {
    if (section.type !== 'folder') return {};

    const color = section.folderColor || '#3B82F6';
    const style = section.folderStyle || 'default';
    const gradientEnabled = section.gradientEnabled || false;

    const baseClasses = {
      default: 'border',
      rounded: 'border rounded-full',
      modern: 'shadow-lg border-0',
      minimal: 'border-0 bg-transparent'
    };

    // Convert hex color to RGB for background opacity
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb = hexToRgb(color);
    const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : 'rgba(59, 130, 246, 0.1)';
    const borderColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'rgba(59, 130, 246, 0.3)';

    return {
      classes: baseClasses[style] || baseClasses.default,
      style: gradientEnabled ? {
        background: `linear-gradient(135deg, ${bgColor}, ${bgColor.replace('0.1', '0.2')})`,
        borderColor: borderColor
      } : {
        backgroundColor: bgColor,
        borderColor: borderColor
      }
    };
  };

    function handleDragStart(event) {
    const { active } = event;
    if (!active?.id) return;

    const dragged = sections.find((s) => s.id === active.id);
    if (!dragged) return;

    const parentId = dragged.parent;          // null for top-level headings
    if (!parentId) return;

    const parent = sections.find((s) => s.id === parentId);
    if (parent && parent.collapsed) {
        toggleCollapse(parentId);               // open it so we can see the child
        setOpenedDuringDrag((prev) => [...prev, parentId]);
    }
    }
 

   /* ---------- inline rename ---------- */
   function commitRename(id) {
    const trimmed = draftLabel.trim();
    updateSection(id, { content: trimmed || 'Untitled' });
    setEditingId(null);
    }

  /* ---------- helpers ---------- */
  
// Removed duplicate implementation of allowedChildTypes function
  const SectionIcon = (type, collapsed = false, section = null) => {
    switch (type) {
      case 'heading':
        return <Heading1 className="h-4 w-4 text-earth-700" />;
      case 'folder':
        if (section && section.folderIcon) {
          const CustomIcon = getFolderIcon(section.folderIcon);
          const color = section.folderColor || '#3B82F6';
          return collapsed ? 
            <CustomIcon className="h-4 w-4" style={{ color }} /> : 
            <CustomIcon className="h-4 w-4" style={{ color }} />;
        }
        return collapsed ? 
          <Folder className="h-4 w-4 text-blue-600" /> : 
          <FolderOpen className="h-4 w-4 text-blue-600" />;
      case 'table':
        return <Table className="h-4 w-4 text-earth-700" />;
      case 'image':
        return <Image className="h-4 w-4 text-earth-700" />;
      case 'icon':
        return <Smile className="h-4 w-4 text-earth-700" />;
      case 'banner':
        return <Flag className="h-4 w-4 text-earth-700" />;
      default:
        return null;
    }
  };
function SortableRow({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,    
  } = useSortable({ id });

  const style = {
    transform: (transform && CSS.Translate && typeof CSS.Translate.toString === 'function') ? CSS.Translate.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.6 : 1, 
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'shadow-lg' : ''}
      {...attributes}
      {...listeners}
    >
       {children}
     </div>
   );
        }

    React.useEffect(() => {
        function onKey(e) {
            // ignore if typing inside inputs/textareas/contenteditable
            const tag = document.activeElement.tagName;
            const isContentEditable = document.activeElement.contentEditable === 'true';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || isContentEditable) return;

            const mod  = e.metaKey || e.ctrlKey;      // Cmd ⌘  on mac, Ctrl on win/linux
            const alt  = e.altKey;                    // ⌥ / Alt
            const shft = e.shiftKey;

            /* ---------- add blocks ---------- */
            if (mod && !shft && !alt && e.key.toLowerCase() === 'h') {
            addSection('heading');                  // Cmd/Ctrl + H
            return e.preventDefault();
            }
            
            if (mod && !shft && !alt && e.key.toLowerCase() === 'f') {
            addSection('folder');                   // Cmd/Ctrl + F
            return e.preventDefault();
            }

            /* ---------- rename ---------- */
            if (!mod && !shft && !alt && e.key === 'Enter' && !editingId) {
            setEditingId(activeSection);                    // starts inline edit
            const cur = sections.find((s) => s.id === activeSection);
            setDraftLabel(cur?.content ?? '');
            return;
            }

            /* ---------- delete ---------- */
            if (mod && !alt && (e.key === 'Backspace' || e.key === 'Delete')) {
            deleteSection(activeSection);
            return e.preventDefault();
            }
            
            /* ---------- move out of folder (Cmd/Ctrl + Shift + ↑) ---------- */
            if (mod && shft && e.key === 'ArrowUp') {
            const cur = sections.find((s) => s.id === activeSection);
            if (cur && cur.parent) {
                updateSection(activeSection, { parent: null });
            }
            return e.preventDefault();
            }

            /* ---------- move up / down (Cmd/Ctrl + Alt + ↑/↓) ---------- */
            if (mod && alt && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            swapWithNeighbor(e.key === 'ArrowUp' ? 'up' : 'down');
            return e.preventDefault();
            }

            /* ---------- collapse / expand ---------- */
                if (!mod && alt && e.key === 'ArrowLeft') {            // Option / Alt  +  ←
                  toggleCollapse(activeSection);
                  return e.preventDefault();
                }
                if (!mod && alt && e.key === 'ArrowRight') {           // Option / Alt  +  →
                  const sec = sections.find((s) => s.id === activeSection);
                  if (sec?.collapsed) toggleCollapse(activeSection);
                  return e.preventDefault();
                }

            /* ---------- plain navigation (↑ / ↓) ---------- */
            if (!mod && !alt && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            const flat = sections;                   // simple linear nav (visible-only nav skipped for brevity)
            const idx  = flat.findIndex((s) => s.id === activeSection);
            const next = flat[idx + (e.key === 'ArrowDown' ? 1 : -1)];
            if (next) setActiveSection(next.id);
            return e.preventDefault();
            }

            /* ---------- new sibling below ---------- */
            if (mod && !shft && e.key === 'Enter') {
            const cur = sections.find((s) => s.id === activeSection);
            if (!cur) return;
            addSiblingBelow(cur.type);
            return e.preventDefault();
            }
        }

        const debounce = (func, delay) => {
          let timeout;
          return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
          };
        };

        const debouncedOnKey = debounce(onKey, 200);
        window.addEventListener('keydown', debouncedOnKey);
        return () => window.removeEventListener('keydown', debouncedOnKey);
        }, [
        sections,
        activeSection,
        editingId,
        addSection,
        deleteSection,
        reorderSections,
        toggleCollapse,
        setActiveSection,
        setEditingId,
        updateSection,
            ]);

        /* ---------- keyboard helpers ---------- */
        function siblingsOf(id) {
        const cur = sections.find((s) => s.id === id);
        return cur ? sections.filter((x) => x.parent === cur.parent) : [];
        }

        function swapWithNeighbor(dir) {
        const sibs = siblingsOf(activeSection);
        const idx  = sibs.findIndex((s) => s.id === activeSection);
        const neighbor = dir === 'up' ? sibs[idx - 1] : sibs[idx + 1];
        if (neighbor) reorderSections(activeSection, neighbor.id);
        }

        function addSiblingBelow(type) {
        addSection(type, sections.find((s) => s.id === activeSection)?.parent);
        }
// Removed unused wrapperIndent variable
 /* ---------- one row + its (optional) children ---------- */
const renderSection = (section, depth = 0, inPinned = false) => {
  // don't render pinned items twice
  if (!inPinned && depth === 0 && section.pinned) return null;
// inside renderSection(...)
const INDENT = 16;  // px per nesting level
const indentUnit   = 16;   // how much each extra level nests
const baseIndent   = 24;   // the left padding of an H1 row (px-6 → 24px)
const wrapperIndent = baseIndent + depth * indentUnit;


  const children    = getChildSections(section.id);
  const hasChildren = children.length > 0;

  return (
    <motion.div
      key={section.id}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* ───────── ROW ───────── */}
      <div
        className={cn(
          `flex w-full items-center group
            py-2 px-4
            ${hasChildren && !section.collapsed
              ? 'rounded-t-md rounded-b-none mb-0'
              : 'rounded-md mb-2'}
            cursor-pointer transition-all duration-150`,
            section.type === 'folder' 
              ? `shadow-sm ${getFolderStyling(section).classes}` 
              : 'bg-white shadow-sm',
            activeSection === section.id
              ? section.type === 'folder' 
                ? 'ring-2 ring-opacity-40'
                : 'bg-[#F9F7F5] ring-2 ring-accent/40'
              : section.type === 'folder'
                ? 'hover:brightness-95'
                : 'hover:bg-[#FCFAF9] text-earth-700'
          )}
          style={section.type === 'folder' ? getFolderStyling(section).style : {}}
          onClick={() => setActiveSection(section.id)}
        >

        <GripVertical
          size={14}
          className="text-earth-700 opacity-0 group-hover:opacity-100 transition-opacity mr-1 cursor-grab"
        />

        {/* collapse/expand */}
        {hasChildren && (
          <button
            className="p-1 mr-1 hover:bg-earth-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(section.id);
            }}
          >
            {section.collapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
        )}

        {/* type icon */}
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditingId(section.id);
            setDraftLabel(section.content);
          }}
          className="flex items-center gap-1"
        >
          {SectionIcon(section.type, section.collapsed, section)}
          {/* Show folder indicator if item is inside a folder */}
          {section.parent && depth === 0 && (
            <span className="text-xs text-blue-500 bg-blue-100 px-1 rounded" title="Inside folder">
              📁
            </span>
          )}
        </div>

        {/* label or inline edit */}
        {editingId === section.id && (section.type === 'heading' || section.type === 'subheading' || section.type === 'folder') ? (
          <input
            autoFocus
            spellCheck={false}
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            onBlur={() => commitRename(section.id)}
            onKeyDown={(e) => {
             if (e.key === 'Enter') {
               e.preventDefault();
               e.stopPropagation();
               commitRename(section.id);
             }
             if (e.key === "Escape") {
               if (['Enter', 'Escape'].includes(e.key)) {
                 e.stopPropagation();
               }
               setEditingId(null);
             }
           }}
            className={cn(
              "ml-3 flex-1 bg-transparent focus:outline-none",
              depth === 0
                ? "text-[15px] font-medium"
                : depth === 1
                ? "text-[14px]"
                : "text-[13px]"
            )}
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              if (section.type === 'heading' || section.type === 'subheading' || section.type === 'folder') {
                e.stopPropagation();
                setEditingId(section.id);
                setDraftLabel(section.content);
              }
            }}
            className={cn(
              "ml-2 truncate flex-1 flex items-center gap-2",
              depth === 0
                ? "text-[15px] font-medium"
                : depth === 1
                ? "text-[14px]"
                : "text-[13px]",
              section.type === 'folder' ? "text-earth-600 italic" : ""
            )}
          >
            <span className="truncate">
              {stripHtml(section.content, section.type) || `New ${section.type}`}
            </span>
            {/* Item count badge for folders */}
            {section.type === 'folder' && section.showBadge !== false && (
              <span className="bg-white/80 text-xs px-1.5 py-0.5 rounded-full text-earth-600 font-normal shrink-0">
                {getChildSections(section.id).length}
              </span>
            )}
          </span>
        )}

        {/* toolbar (add/delete buttons) */}
        {editingId !== section.id && (
          <div className="ml-auto hidden group-hover:flex items-center gap-2 pointer-events-none">
            {/* Move out of folder button - only show if item is in a folder */}
            {section.parent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateSection(section.id, { parent: null });
                }}
                className="p-1 rounded hover:bg-blue-50 pointer-events-auto"
                title="Move to root level (Cmd+Shift+↑)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </button>
            )}

            {/* Folder customization button - only show for folders */}
            {section.type === 'folder' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFolderCustomize(section);
                }}
                className="p-1 rounded hover:bg-purple-50 pointer-events-auto"
                title="Customize folder appearance"
              >
                <Settings size={16} className="text-purple-600" />
              </button>
            )}
            
            {/* pin */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePin(section.id);
              }}
              className="p-1 rounded hover:bg-peach-50 pointer-events-auto"
            >
              <Star
                size={18}
                className={section.pinned ? "text-accent" : "text-[#8A6F53]"}
                fill={section.pinned ? "currentColor" : "none"}
              />
            </button>

            {/* delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSection(section.id);
              }}
              className="p-1 rounded hover:bg-peach-50 pointer-events-auto"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* ───────── CHILDREN ───────── */}
      {hasChildren && !section.collapsed && editingId !== section.id && (
        <div className="relative w-full mb-2 bg-white rounded-b-md shadow-sm">
          {/* guide only spans real content */}
          <span className="absolute left-6 top-4 bottom-4 w-px bg-[#D6C4B3]" />

          {/* inner padding & vertical gutters */}
          <div className="pl-10 pr-4 py-4 space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={rectIntersection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={children.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {children.map((c) => (
                  <SortableRow key={c.id} id={c.id}>
                    {renderSection(c, depth + 1)}
                  </SortableRow>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}
    </motion.div>
  );
};


// close the inline editor any time the user selects a new section
  React.useEffect(() => {
    setEditingId(null);
  }, [activeSection]);  

  /* ---------- sidebar wrapper ---------- */
  return (
    <div className="sm:w-[280px] md:w-[320px] lg:w-[360px] flex-shrink-0 bg-[#F7EDE2] px-4 py-6 overflow-y-auto sidebar-scroll border-r border-[#E8DFD6]">
      {/* header row */}
     {/* ---------- header row ---------- */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[22px] font-serif font-semibold text-earth-700 mb-3">
          Sections
        </h2>

        <div className="flex gap-2 mt-1">
          {/* AI Assistant */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-md bg-purple-500/40 hover:bg-purple-500/60 inline-flex items-center justify-center shadow-sm transition duration-150"
            onClick={() => window.open('/ai-assistant', '_blank')}
            title="AI Assistant - Summarize & Create Flashcards"
          >
            <Brain size={14} className="text-purple-700" />
          </motion.button>

          {/* Folder - Organization creator */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-md bg-blue-500/40 hover:bg-blue-500/60 inline-flex items-center justify-center shadow-sm transition duration-150"
            onClick={() => addSection('folder')}
            title="Add folder (organize your notes)"
          >
            <FolderPlus size={14} className="text-blue-700" />
          </motion.button>

          {/* H1 - Primary section creator */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-md bg-accent/40 hover:bg-accent/60 inline-flex items-center justify-center shadow-sm transition duration-150"
            onClick={() => addSection('heading')}
            title="Add heading"
          >
            <Heading1 size={14} />
          </motion.button>
        </div>
      </div>


    {/* pinned sections */}
    {pinnedSections.length > 0 && (
    <div className="mb-6">
        <h3 className="flex items-center text-[17px] font-serif font-medium mb-4 text-earth-700">
          <Pin size={16} className="mr-2 text-light-brown" />
          Pinned
        </h3>

        {pinnedSections.map((sec) => (
          <SortableRow key={sec.id} id={sec.id}>
            {renderSection(sec, 0, true)}   {/* ← tell it we're in Pinned */}
          </SortableRow>
        ))}

        {/* divider */}
        <hr className="mt-6 border-t border-[#EADFD4]" />
      </div>
    )}

    
      {/* list */}
        <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        >
        <RootDropZone>
          <SortableContext
              items={rootSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
          >
              {rootSections.map((sec) => (
              <SortableRow key={sec.id} id={sec.id}>
                  {renderSection(sec, 0)}
              </SortableRow>
              ))}
          </SortableContext>

          {/* empty-state message stays outside SortableContext */}
          {/* Empty state with folder hint */}
          {rootSections.length === 0 && (
            <div className="text-center py-12">
              <div className="text-earth-500 text-sm mb-3">No sections yet</div>
              <div className="text-earth-400 text-xs mb-4">
                Add your first heading or note above
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <FolderPlus className="mx-auto mb-2 text-blue-600" size={24} />
                <p className="text-blue-700 text-sm font-medium mb-1">💡 Tip: Use Folders</p>
                <p className="text-blue-600 text-xs">
                  Create folders to organize your notes.<br/>
                  Drag any section into a folder to organize it!<br/>
                  <strong>Drag items to empty space to remove from folders.</strong>
                </p>
              </div>
            </div>
          )}
        </RootDropZone>
        </DndContext>

        {/* Folder Customizer Modal */}
        {customizingFolder && (
          <FolderCustomizer
            folder={customizingFolder}
            onSave={handleCustomizationSave}
            onCancel={handleCustomizationCancel}
          />
        )}

    </div>
  );
}

// Utility to strip HTML tags
function stripHtml(html, type) {
  if (!html) return '';
  if (typeof html === 'string') {
    return html.replace(/<[^>]+>/g, '').trim();
  }
  switch (type) {
    case 'table':
      return 'Table';
    case 'image':
      return 'Image';
    case 'icon':
      return 'Icon';
    case 'banner':
      return 'Banner';
    default:
      return '';
  }
}