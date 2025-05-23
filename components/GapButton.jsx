// components/GapButton.jsx
import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNotes } from '../context/NotesContext'

export default function GapButton({ parentId, beforeId }) {
  const { sections, addSection, reorderSections } = useNotes()
  const [hover, setHover] = useState(false)

  // figure out what types we can insert here
  const parent = sections.find((s) => s.id === parentId) || {}
  let allowed = []
  if (parent.type === 'heading')    allowed = ['subheading', 'text']
  if (parent.type === 'subheading') allowed = ['text']
  if (!allowed.length) return null

  function handleInsert(type) {
    const newId = addSection(type, parentId)
    if (beforeId) {
      reorderSections(newId, beforeId)
    }
    setHover(false)
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`
        w-full flex items-center justify-center
        h-2 hover:h-6 transition-all duration-150
      `}
    >
      {hover && (
        <div className="flex items-center space-x-2">
          {allowed.map((type) => (
            <button
              key={type}
              onClick={() => handleInsert(type)}
              className={`
                w-6 h-6 rounded-full 
                ${type === 'subheading'
                  ? 'bg-accent/80 hover:bg-accent'
                  : 'bg-earth-700/80 hover:bg-earth-700'}
                text-white flex items-center justify-center shadow-sm
              `}
              title={`Insert ${type}`}
            >
              <Plus size={10} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
