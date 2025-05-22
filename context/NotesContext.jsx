// context/NotesContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const [sections, setSections] = useState([]);   // flat list
  const [activeSection, setActiveSection] = useState(null);

  // Initialize with one heading
  useEffect(() => {
    if (sections.length === 0) {
      const id = nanoid();
      setSections([{ id, type: 'heading', parent: null, content: '' }]);
      setActiveSection(id);
    }
  }, [sections]);

  // Add a new section of a given type, optionally under parentId
  function addSection(type = 'heading', parentId = null) {
    const id = nanoid();
    setSections(s => [
      ...s,
      { id, type, parent: parentId, content: '', collapsed: false }
    ]);
    setActiveSection(id);
  }

    
  // context/NotesContext.jsx  
    function reorderSections(sourceId, targetId) {
    setSections((prev) => {
        const source = prev.find((s) => s.id === sourceId);
        const target = prev.find((s) => s.id === targetId);
        if (!source || !target || source.parent !== target.parent) return prev; // different parents – ignore for now

        const siblings = prev.filter((s) => s.parent === source.parent);
        const others   = prev.filter((s) => s.parent !== source.parent);

        const newOrder = [...siblings]
        .sort((a, b) => (a.id === sourceId ? -1 : a.id === targetId ? 1 : 0)); // crude swap

        return [...others, ...newOrder];
    });
    }

  // Delete a section and all its descendants
  function deleteSection(id) {
    function filterOut(list) {
      return list
        .filter(sec => sec.id !== id)
        .flatMap(sec =>
          sec.parent === id
            ? []                                       // drop children
            : [sec]
        );
    }
    setSections(s => filterOut(s));
    if (activeSection === id) {
      setActiveSection(null);
    }
  }

  // Toggle collapse on a section
  function toggleCollapse(id) {
    setSections(s =>
      s.map(sec =>
        sec.id === id ? { ...sec, collapsed: !sec.collapsed } : sec
      )
    );
  }

  // Get children of a parent (or top-level when parentId=null)
  function getChildSections(parentId) {
    return sections
      .filter(sec => sec.parent === parentId)
      .sort((a,b) => 0); // optional: define an order
  }

  // Update content or type
  function updateSection(id, data) {
    setSections(s =>
      s.map(sec => (sec.id === id ? { ...sec, ...data } : sec))
    );
  }
  function reorderSections(sourceId, targetId) {
    // only swap if the two sections share the same parent
    setSections((prev) => {
        const source = prev.find((s) => s.id === sourceId);
        const target = prev.find((s) => s.id === targetId);
        if (!source || !target || source.parent !== target.parent) return prev;

        const siblings = prev.filter((s) => s.parent === source.parent);
        const others   = prev.filter((s) => s.parent !== source.parent);

        const newOrder = [...siblings];
        const srcIdx   = newOrder.findIndex((s) => s.id === sourceId);
        const tgtIdx   = newOrder.findIndex((s) => s.id === targetId);

        // swap the two indices
        [newOrder[srcIdx], newOrder[tgtIdx]] = [newOrder[tgtIdx], newOrder[srcIdx]];

        return [...others, ...newOrder];
    });
    }
    function togglePin(id) {
        setSections(s =>
        s.map(sec =>
            sec.id === id ? { ...sec, pinned: !sec.pinned } : sec
        )
        );
    }
  return (
    <NotesContext.Provider
      value={{
        sections,
        activeSection,
        addSection,
        deleteSection,
        toggleCollapse,
        getChildSections,
        updateSection,
        togglePin,  
        reorderSections,
        setActiveSection,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be inside NotesProvider');
  return ctx;
}
