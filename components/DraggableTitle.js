import React from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useNotes } from '../context/NotesContext'

export default function DraggableTitle({ id, level, children }) {
  const { updateSection } = useNotes()

  // make the title itself draggable
  const { attributes, listeners, setNodeRef: setDragRef, transform } =
    useDraggable({ id })

  // make the whole wrapper a drop target
  const { setNodeRef: setDropRef } =
    useDroppable({
      id: `drop-${id}`,
      data: { dropTarget: id },
      onOver: ({ active, over }) => {
        // if you drag a subheading/title over a heading, reparent it
        if (active.id !== over.id && level === 'heading') {
          updateSection(active.id, { parent: id })
        }
      }
    })

  const style = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
    : undefined

  const Tag = level === 'heading' ? 'h1' : 'h2'

  const handleKeyDown = (e) => {
    // Stop propagation to prevent drag events while typing
    e.stopPropagation()
  }

  const handleMouseDown = (e) => {
    // Only allow dragging if not editing text
    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) {
      e.preventDefault()
      return
    }
  }

  return (
    <div ref={setDropRef}>
      <Tag
        ref={setDragRef}
        style={style}
        {...attributes}
        {...listeners}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onBlur={e =>
          updateSection(id, { content: e.currentTarget.textContent })
        }
        className={
          level === 'heading'
            ? 'text-2xl font-playfair font-bold cursor-grab focus:outline-none focus:cursor-text'
            : 'text-xl font-medium cursor-grab focus:outline-none focus:cursor-text'
        }
      >
        {children}
      </Tag>
    </div>
  )
}
