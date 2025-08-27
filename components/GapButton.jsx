// components/GapButton.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Type, Heading1, Heading2, CheckSquare, Code, Quote, Image, Table, Smile, Flag } from 'lucide-react';
import { useNotes } from '../context/NotesContext';

export default function GapButton({ parentId, beforeId = null }) {
  const { addSection } = useNotes();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isStayingVisible, setIsStayingVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const menuHeight = 280; // Approximate menu height
        
        // Check if menu would go below viewport
        const shouldShowAbove = rect.top + menuHeight > viewportHeight;
        
        setMenuPosition({
          top: shouldShowAbove ? rect.top - menuHeight / 2 : rect.top + rect.height / 2,
          left: rect.right + 8
        });
      };
      
      updatePosition();
      
      // Update position on scroll
      const handleScroll = () => updatePosition();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [isOpen]);

  // Enhanced hover management with generous delay
  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsHovered(true);
    setIsStayingVisible(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!isOpen) {
      // Add a generous delay before hiding to allow users to move to the button
      hideTimeoutRef.current = setTimeout(() => {
        setIsStayingVisible(false);
      }, 1200); // 1.2s delay for very forgiving UX
    }
  };

  // Keep button visible when menu is open
  useEffect(() => {
    if (isOpen) {
      setIsStayingVisible(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const blockTypes = [
    { type: 'text', icon: Type, label: 'Text', description: 'Start writing with plain text' },
    { type: 'heading', icon: Heading1, label: 'Heading 1', description: 'Big section heading' },
    { type: 'subheading', icon: Heading2, label: 'Heading 2', description: 'Medium section heading' },
    { type: 'table', icon: Table, label: 'Table', description: 'Create a data table' },
    { type: 'image', icon: Image, label: 'Image', description: 'Add an image from URL' },
    { type: 'icon', icon: Smile, label: 'Icon Block', description: 'Add an icon with text' },
    { type: 'banner', icon: Flag, label: 'Banner', description: 'Create a colorful banner' },
  ];

  const handleAddBlock = (type) => {
    addSection(type, parentId, beforeId);
    setIsOpen(false);
    // Keep button visible longer after adding content for better feedback
    setIsStayingVisible(true);
    setTimeout(() => setIsStayingVisible(false), 1000);
  };

  // Determine if button should be visible
  const shouldShowButton = isHovered || isOpen || isStayingVisible;

  return (
    <div
      className="relative flex items-center group transition-all duration-500"
      style={{ height: shouldShowButton ? '32px' : '4px' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Much larger invisible hover area that extends far to the left */}
      <div
        className="absolute left-0 top-0 w-64 h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ transform: 'translateX(-48px)' }}
      />
      
      {/* Plus button with enhanced visibility logic */}
      <button
        ref={buttonRef}
        className={`absolute left-0 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-earth-200 shadow-md transition-all duration-500 transform
          ${shouldShowButton ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
          hover:bg-earth-100 hover:border-accent hover:shadow-lg hover:scale-105`}
        style={{ top: '50%', transform: 'translateY(-50%)' }}
        onClick={() => setIsOpen((v) => !v)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        tabIndex={0}
        aria-label="Add block"
      >
        <Plus size={14} className="text-earth-600" />
      </button>
      {/* Gap line with enhanced visibility */}
      <div className={`w-full transition-all duration-500 ${
        shouldShowButton
          ? 'h-px bg-accent/40 shadow-sm' 
          : 'h-0 bg-transparent'
      }`}></div>
      
      {/* Block type menu with enhanced positioning */}
      {isOpen && (
        <div
          ref={menuRef}
          className="bg-white border border-earth-200 rounded-lg shadow-xl py-2 min-w-[250px] animate-menu-in"
          style={{ 
            position: 'fixed',
            zIndex: 9999,
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            transform: 'translateY(-50%)',
            filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {blockTypes.map(({ type, icon: Icon, label, description }) => (
            <button
              key={type}
              onClick={() => handleAddBlock(type)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-earth-50 transition-colors text-left group/item"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-earth-100 to-earth-50 flex items-center justify-center group-hover/item:from-accent/20 group-hover/item:to-light-brown/20 transition-colors">
                <Icon size={16} className="text-earth-600 group-hover/item:text-accent" />
              </div>
              <div>
                <div className="font-medium text-earth-800 group-hover/item:text-accent transition-colors">{label}</div>
                <div className="text-sm text-earth-500">{description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}