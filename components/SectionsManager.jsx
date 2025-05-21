import { useState } from 'react';
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
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

// Only two child types under headings or subheadings
const CHILD_TYPES = [
  { value: 'subheading', label: 'Subheading' },
  { value: 'text', label: 'Text' },
];

// ── Sortable wrapper for headings ─────────────────────────────────────────────
function SortableHeading({ heading, index, onDelete, onInsertChild, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: heading.id });
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div
      ref={setNodeRef}
      className={`relative mb-6 group ${isDragging ? 'z-10' : ''}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`bg-white rounded-lg shadow-sm border border-transparent transition-all duration-200 ${
          isDragging ? 'scale-[1.02] shadow-md border-gray-200' : ''
        }`}
      >
        {/* Drag handle - only visible on hover */}
        <div 
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 opacity-0 transition-opacity duration-150 ${
            isHovered || isDragging ? 'opacity-80' : ''
          }`}
          {...listeners} 
          {...attributes}
        >
          <div className="w-6 h-10 flex items-center justify-center cursor-grab text-gray-400 hover:text-gray-600 hover:opacity-100">
            <GripVertical size={16} />
          </div>
        </div>

        {/* Heading content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div 
              contentEditable
              suppressContentEditableWarning
              className="text-xl font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7D3C0] rounded px-2 py-1 -ml-2"
              placeholder="New Heading..."
              onBlur={(e) => {
                // Placeholder for onContentChange logic for headings if needed
                // This would need to be passed as a prop to the component
              }}
            >
              {heading.content || `Heading ${index + 1}`}
            </div>
            
            {/* Options menu */}
            <div className="relative ml-2">
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-50"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete Heading
                  </button>
                </div>
              )}

              {/* Delete confirmation */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30">
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Delete heading?</h3>
                    <p className="text-gray-600 mb-4">
                      This will remove this heading and all its content. This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          onDelete(heading.id);
                        }}
                        className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Children container */}
          <div className="space-y-4 pt-2">{children}</div>
        </div>
      </div>

      {/* Insert button - positioned to the right */}
      <InsertMenu
        onSelect={(type) => onInsertChild(heading.id, type)}
        options={CHILD_TYPES}
        className={`absolute right-0 top-1/2 translate-x-3 -translate-y-1/2 opacity-0 transition-opacity duration-150 ${
          isHovered ? 'opacity-100' : ''
        }`}
      />
    </div>
  );
}

