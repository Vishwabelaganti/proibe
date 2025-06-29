// context/NotesContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { nanoid } from 'nanoid';

const NotesContext = createContext();

/**
 * NotesProvider
 * -------------
 * Holds a **flat array** of section objects:
 *   {
 *     id:        string      — unique key
 *     type:      'heading' | 'subheading' | 'text' | … (you decide)
 *     parent:    string | null
 *     content:   string
 *     collapsed: boolean
 *     pinned:    boolean
 *   }
 */
export function NotesProvider({ children }) {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);

  /* ------------------------------------------------------------------ */
  /*  Bootstrap with a single empty heading on first mount              */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (sections.length === 0) {
      const id = nanoid();
      setSections([{ id, type: 'heading', parent: null, content: '' }]);
      setActiveSection(id);
    }
  }, [sections.length]);

  /* ------------------------------------------------------------------ */
  /*  Utilities                                                         */
  /* ------------------------------------------------------------------ */

  /** Add a new section, optionally nested under `parent` */
  const addSection = useCallback((type, parent = null) => {
    const id = nanoid();
    setSections((prev) => [
      ...prev,
      { id, type, parent, content: '' },
    ]);
    return id; // let caller know the new ID (handy for focusing)
  }, []);

  /** Depth-first gather of a section’s entire descendant tree */
  const collectDescendants = useCallback(
    (rootId, pool) => {
      const direct = pool.filter((s) => s.parent === rootId);
      return direct.reduce(
        (acc, child) => [...acc, child.id, ...collectDescendants(child.id, pool)],
        []
      );
    },
    []
  );

  /** Remove a section *and* every descendant */
  const deleteSection = useCallback(
    (id) => {
      setSections((prev) => {
        const toPrune = new Set([id, ...collectDescendants(id, prev)]);
        return prev.filter((s) => !toPrune.has(s.id));
      });
      if (activeSection === id) setActiveSection(null);
    },
    [activeSection, collectDescendants]
  );

  /** Collapse / expand toggle */
  const toggleCollapse = useCallback((id) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, collapsed: !s.collapsed } : s
      )
    );
  }, []);

  /** Pin / unpin toggle */
  const togglePin = useCallback((id) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  }, []);

  /** Grab direct children of a parent (or top-level if `parentId === null`) */
  const getChildSections = useCallback(
    (parentId) => sections.filter((s) => s.parent === parentId),
    [sections]
  );

  /** In-place content or property update */
  const updateSection = useCallback((id, data) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  }, []);

  /**
   * **reorderSections**
   * Swap positions of two *siblings* (same parent).
   * You’re using the flat-array trick, so order is purely the
   * order they appear in the array.
   */
  const reorderSections = useCallback((sourceId, targetId) => {
    setSections((prev) => {
      const source = prev.find((s) => s.id === sourceId);
      const target = prev.find((s) => s.id === targetId);

      // Bail if either is missing or they’re not siblings
      if (!source || !target || source.parent !== target.parent) return prev;

      const next = [...prev];
      const srcIdx = next.findIndex((s) => s.id === sourceId);
      const tgtIdx = next.findIndex((s) => s.id === targetId);

      // Swap the two items
      [next[srcIdx], next[tgtIdx]] = [next[tgtIdx], next[srcIdx]];

      return next;
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Public context API                                                */
  /* ------------------------------------------------------------------ */
  const value = {
    /* state */
    sections,
    activeSection,

    /* CRUD */
    addSection,
    deleteSection,
    updateSection,

    /* structure / view helpers */
    getChildSections,
    reorderSections,
    toggleCollapse,
    togglePin,
    setActiveSection,
  };

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
}

/* Hook wrapper for safety */
export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used inside <NotesProvider>');
  return ctx;
}
