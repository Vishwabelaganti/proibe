// components/SectionsManager.jsx
import { useState } from 'react'
import { FaEllipsisV, FaGripVertical } from 'react-icons/fa'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// only two child types under headings or subheadings
const CHILD_TYPES = [
  { value: 'subheading', label: 'Subheading' },
  { value: 'text',       label: 'Text'       },
]

// ── Sortable wrapper for headings ─────────────────────────────────────────────
function SortableHeading({ heading, index, onDelete, onInsertChild, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: heading.id })
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      ref={setNodeRef}
      className="relative mb-6 bg-white border border-gray-200 rounded-lg"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {/* Heading header: drag-handle + label + delete menu */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span {...listeners} {...attributes} className="cursor-grab text-gray-500">
            <FaGripVertical />
          </span>
          <span className="font-semibold text-gray-800">
            Heading {index + 1}
          </span>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(o => !o)} className="p-1 hover:bg-gray-100 rounded">
            <FaEllipsisV />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow z-10">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  if (window.confirm('Delete this heading and all its children?')) {
                    onDelete(heading.id)
                  }
                }}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Delete Heading
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Children container */}
      <div className="px-6 py-4 space-y-4">{children}</div>

      {/* “+” to insert a subheading or text under this heading */}
      <InsertMenu
        onSelect={type => onInsertChild(heading.id, type)}
        options={CHILD_TYPES}
        className="absolute top-1/2 right-[-1.5rem] transform -translate-y-1/2"
      />
    </div>
  )
}

// ── Sortable wrapper for subheadings & text blocks ────────────────────────────
function SortableChild({ block, onDelete, onInsertChild, onContentChange, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id })
  const [menuOpen, setMenuOpen] = useState(false)

  // can only insert “Text” under subheadings
  const childOptions = block.type === 'subheading'
    ? [{ value: 'text', label: 'Text' }]
    : []

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="relative pl-8"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {/* label + delete menu */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
        <span className="font-medium text-gray-700">
          {block.type === 'subheading' ? 'Subheading' : 'Text'}
        </span>
        <div className="flex items-center gap-2">
          {childOptions.length > 0 && (
            <InsertMenu
              onSelect={type => onInsertChild(block.id, type)}
              options={childOptions}
              className=""
              buttonClass="p-1 hover:bg-gray-100 rounded"
            />
          )}
          <div className="relative">
            <button onClick={() => setMenuOpen(o => !o)} className="p-1 hover:bg-gray-100 rounded">
              <FaEllipsisV />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow z-10">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    if (window.confirm('Delete this block?')) {
                      onDelete(block.id)
                    }
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* only “text” blocks are editable */}
      {block.type === 'text' && (
        <div
          contentEditable
          suppressContentEditableWarning
          className="mt-2 p-2 border border-gray-200 rounded min-h-[2rem]"
          onBlur={e => onContentChange(block.id, e.currentTarget.textContent || '')}
        >
          {block.content || 'Start writing…'}
        </div>
      )}

      {/* nested children (for subheadings) */}
      {children}
    </div>
  )
}

// ── small dropdown “+” menu component ────────────────────────────────────────
function InsertMenu({ onSelect, options, className = '', buttonClass = '', children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`${className} relative`}>
      <button onClick={() => setOpen(o => !o)} className={`bg-[#E7D3C0] text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg ${buttonClass}`}>
        +
      </button>
      {open && (
        <div className="absolute -right-32 top-1/2 transform -translate-y-1/2 bg-white border rounded shadow z-10">
          {options.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setOpen(false)
                onSelect(value)
              }}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SectionsManager() {
  const [headings, setHeadings] = useState([])  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // Reorder handler: headings vs. children of a heading
  function handleDragEnd({ active, over }) {
    if (!over) return

    const a = active.id, o = over.id

    // 1) heading vs heading
    const headingIds = headings.map(h => h.id)
    if (headingIds.includes(a) && headingIds.includes(o)) {
      setHeadings(hs => arrayMove(hs, hs.findIndex(h=>h.id===a), hs.findIndex(h=>h.id===o)))
      return
    }

    // 2) child vs child *in same heading*
    const idx = headings.findIndex(h =>
      h.children?.some(c=>c.id===a) && h.children.some(c=>c.id===o)
    )
    if (idx > -1) {
      setHeadings(hs => {
        const clone = [...hs]
        const list = clone[idx].children
        clone[idx] = {
          ...clone[idx],
          children: arrayMove(
            list,
            list.findIndex(c=>c.id===a),
            list.findIndex(c=>c.id===o)
          ),
        }
        return clone
      })
    }
  }

  // Add a new heading
  function addHeading() {
    setHeadings(hs => [...hs, { id: crypto.randomUUID(), children: [] }])
  }
  // Delete a heading
  function deleteHeading(id) {
    setHeadings(hs => hs.filter(h=>h.id!==id))
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
                return { ...c, children: [...c.children, { id: crypto.randomUUID(), type:'text', content:'', children:undefined }] }
              }
              return c
            })
      }))
    )
  }

  // Delete any block by id
  function deleteBlock(id) {
    function recurse(list) {
      return list
        .filter(item => item.id !== id)
        .map(item => ({
          ...item,
          children: item.children ? recurse(item.children) : undefined
        }))
    }
    setHeadings(hs => recurse(hs))
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
      )
    }
    setHeadings(hs => recurse(hs))
  }

  return (
    <div className="p-4 bg-[#F4F1ED] rounded-lg shadow-lg w-full max-w-xl mx-auto">
      {headings.length === 0 && (
        <button onClick={addHeading} className="mb-4 px-4 py-2 bg-[#E7D3C0] rounded hover:bg-[#d6b8a3] transition">
          + Add Heading
        </button>
      )}

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
                  />
                ))}
              </SortableContext>
            </SortableHeading>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
