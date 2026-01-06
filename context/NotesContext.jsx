// context/NotesContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const NotesContext = createContext();

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}

export function NotesProvider({ children }) {
  // Initialize sections from localStorage or use defaults
  const [sections, setSections] = useState(() => {
    // Check if we're in the browser (not server-side)
    if (typeof window === 'undefined') {
      // Return default sections for server-side rendering
      return [
        {
          id: 'welcome-heading',
          type: 'heading',
          content: 'Welcome to Proibe Notes',
          parent: null,
          order: 0,
          collapsed: false,
          pinned: false,
          headingColor: '#4A3B2F',
          headingFont: 'Inter, sans-serif',
          headingBold: true,
          headingItalic: false,
          headingUnderline: false
        }
      ];
    }

    try {
      const saved = localStorage.getItem('proibe-notes-sections');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate the structure
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load sections from localStorage:', error);
    }
    
    // Return default sections if no valid saved data
    return [
      {
        id: 'welcome-heading',
        type: 'heading',
        content: 'Welcome to Proibe Notes',
        parent: null,
        order: 0,
        collapsed: false,
        pinned: false,
        headingColor: '#4A3B2F',
        headingBold: true,
        headingItalic: false,
        headingUnderline: false,
        headingFont: '"Playfair Display", serif',
      },
      {
        id: 'intro-text',
        type: 'text',
        content:
          '<p>Start creating beautiful, organized notes with our Notion-inspired editor. Click on any section to begin editing, or use the sidebar to add new content blocks. effeefe</p>',
        parent: 'welcome-heading',
        order: 0,
      },
    ];
  });

  const [activeSection, setActiveSection] = useState('welcome-heading');

  // Generate unique ID for new sections
  const generateId = useCallback(() => {
    return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Helper function to save sections to localStorage
  const saveToLocalStorage = useCallback((sections) => {
    try {
      localStorage.setItem('proibe-notes-sections', JSON.stringify(sections));
    } catch (error) {
      console.error('Failed to save sections to localStorage:', error);
      if (error.name === 'QuotaExceededError') {
        alert('Storage limit reached. Please remove some images to continue.');
      }
    }
  }, []);

  // Add a new section
  const addSection = useCallback(
    (type, parentId = null, beforeId = null) => {
      const siblings = sections.filter((s) => s.parent === parentId);
      let newOrder = siblings.length;
      let insertIndex = -1;
      if (beforeId) {
        const beforeSection = siblings.find((s) => s.id === beforeId);
        if (beforeSection) {
          newOrder = beforeSection.order;
          // Find the index in the main array where beforeSection is
          insertIndex = sections.findIndex((s) => s.id === beforeId);
        }
      }
      const newSection = {
        id: generateId(),
        type,
        content: getDefaultContent(type),
        parent: parentId,
        order: newOrder,
        collapsed: false,
        pinned: false,
      };
      if (type === 'heading' || type === 'subheading') {
        newSection.headingColor = '#4A3B2F';
        newSection.headingBold = true;
        newSection.headingItalic = false;
        newSection.headingUnderline = false;
        newSection.headingFont = '"Playfair Display", serif';
      }
      if (type === 'folder') {
        newSection.collapsed = false; // Folders start expanded
        newSection.folderColor = '#3B82F6'; // Default blue color
        newSection.folderIcon = 'Folder'; // Default folder icon
        newSection.folderStyle = 'default'; // default, rounded, modern, minimal
        newSection.folderSize = 'medium'; // small, medium, large
        newSection.showBadge = true; // show item count badge
        newSection.gradientEnabled = false; // gradient background
      }
      setSections((prev) => {
        let updated = [...prev];
        // If beforeId is specified, increment order of all siblings after or at newOrder
        if (beforeId) {
          updated = updated.map((s) => {
            if (s.parent === parentId && s.order >= newOrder) {
              return { ...s, order: s.order + 1 };
            }
            return s;
          });
          // Insert at the correct index in the array
          if (insertIndex !== -1) {
            updated.splice(insertIndex, 0, newSection);
          } else {
            updated.push(newSection);
          }
        } else {
          updated.push(newSection);
        }
        // Always re-sort siblings by order
        const finalUpdated = updated.map((s) => {
          if (s.parent !== parentId) return s;
          // Recompute order for all siblings
          const sibs = updated
            .filter((x) => x.parent === parentId)
            .sort((a, b) => a.order - b.order);
          return { ...s, order: sibs.findIndex((x) => x.id === s.id) };
        });
        
        // Save to localStorage
        saveToLocalStorage(finalUpdated);
        
        return finalUpdated;
      });
      return newSection.id;
    },
    [sections, generateId, saveToLocalStorage]
  );

  // Get default content for different section types
  const getDefaultContent = (type) => {
    switch (type) {
      case 'heading':
        return 'New Heading';
      case 'subheading':
        return 'New Subheading';
      case 'text':
        return '<p>New text section. Edit me!</p>';
      case 'table':
        return {
          rows: [
            ['Header 1', 'Header 2', 'Header 3'],
            ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
            ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
          ],
          hasHeader: true,
        };
      case 'image':
        return {
          url: '',
          alt: '',
          caption: '',
          width: 'auto',
          alignment: 'center',
        };
      case 'icon':
        return {
          icon: 'Star',
          text: 'Your text here',
          size: 'medium',
          color: '#C4A484',
          layout: 'horizontal',
        };
      case 'banner':
        return {
          text: 'This is an important announcement!',
          type: 'info',
          showIcon: true,
          dismissible: false,
        };
      case 'frame':
        return {
          leftContent: {
            type: 'text',
            data: 'Left panel content...'
          },
          rightContent: {
            type: 'text', 
            data: 'Right panel content...'
          },
          splitRatio: 50,
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: '#e5e7eb'
        };
      case 'folder':
        return 'New Folder';
      default:
        return '';
    }
  };

  // Update section properties
  const updateSection = useCallback(
    (id, updates) => {
      setSections((prev) => {
        const updated = prev.map((s) => {
          if (s.id === id) {
            const newSection = { ...s, ...updates };
            
            // Validate and sanitize content based on type
            if (updates.content !== undefined) {
              switch (s.type) {
                case 'image':
                  // Ensure image content has required structure
                  if (typeof updates.content === 'object' && updates.content !== null) {
                    newSection.content = {
                      url: updates.content.url || '',
                      alt: updates.content.alt || '',
                      caption: updates.content.caption || '',
                      width: updates.content.width || 'auto',
                      alignment: updates.content.alignment || 'center'
                    };
                  }
                  break;
                case 'icon':
                  if (typeof updates.content === 'object' && updates.content !== null) {
                    newSection.content = {
                      icon: updates.content.icon || 'Star',
                      text: updates.content.text || '',
                      size: updates.content.size || 'medium',
                      color: updates.content.color || '#C4A484',
                      layout: updates.content.layout || 'horizontal'
                    };
                  }
                  break;
                case 'banner':
                  if (typeof updates.content === 'object' && updates.content !== null) {
                    newSection.content = {
                      text: updates.content.text || '',
                      type: updates.content.type || 'info',
                      showIcon: updates.content.showIcon !== false,
                      dismissible: updates.content.dismissible || false
                    };
                  }
                  break;
                case 'table':
                  if (typeof updates.content === 'object' && updates.content !== null) {
                    newSection.content = {
                      rows: updates.content.rows || [['']],
                      hasHeader: updates.content.hasHeader || false,
                      headerRows: updates.content.headerRows || []
                    };
                  }
                  break;
                default:
                  // For text and heading types, ensure content is a string
                  newSection.content = typeof updates.content === 'string' ? updates.content : String(updates.content || '');
              }
            }
            
            return newSection;
          }
          return s;
        });
        
        // Save to localStorage for persistence
        saveToLocalStorage(updated);
        
        return updated;
      });
    },
    [saveToLocalStorage]
  );

  // Delete section and its children
  const deleteSection = useCallback(
    (id) => {
      setSections((prev) => {
        const toDelete = new Set([id]);
        const collectChildren = (parentId) => {
          prev.forEach((s) => {
            if (s.parent === parentId) {
              toDelete.add(s.id);
              collectChildren(s.id);
            }
          });
        };
        collectChildren(id);
        const updated = prev.filter((s) => !toDelete.has(s.id));
        
        // Save to localStorage for persistence
        saveToLocalStorage(updated);
        
        return updated;
      });
      if (activeSection === id) setActiveSection(null);
    },
    [activeSection, saveToLocalStorage]
  );

  // Get child sections of a parent
  const getChildSections = useCallback(
    (parentId) => sections.filter((s) => s.parent === parentId).sort((a, b) => a.order - b.order),
    [sections]
  );

  // Reorder sections
  const reorderSections = useCallback(
    (draggedId, targetId) => {
      setSections((prev) => {
        const dragged = prev.find((s) => s.id === draggedId);
        const target = prev.find((s) => s.id === targetId);

        if (!dragged || !target || dragged.parent !== target.parent) return prev;

        const next = [...prev];
        const draggedIndex = next.findIndex((s) => s.id === draggedId);
        const targetIndex = next.findIndex((s) => s.id === targetId);

        // Swap the order values
        [next[draggedIndex].order, next[targetIndex].order] = [
          next[targetIndex].order,
          next[draggedIndex].order,
        ];

        const updated = next.sort((a, b) => a.order - b.order);
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [sections, saveToLocalStorage]
  );

  // Toggle section collapse
  const toggleCollapse = useCallback(
    (id) => {
      setSections((prev) => {
        const updated = prev.map((s) =>
          s.id === id ? { ...s, collapsed: !s.collapsed } : s
        );
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [saveToLocalStorage]
  );

  // Toggle section pin
  const togglePin = useCallback(
    (id) => {
      setSections((prev) => {
        const updated = prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s));
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [saveToLocalStorage]
  );

  const value = {
    sections,
    activeSection,
    setActiveSection,
    addSection,
    updateSection,
    deleteSection,
    getChildSections,
    reorderSections,
    toggleCollapse,
    togglePin,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}
