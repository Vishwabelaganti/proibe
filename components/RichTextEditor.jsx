// components/RichTextEditor.jsx
import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  SplitSquareVertical,
  Indent,
  Outdent,
  Superscript,
  Subscript,
  Calculator,
  Omega,
} from 'lucide-react';

const FONT_SIZES = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '20px' },
  { label: 'X-Large', value: '28px' },
];
const FONT_FAMILIES = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
  { label: 'Playfair', value: 'Playfair Display, serif' },
];

const COLORS = [
  '#2d1c0f', '#a67c52', '#bfae9b', '#4A3B2F', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#000000', '#ffffff'
];

const MATH_SYMBOLS = {
  'Greek Letters': [
    { symbol: 'α', name: 'alpha' },
    { symbol: 'β', name: 'beta' },
    { symbol: 'γ', name: 'gamma' },
    { symbol: 'δ', name: 'delta' },
    { symbol: 'ε', name: 'epsilon' },
    { symbol: 'ζ', name: 'zeta' },
    { symbol: 'η', name: 'eta' },
    { symbol: 'θ', name: 'theta' },
    { symbol: 'ι', name: 'iota' },
    { symbol: 'κ', name: 'kappa' },
    { symbol: 'λ', name: 'lambda' },
    { symbol: 'μ', name: 'mu' },
    { symbol: 'ν', name: 'nu' },
    { symbol: 'ξ', name: 'xi' },
    { symbol: 'π', name: 'pi' },
    { symbol: 'ρ', name: 'rho' },
    { symbol: 'σ', name: 'sigma' },
    { symbol: 'τ', name: 'tau' },
    { symbol: 'υ', name: 'upsilon' },
    { symbol: 'φ', name: 'phi' },
    { symbol: 'χ', name: 'chi' },
    { symbol: 'ψ', name: 'psi' },
    { symbol: 'ω', name: 'omega' },
    { symbol: 'Α', name: 'Alpha' },
    { symbol: 'Β', name: 'Beta' },
    { symbol: 'Γ', name: 'Gamma' },
    { symbol: 'Δ', name: 'Delta' },
    { symbol: 'Θ', name: 'Theta' },
    { symbol: 'Λ', name: 'Lambda' },
    { symbol: 'Π', name: 'Pi' },
    { symbol: 'Σ', name: 'Sigma' },
    { symbol: 'Φ', name: 'Phi' },
    { symbol: 'Ψ', name: 'Psi' },
    { symbol: 'Ω', name: 'Omega' }
  ],
  'Mathematical Operators': [
    { symbol: '±', name: 'plus-minus' },
    { symbol: '∓', name: 'minus-plus' },
    { symbol: '×', name: 'multiplication' },
    { symbol: '÷', name: 'division' },
    { symbol: '∞', name: 'infinity' },
    { symbol: '∑', name: 'summation' },
    { symbol: '∏', name: 'product' },
    { symbol: '∫', name: 'integral' },
    { symbol: '∮', name: 'contour integral' },
    { symbol: '∂', name: 'partial derivative' },
    { symbol: '∇', name: 'nabla' },
    { symbol: '√', name: 'square root' },
    { symbol: '∛', name: 'cube root' },
    { symbol: '∜', name: 'fourth root' },
    { symbol: '∝', name: 'proportional to' },
    { symbol: '≈', name: 'approximately equal' },
    { symbol: '≠', name: 'not equal' },
    { symbol: '≤', name: 'less than or equal' },
    { symbol: '≥', name: 'greater than or equal' },
    { symbol: '≪', name: 'much less than' },
    { symbol: '≫', name: 'much greater than' },
    { symbol: '∈', name: 'element of' },
    { symbol: '∉', name: 'not element of' },
    { symbol: '⊂', name: 'subset of' },
    { symbol: '⊃', name: 'superset of' },
    { symbol: '⊆', name: 'subset or equal' },
    { symbol: '⊇', name: 'superset or equal' },
    { symbol: '∪', name: 'union' },
    { symbol: '∩', name: 'intersection' },
    { symbol: '∅', name: 'empty set' }
  ],
  'Arrows & Logic': [
    { symbol: '→', name: 'right arrow' },
    { symbol: '←', name: 'left arrow' },
    { symbol: '↑', name: 'up arrow' },
    { symbol: '↓', name: 'down arrow' },
    { symbol: '↔', name: 'left-right arrow' },
    { symbol: '⇒', name: 'implies' },
    { symbol: '⇐', name: 'implied by' },
    { symbol: '⇔', name: 'if and only if' },
    { symbol: '∀', name: 'for all' },
    { symbol: '∃', name: 'there exists' },
    { symbol: '∄', name: 'there does not exist' },
    { symbol: '∧', name: 'logical and' },
    { symbol: '∨', name: 'logical or' },
    { symbol: '¬', name: 'logical not' },
    { symbol: '⊕', name: 'exclusive or' },
    { symbol: '⊤', name: 'top' },
    { symbol: '⊥', name: 'bottom' }
  ],
  'Geometry & Misc': [
    { symbol: '°', name: 'degree' },
    { symbol: '′', name: 'prime' },
    { symbol: '″', name: 'double prime' },
    { symbol: '∠', name: 'angle' },
    { symbol: '∟', name: 'right angle' },
    { symbol: '⊥', name: 'perpendicular' },
    { symbol: '∥', name: 'parallel' },
    { symbol: '≅', name: 'congruent' },
    { symbol: '∼', name: 'similar' },
    { symbol: '⌀', name: 'diameter' },
    { symbol: '℅', name: 'care of' },
    { symbol: '№', name: 'numero' },
    { symbol: '©', name: 'copyright' },
    { symbol: '®', name: 'registered' },
    { symbol: '™', name: 'trademark' },
    { symbol: '§', name: 'section' },
    { symbol: '¶', name: 'paragraph' }
  ]
};

