import React from 'react';
import {
  DndContext,
  closestCorners,
  rectIntersection,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableSection from './SortableSection'
import GapButton from './GapButton'
import { useNotes } from '../context/NotesContext'

export default function NoteEditorMinimal() {
  const {
    sections,
    activeSection,
  } = useNotes()

  const picked = sections.find((s) => s.id === activeSection) || {}
  const rootSection = sections.find((s) => s.id === activeSection)

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-soft-peach to-pale-beige overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {rootSection ? (
          <div>
            <h2>Active Section: {rootSection.content}</h2>
            <p>Type: {rootSection.type}</p>
            <GapButton parentId={rootSection.id} />
            <SortableSection
              section={rootSection}
              onSave={() => {}}
            />
          </div>
        ) : (
          <p className="text-earth-700 italic">
            Select a heading or subheading to begin editing…
          </p>
        )}
      </div>
    </div>
  );
}