// ── Sortable wrapper for subheadings & text blocks ────────────────────────────
function SortableChild({ block, onDelete, onInsertChild, onContentChange, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Can only insert "Text" under subheadings
  const childOptions = block.type === 'subheading'
    ? [{ value: 'text', label: 'Text' }]
    : [];

  return (
    <div
      ref={setNodeRef}
      className={`relative group ml-4 mb-4 ${isDragging ? 'z-10' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {/* Drag handle - only visible on hover */}
      <div 
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 opacity-0 transition-opacity duration-150 ${
          isHovered || isDragging ? 'opacity-80' : ''
        }`}
        {...listeners} 
        {...attributes}
      >
        <div className="w-6 h-10 flex items-center justify-center cursor-grab text-gray-400 hover:text-gray-600 hover:opacity-100">
          <GripVertical size={16} />
        </div>
      </div>

      <div 
        className={`bg-white rounded-lg shadow-sm p-3 transition-all duration-200 ${
          isDragging ? 'scale-[1.02] shadow-md border border-gray-200' : 'border border-transparent'
        }`}
      >
        {/* Content based on block type */}
        {block.type === 'subheading' ? (
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <div 
                contentEditable
                suppressContentEditableWarning
                className="text-lg font-medium text-gray-700 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7D3C0] rounded px-2 py-1 -ml-2"
                placeholder="New Subheading..."
                onBlur={(e) => onContentChange(block.id, e.currentTarget.textContent || '')}
              >
                {block.content || 'New Subheading...'}
              </div>
              
              {/* Options menu */}
              <div className="relative ml-2">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-50"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Nested content (for subheadings) */}
            <div className="mt-2">{children}</div>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center justify-end mb-1">
              {/* Options menu for text blocks */}
              <div className="relative">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-50"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Editable text content */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="p-2 min-h-[3rem] outline-none focus:ring-2 focus:ring-[#E7D3C0] rounded text-gray-600 bg-gray-50"
              onBlur={(e) => onContentChange(block.id, e.currentTarget.textContent || '')}
              placeholder="Start writing..."
            >
              {block.content || 'Start writing...'}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Delete block?</h3>
            <p className="text-gray-600 mb-4">
              This will remove this {block.type === 'subheading' ? 'subheading and its content' : 'text block'}. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(block.id);
                }}
                className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert button for subheadings */}
      {childOptions.length > 0 && (
        <InsertMenu
          onSelect={(type) => onInsertChild(block.id, type)}
          options={childOptions}
          className={`absolute right-0 top-1/2 translate-x-3 -translate-y-1/2 opacity-0 transition-opacity duration-150 ${
            isHovered ? 'opacity-100' : ''
          }`}
        />
      )}
    </div>
  );
}

// ── Small dropdown "+" menu component ────────────────────────────────────────
function InsertMenu({ onSelect, options, className = '' }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className={`${className} relative z-10`}>
      <button 
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-[#E7D3C0] hover:bg-[#dcbea7] text-white flex items-center justify-center shadow-sm transition-colors duration-150"
      >
        <Plus size={16} />
      </button>
      
      {open && (
        <div className="absolute top-0 right-full mr-2 bg-white rounded-lg shadow-lg py-1 border border-gray-100 min-w-[120px]">
          {options.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setOpen(false);
                onSelect(value);
              }}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SectionsManager() {
  const [headings, setHeadings] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Reorder handler: headings vs. children of a heading
  function handleDragEnd({ active, over }) {
    if (!over) return;

    const a = active.id, o = over.id;

    // 1) heading vs heading
    const headingIds = headings.map(h => h.id);
    if (headingIds.includes(a) && headingIds.includes(o)) {
      setHeadings(hs => arrayMove(hs, hs.findIndex(h=>h.id===a), hs.findIndex(h=>h.id===o)));
      return;
    }

    // 2) child vs child *in same heading*
    const idx = headings.findIndex(h =>
      h.children?.some(c=>c.id===a) && h.children.some(c=>c.id===o)
    );
    if (idx > -1) {
      setHeadings(hs => {
        const clone = [...hs];
        const list = clone[idx].children;
        clone[idx] = {
          ...clone[idx],
          children: arrayMove(
            list,
            list.findIndex(c=>c.id===a),
            list.findIndex(c=>c.id===o)
          ),
        };
        return clone;
      });
    }
  }

  // Add a new heading
  function addHeading() {
    setHeadings(hs => [...hs, { id: crypto.randomUUID(), content: '', children: [] }]);
  }
  
  // Delete a heading
  function deleteHeading(id) {
    setHeadings(hs => hs.filter(h=>h.id!==id));
  }

  // Insert a child under a given parentId (heading or subheading)
  function insertChild(parentId, type) {
    setHeadings(hs =>
      hs.map(h => ({
        ...h,
        children: h.id === parentId
          ? [...(h.children||[]), { id: crypto.randomUUID(), type, content:'', children: type==='subheading'?[]:undefined }]
          : h.children?.map(c => {
              if (c.id === parentId && c.children) {
                return { ...c, children: [...c.children, { id: crypto.randomUUID(), type:'text', content:'', children:undefined }] };
              }
              return c;
            })
      }))
    );
  }

  // Delete any block by id
  function deleteBlock(id) {
    function recurse(list) {
      return list
        .filter(item => item.id !== id)
        .map(item => ({
          ...item,
          children: item.children ? recurse(item.children) : undefined
        }));
    }
    setHeadings(hs => recurse(hs));
  }

  // Update content of a text block
  function updateContent(id, content) {
    function recurse(list) {
      return list.map(item => 
        item.id === id
          ? { ...item, content }
          : item.children
            ? { ...item, children: recurse(item.children) }
            : item
      );
    }
    setHeadings(hs => recurse(hs));
  }

  return (
    <div className="p-6 bg-[#F9F4EF] rounded-lg w-full max-w-[640px] mx-auto">
      <div className="mb-6 flex justify-center">
        {headings.length === 0 && (
          <button 
            onClick={addHeading} 
            className="px-4 py-2 bg-[#E7D3C0] text-white rounded-md hover:bg-[#dcbea7] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7D3C0]"
          >
            + Add Heading
          </button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* Top-level headings */}
        <SortableContext items={headings.map(h=>h.id)} strategy={verticalListSortingStrategy}>
          {headings.map((heading, i) => (
            <SortableHeading
              key={heading.id}
              heading={heading}
              index={i}
              onDelete={deleteHeading}
              onInsertChild={insertChild}
            >
              {/* Wrap heading.children in its own SortableContext */}
              <SortableContext
                items={(heading.children||[]).map(c=>c.id)}
                strategy={verticalListSortingStrategy}
              >
                {(heading.children||[]).map(child => (
                  <SortableChild
                    key={child.id}
                    block={child}
                    onDelete={deleteBlock}
                    onInsertChild={insertChild}
                    onContentChange={updateContent}
                  >
                    {child.type === 'subheading' && child.children && (
                      <SortableContext
                        items={(child.children||[]).map(c=>c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {(child.children||[]).map(grandchild => (
                          <SortableChild
                            key={grandchild.id}
                            block={grandchild}
                            onDelete={deleteBlock}
                            onContentChange={updateContent}
                          />
                        ))}
                      </SortableContext>
                    )}
                  </SortableChild>
                ))}
              </SortableContext>
            </SortableHeading>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}