/* ─── main editor component ───────────────────────────────── */
export default function RichTextEditor({ content, onChange, type = 'text' }) {
  const editorRef = useRef(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [fontFamily, setFontFamily] = useState('');
  const [fontSize, setFontSize] = useState('16px');
  const [color, setColor] = useState('#000000');
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [activeSymbolCategory, setActiveSymbolCategory] = useState('Greek Letters');

  useEffect(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      // Only update if content is significantly different (avoid cursor jumps)
      if (content !== currentContent && content !== undefined) {
        // Save current selection
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        editorRef.current.innerHTML = content || '';
        
        // Try to restore selection if it was at the end
        if (range && editorRef.current.textContent.length > 0) {
          try {
            const newRange = document.createRange();
            newRange.selectNodeContents(editorRef.current);
            newRange.collapse(false); // Move to end
            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch (e) {
            // Ignore selection restoration errors
          }
        }
      }
    }
  }, [content]);

  // Close symbol picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSymbolPicker && editorRef.current && !editorRef.current.closest('.relative').contains(event.target)) {
        setShowSymbolPicker(false);
      }
    };

    if (showSymbolPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSymbolPicker]);

  const handleEditorKeydown = (e) => {
    // Always stop propagation to prevent sidebar navigation
    e.stopPropagation();
    
    // Handle keyboard shortcuts with Ctrl/Cmd
    if (e.ctrlKey || e.metaKey) {
      // Symbol picker toggle: Ctrl/Cmd + M
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setShowSymbolPicker(!showSymbolPicker);
        return;
      }
      
      // Superscript: Ctrl/Cmd + Shift + P
      if (e.shiftKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        applySuperscript();
        return;
      }
      
      // Subscript: Ctrl/Cmd + Shift + L
      if (e.shiftKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        applySubscript();
        return;
      }
    }
    
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const indentText = e.shiftKey ? '' : '    '; // 4 spaces for indent, nothing for outdent
        
        if (e.shiftKey) {
          // Shift+Tab: Simple outdent - remove spaces at cursor
          const textBefore = range.startContainer.textContent.substring(0, range.startOffset);
          if (textBefore.endsWith('    ')) {
            range.setStart(range.startContainer, range.startOffset - 4);
            range.deleteContents();
          }
        } else {
          // Tab: Simple indent
          range.deleteContents();
          const textNode = document.createTextNode(indentText);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      // Defer input handling to avoid conflicts
      setTimeout(() => handleInput(), 0);
      return;
    }

    // For other keys, let the browser handle them naturally
    // Only handle input after the key event completes
    if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete') {
      setTimeout(() => handleInput(), 0);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      // Only call onChange if content actually changed
      if (newContent !== content) {
        onChange(newContent);
      }
    }
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString();
    setSelectedText(text);
    setIsToolbarVisible(true);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    
    // Ensure formatting is applied consistently
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && command === 'fontName') {
      setFontFamily(value);
    } else if (command === 'fontSize') {
      const sizeValue = FONT_SIZES[value - 1]?.value;
      if (sizeValue) {
        setFontSize(sizeValue);
      }
    } else if (command === 'foreColor') {
      setColor(value);
    }
    
    handleInput();
  };

  // Superscript function
  const applySuperscript = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const selectedText = selection.toString();
      if (selectedText) {
        const supHTML = `<sup style="font-size: 0.8em; vertical-align: super;">${selectedText}</sup>`;
        document.execCommand('insertHTML', false, supHTML);
      } else {
        const supHTML = `<sup style="font-size: 0.8em; vertical-align: super;">superscript</sup>`;
        document.execCommand('insertHTML', false, supHTML);
      }
    }
    handleInput();
  };

  // Subscript function
  const applySubscript = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const selectedText = selection.toString();
      if (selectedText) {
        const subHTML = `<sub style="font-size: 0.8em; vertical-align: sub;">${selectedText}</sub>`;
        document.execCommand('insertHTML', false, subHTML);
      } else {
        const subHTML = `<sub style="font-size: 0.8em; vertical-align: sub;">subscript</sub>`;
        document.execCommand('insertHTML', false, subHTML);
      }
    }
    handleInput();
  };

  // Math expression function
  const insertMathExpression = () => {
    const mathHTML = `
      <div class="math-expression" style="display: inline-block; padding: 4px 8px; margin: 2px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; font-family: 'Times New Roman', serif; font-style: italic; color: #495057;">
        <span contenteditable="true" onkeydown="event.stopPropagation()" style="outline: none; background: transparent;">x² + y² = z²</span>
      </div>
    `;
    insertHTML(mathHTML);
  };

  // Symbol insertion function
  const insertSymbol = (symbol) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Ensure we're in the editor
      const editor = editorRef.current;
      if (!editor.contains(range.commonAncestorContainer)) {
        // If selection is outside editor, place at end
        range.selectNodeContents(editor);
        range.collapse(false);
      }
      
      // Insert the symbol as a text node
      const textNode = document.createTextNode(symbol);
      range.insertNode(textNode);
      
      // Move cursor after the inserted symbol
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Focus back to editor
      editor.focus();
      
      // Trigger content change
      handleInput();
    }
    
    // Close symbol picker
    setShowSymbolPicker(false);
  };

  const insertHTML = (html) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Ensure we have a clean insertion point
      const editor = editorRef.current;
      if (!editor.contains(range.commonAncestorContainer)) {
        // If selection is outside editor, place at end
        range.selectNodeContents(editor);
        range.collapse(false);
      }
      
      // Clear the range
      range.deleteContents();
      
      // Create element from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html.trim();
      
      // Insert each element
      const elements = Array.from(tempDiv.children);
      let lastElement = null;
      
      elements.forEach(element => {
        range.insertNode(element);
        range.setEndAfter(element);
        lastElement = element;
      });
      
      if (lastElement) {
        // Position cursor after the inserted content
        range.setStartAfter(lastElement);
        range.collapse(true);
        
        // Focus the editable element within the inserted content if it exists
        const editableElement = lastElement.querySelector('[contenteditable="true"]');
        if (editableElement) {
          setTimeout(() => {
            editableElement.focus();
            const newRange = document.createRange();
            newRange.selectNodeContents(editableElement);
            newRange.collapse(true);
            const newSelection = window.getSelection();
            newSelection.removeAllRanges();
            newSelection.addRange(newRange);
          }, 0);
        } else {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
    handleInput();
  };

  const insertCodeBlock = () => {
    const codeHTML = `
      <pre class="bg-earth-100 rounded-lg p-4 my-2 overflow-x-auto" style="white-space: pre-wrap; word-wrap: break-word; overflow-wrap: anywhere; background-color: #2d3748; border-radius: 8px; padding: 16px; margin: 8px 0;">
        <code contenteditable="true" class="text-earth-800 font-mono text-sm" onkeydown="event.stopPropagation()" style="white-space: pre-wrap; word-wrap: break-word; color: #ffffff; background: transparent; font-family: 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', monospace;">// Your code here</code>
      </pre>
    `;
    insertHTML(codeHTML);
  };

  const insertQuote = () => {
    const quoteHTML = `
      <blockquote class="border-l-4 border-accent pl-4 my-1 italic text-earth-600" style="margin: 4px 0; padding: 4px 0 4px 12px; border-left: 4px solid #8A6F53; font-style: italic; color: #6b5b47;">
        <p contenteditable="true" onkeydown="event.stopPropagation()" style="margin: 0; padding: 0; font-style: italic; line-height: 1.4;">Your quote here...</p>
      </blockquote>
    `;
    insertHTML(quoteHTML);
  };

  const handleIndent = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const indentText = '    '; // 4 spaces
      range.deleteContents();
      const textNode = document.createTextNode(indentText);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      handleInput();
    }
  };

  const handleOutdent = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent;
        const newText = text.replace(/(^|\n)(    |\t)/, '$1');
        if (newText !== text) {
          textNode.textContent = newText;
          const newOffset = Math.max(0, range.startOffset - (text.length - newText.length));
          range.setStart(textNode, newOffset);
          range.setEnd(textNode, newOffset);
          selection.removeAllRanges();
          selection.addRange(range);
          handleInput();
        }
      }
    }
  };

  const ToolbarButton = ({ onClick, icon: Icon, title, isActive = false }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-earth-100 transition-colors ${
        isActive ? 'bg-earth-200 text-accent' : 'text-earth-600'
      }`}
      title={title}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="relative">
      {/* Full Toolbar */}
      <div className="flex flex-wrap gap-1 mb-2 items-center bg-white border border-earth-200 rounded-lg p-2 shadow-sm sticky top-0 z-10 w-full max-w-full overflow-x-auto">
        <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} title="Bold" isActive={document.queryCommandState('bold')} />
        <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} title="Italic" isActive={document.queryCommandState('italic')} />
        <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} title="Underline" isActive={document.queryCommandState('underline')} />
        <ToolbarButton onClick={applySuperscript} icon={Superscript} title="Superscript" />
        <ToolbarButton onClick={applySubscript} icon={Subscript} title="Subscript" />
        <div className="w-px h-6 bg-earth-200 mx-1" />
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} title="Bullet List" />
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} title="Numbered List" />
        <div className="w-px h-6 bg-earth-200 mx-1" />
        <ToolbarButton onClick={handleIndent} icon={Indent} title="Indent (Tab)" />
        <ToolbarButton onClick={handleOutdent} icon={Outdent} title="Outdent (Shift+Tab)" />
        <div className="w-px h-6 bg-earth-200 mx-1" />
        <ToolbarButton onClick={insertQuote} icon={Quote} title="Quote" />
        <ToolbarButton onClick={insertCodeBlock} icon={Code} title="Code Block" />
        <ToolbarButton onClick={insertMathExpression} icon={Calculator} title="Math Expression" />
        <ToolbarButton 
          onClick={() => setShowSymbolPicker(!showSymbolPicker)} 
          icon={Omega} 
          title="Mathematical Symbols (Ctrl+M)" 
          isActive={showSymbolPicker}
        />
        <div className="w-px h-6 bg-earth-200 mx-2" />
        {/* Font family */}
        <select
          value={fontFamily}
          onChange={e => { 
            const newFont = e.target.value;
            setFontFamily(newFont); 
            execCommand('fontName', newFont);
            // Apply to current selection
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              if (!range.collapsed) {
                // Apply to selected text
                const span = document.createElement('span');
                span.style.fontFamily = newFont;
                try {
                  range.surroundContents(span);
                } catch (e) {
                  // Fallback if range spans multiple elements
                  execCommand('fontName', newFont);
                }
              }
            }
          }}
          className="rounded px-2 py-1 border border-earth-200 text-xs focus:outline-accent"
          title="Font family"
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
          ))}
        </select>
        {/* Font size */}
        <select
          value={fontSize}
          onChange={e => { 
            const newSize = e.target.value;
            setFontSize(newSize); 
            const sizeIndex = FONT_SIZES.findIndex(s => s.value === newSize) + 1;
            execCommand('fontSize', sizeIndex);
            // Apply inline style for better consistency
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              if (!range.collapsed) {
                const span = document.createElement('span');
                span.style.fontSize = newSize;
                try {
                  range.surroundContents(span);
                } catch (e) {
                  execCommand('fontSize', sizeIndex);
                }
              }
            }
          }}
          className="rounded px-2 py-1 border border-earth-200 text-xs focus:outline-accent"
          title="Font size"
        >
          {FONT_SIZES.map((s, i) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {/* Color */}
        <input
          type="color"
          value={color}
          onChange={e => { setColor(e.target.value); execCommand('foreColor', e.target.value); }}
          className="w-6 h-6 rounded border border-earth-200 ml-2"
          title="Text color"
        />
        <button
          type="button"
          className="ml-1 px-2 py-1 rounded bg-earth-100 hover:bg-earth-200 text-xs text-earth-700"
          onClick={() => execCommand('removeFormat')}
          title="Clear formatting"
        >
          Clear
        </button>
      </div>

      {/* Symbol Picker */}
      {showSymbolPicker && (
        <div className="symbol-picker border border-earth-200 rounded-lg bg-white shadow-lg p-4 mb-2">
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.keys(MATH_SYMBOLS).map(category => (
              <button
                key={category}
                onClick={() => setActiveSymbolCategory(category)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeSymbolCategory === category
                    ? 'bg-accent text-white'
                    : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 max-h-48 overflow-y-auto">
            {MATH_SYMBOLS[activeSymbolCategory].map(({ symbol, name }) => (
              <button
                key={symbol}
                onClick={() => insertSymbol(symbol)}
                className="symbol-button p-2 rounded border border-earth-200 hover:bg-earth-50 hover:border-accent transition-colors text-lg font-medium flex items-center justify-center min-h-[40px]"
                title={name}
              >
                {symbol}
              </button>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-earth-200">
            <p className="text-xs text-earth-600">Click any symbol to insert it at cursor position</p>
          </div>
        </div>
      )}

      {/* Main Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleEditorKeydown}
        onMouseUp={handleSelection}
        onKeyUp={handleSelection}
        onBlur={() => setIsToolbarVisible(false)}
        className={`prose prose-earth max-w-full w-full min-h-[120px] p-4 rounded-lg border border-earth-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent overflow-x-auto`}
        style={{ 
          lineHeight: '1.7', 
          fontSize: fontSize, 
          fontFamily: fontFamily, 
          color: color,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
        data-placeholder="Start typing..."
      />
    </div>
  );
}
