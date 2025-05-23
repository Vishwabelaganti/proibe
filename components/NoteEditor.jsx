import React from 'react'
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

export default function NoteEditor() {
  const {
    sections,
    activeSection,
    updateSection,
    reorderSections,
    getChildSections,
    setActiveSection,
  } = useNotes()

  const [draggingId, setDraggingId] = React.useState(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart({ active }) {
    setDraggingId(active.id)
  }

  function handleDragEnd({ active, over }) {
    setDraggingId(null)
    if (!active?.id || !over?.id) return

    const dragged = sections.find((s) => s.id === active.id)
    const target  = sections.find((s) => s.id === over.id)
    if (!dragged || !target) return

    // 1) onto heading → reparent
    if (target.type === 'heading' && ['subheading','text'].includes(dragged.type)) {
      updateSection(dragged.id, { parent: target.id })
      return
    }
    // 2) onto subheading → reparent text
    if (target.type === 'subheading' && dragged.type === 'text') {
      updateSection(dragged.id, { parent: target.id })
      return
    }
    // 3) same parent → reorder
    if (dragged.parent === target.parent) {
      if (dragged.id !== target.id) reorderSections(dragged.id, target.id)
      return
    }
    // 4) other → move + reorder
    updateSection(dragged.id, { parent: target.parent })
    reorderSections(dragged.id, target.id)
  }

  // pick which section to render
  const picked       = sections.find((s) => s.id === activeSection) || {}
  const rootId       = picked.type === 'text' ? picked.parent : activeSection
  const rootSection  = sections.find((s) => s.id === rootId)

  function renderTree(sectionId) {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return null

    const kids = getChildSections(section.id)

    return (
      <SortableSection
        key={section.id}
        section={section}
        onSave={(id, newContent) => {
          updateSection(id, { content: newContent })
          setActiveSection(section.id)
        }}
      >
        {/* Gap *before* each child (i.e. “in the middle”) */}
        {kids.map((child) => (
          <React.Fragment key={child.id}>
            <GapButton
              parentId={section.id}
              beforeId={child.id}
            />
            {renderTree(child.id)}
          </React.Fragment>
        ))}

        {/* one Gap at the bottom */}
        <GapButton parentId={section.id} beforeId={null} />
      </SortableSection>
    )
  }

  function collisionDetectionStrategy(args) {
    const item = sections.find((s) => s.id === draggingId)
    return item?.type !== 'heading'
      ? closestCorners(args)
      : rectIntersection(args)
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-soft-peach to-pale-beige overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {rootSection ? (
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {renderTree(rootSection.id)}
            </SortableContext>

            <DragOverlay>
              {draggingId && (
                <SortableSection
                  section={sections.find((s) => s.id === draggingId)}
                  onSave={() => {}}
                  isDraggingOverlay
                />
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <p className="text-earth-700 italic">
            Select a heading or subheading to begin editing…
          </p>
        )}
      </div>
    </div>
  )
}
