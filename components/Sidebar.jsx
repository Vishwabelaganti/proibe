import React from 'react';
import {
  Plus,
  Heading1,
  Heading2,
  AlignLeft,
  Trash2,
  ChevronDown,
  ChevronRight,
  Star,
} from 'lucide-react';

import { motion } from 'framer-motion';
import { useNotes } from '../context/NotesContext';
import { cn } from '../utils/cn';          // helper to join classes
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function Sidebar() {
  const {
    sections,
    addSection,
    deleteSection,
    activeSection,
    setActiveSection,
    toggleCollapse,
    getChildSections,
    togglePin,
    updateSection,
    reorderSections,
  } = useNotes();
  const pinnedSections = sections.filter((s) => s.pinned);
  const rootSections = getChildSections(null);
  const [editingId, setEditingId]   = React.useState(null);      // which row is in edit-mode
  const [draftLabel, setDraftLabel] = React.useState('');        // live input text
  const [openedDuringDrag, setOpenedDuringDrag] = React.useState([]);  // stores parent ids we auto-opened
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    function handleDragEnd(event) {
    const { active, over } = event;
    if (active?.id && over?.id && active.id !== over.id) {
        reorderSections(active.id, over.id);
    }
     // close any parents we auto-opened
    openedDuringDrag.forEach((id) => toggleCollapse(id));
    setOpenedDuringDrag([]);
    }

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
  
  function allowedChildTypes(type) {
  if (type === 'heading')      return ['subheading', 'text'];
  if (type === 'subheading')   return ['text'];
  return [];                   // text nodes can’t have children
}
  const SectionIcon = (type) => {
    switch (type) {
      case 'heading':
        return <Heading1 className="h-4 w-4 text-earth-700" />;
      case 'subheading':
        return <Heading2 className="h-4 w-4 text-earth-700" />;
      case 'text':
        return <AlignLeft className="h-4 w-4 text-earth-700" />;
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
    transform: CSS.Translate.toString(transform),
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
            // ignore if typing inside inputs/textareas
            const tag = document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            const mod  = e.metaKey || e.ctrlKey;      // Cmd ⌘  on mac, Ctrl on win/linux
            const alt  = e.altKey;                    // ⌥ / Alt
            const shft = e.shiftKey;

            /* ---------- add blocks ---------- */
            if (mod && !shft && !alt && e.key.toLowerCase() === 'h') {
            addSection('heading');                  // Cmd/Ctrl + H
            return e.preventDefault();
            }
            if (mod && shft && !alt && e.key.toLowerCase() === 'h') {
            // inside selected heading if possible
            const parent = activeSection
                ? sections.find((s) => s.id === activeSection)
                : null;
            if (parent?.type === 'heading' && parent.collapsed) toggleCollapse(parent.id);
            addSection('subheading', parent?.type === 'heading' ? parent.id : null);
            return e.preventDefault();
            }
            if (mod && !shft && !alt && e.key.toLowerCase() === 't') {
            const parent = activeSection
                ? sections.find((s) => s.id === activeSection)
                : null;
            if (parent?.collapsed) toggleCollapse(parent.id);
            addSection('text', parent?.id ?? null);
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

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
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
        const cur  = sections.find((s) => s.id === activeSection);
        if (!cur) return;
        addSection(type, cur.parent);                // append to same parent
        // then move it right after current
        const sibs  = siblingsOf(activeSection);
        const added = sibs[sibs.length - 1];         // newly appended
        reorderSections(added.id, activeSection);    // swap once to move below
        }

  const renderSection = (section, depth = 0) => {
    const children    = getChildSections(section.id);
    const hasChildren = children.length > 0;

    
    return (
        <motion.div
        key={section.id}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        >
        {/* row container */}
        <div
            style={{ paddingLeft: depth * 16 }}               /* 16 px per level */
            className={cn(
            'flex items-center group py-2 px-3 rounded-md mb-1 cursor-pointer border border-transparent',
            activeSection === section.id
                ? 'bg-earth-200 text-earth-700 ring-2 ring-earth-700/20'
                : 'hover:ring-2 hover:ring-earth-700/10 text-earth-700'
            )}
            onClick={() => setActiveSection(section.id)}
        >
            {/* caret + icon + label */}
            {hasChildren && (
            <button
                className="p-1 mr-1 hover:bg-earth-200 rounded"
                onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(section.id);
                }}
            >
                {section.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
            )}

            {SectionIcon(section.type)}
            {editingId === section.id ? (
                <input
                    className="ml-2 flex-1 bg-transparent border-b border-earth-700/40 focus:outline-none"
                    value={draftLabel}
                    autoFocus
                    onChange={(e) => setDraftLabel(e.target.value)}
                    onBlur={() => commitRename(section.id)}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(section.id);
                    if (e.key === 'Escape') setEditingId(null);
                    }}
                />
                ) : (
                <span
                    className="ml-2 truncate flex-1"
                    onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(section.id);
                    setDraftLabel(section.content);
                    }}
                >
                    {section.content || `New ${section.type}`}
                </span>
                )}
                


            {/* inline add-child + delete  (appear on hover) */}
            <div className="ml-auto hidden group-hover:flex items-center space-x-1">
                 {/* pin / unpin */}
                    <button
                    className="p-1 hover:bg-earth-200 rounded"
                    title={section.pinned ? 'Unpin' : 'Pin'}
                    onClick={(e) => {
                        e.stopPropagation();
                        togglePin(section.id);
                    }}
                    >
                    <Star
                        size={14}
                        className={section.pinned ? 'text-accent' : 'text-earth-700'}
                        fill={section.pinned ? 'currentColor' : 'none'}
                    />
                    </button>
            {allowedChildTypes(section.type).includes('subheading') && (
                <button
                className="p-1 bg-accent hover:bg-accent-hover rounded"
                title="Add subheading"
                onClick={(e) => {
                e.stopPropagation();
                if (section.collapsed) toggleCollapse(section.id);  
                addSection('subheading', section.id);                
                }}
                >
                <Heading2 size={12} className="text-earth-900" />
                </button>
            )}
            {allowedChildTypes(section.type).includes('text') && (
                <button
                className="p-1 bg-accent hover:bg-accent-hover rounded"
                title="Add text"
                onClick={(e) => {
                    e.stopPropagation();
                if (section.collapsed) toggleCollapse(section.id);   
                    addSection('text', section.id);               
                }}
                >
                <AlignLeft size={12} className="text-earth-900" />
                </button>
            )}

            {/* delete */}
            <button
                className="p-1 hover:bg-earth-200 rounded"
                title="Delete"
                onClick={(e) => {
                e.stopPropagation();
                deleteSection(section.id);
                }}
            >
                <Trash2 size={14} className="text-earth-700" />
            </button>
            </div>
        </div>

        {/* children */}
        {hasChildren && !section.collapsed && (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
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
    <div className="w-64 bg-pale-beige p-4 shadow-md overflow-y-auto sidebar-scroll">
      {/* header row */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-earth-700">Sections</h2>

        {/* add buttons */}
        <div className="flex space-x-1">
          {/* heading */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 bg-accent hover:bg-accent-hover text-earth-900 rounded-full"
            onClick={() => addSection('heading')}
            title="Add heading"
          >
            <Heading1 size={16} />
          </motion.button>

          {/* subheading */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 bg-accent hover:bg-accent-hover text-earth-900 rounded-full"
            onClick={() => {
                const parent = activeSection
                    ? sections.find((s) => s.id === activeSection)
                    : null;

                if (parent && parent.type === 'heading') {
                    if (parent.collapsed) toggleCollapse(parent.id);   // NEW
                    addSection('subheading', parent.id);
                } else {
                    addSection('subheading');
                }
                }}
            title="Add subheading"
          >
            <Heading2 size={16} />
          </motion.button>

          {/* text */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-accent hover:bg-accent-hover text-earth-900 rounded-full"
            onClick={() => {
              const parent = activeSection
                ? sections.find((s) => s.id === activeSection)
                : null;
              if (parent && (parent.type === 'heading' || parent.type === 'subheading')) {
                if (parent.collapsed) toggleCollapse(parent.id);     // NEW
                addSection('text', parent.id);
                } else {
                addSection('text');
                }
            }}
            title="Add text"
          >
            <AlignLeft size={16} />
          </motion.button>
        </div>
      </div>

    {/* pinned sections */}
    {pinnedSections.length > 0 && (
    <div className="mb-4">
        <h3 className="text-xs font-semibold text-earth-700 mb-1 tracking-wide uppercase">
        Pinned
        </h3>

        {pinnedSections.map((sec) => (
        /* pinned items reuse SortableRow so you can reorder them, depth = 0 */
        <SortableRow key={sec.id} id={sec.id}>
            {renderSection(sec, 0)}
        </SortableRow>
        ))}

        <hr className="mt-3 border-earth-200" />
    </div>
    )}
    
      {/* list */}
        <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        >
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
        {rootSections.length === 0 && (
            <div className="text-center p-4 text-earth-700">
            <Plus className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm">Add your first section</p>
            </div>
        )}
        </DndContext>


    </div>
  );
}
