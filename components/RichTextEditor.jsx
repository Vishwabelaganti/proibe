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

/* ─── main editor component ───────────────────────────────── */
export default function RichTextEditor({ content, onChange, type = 'text' }) {
  const editorRef = useRef(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [fontFamily, setFontFamily] = useState('');
  const [fontSize, setFontSize] = useState('16px');
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  const handleEditorKeydown = (e) => {
    const target = e.target;
    
    // Always stop propagation to prevent sidebar navigation
    e.stopPropagation();
    
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        if (e.shiftKey) {
          // Shift+Tab: Remove indentation (outdent)
          const lineStart = range.startContainer;
          const textNode = lineStart.nodeType === Node.TEXT_NODE ? lineStart : lineStart.childNodes[range.startOffset];
          if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            const text = textNode.textContent;
            // Remove up to 4 spaces or 1 tab at the beginning of the line or after a line break
            const newText = text.replace(/(^|\n)(    |\t)/, '$1');
            if (newText !== text) {
              textNode.textContent = newText;
              // Adjust cursor position
              const newOffset = Math.max(0, range.startOffset - (text.length - newText.length));
              range.setStart(textNode, newOffset);
              range.setEnd(textNode, newOffset);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        } else {
          // Tab: Add indentation (indent)
          const indentText = '    '; // 4 spaces for indentation
          range.deleteContents();
          const textNode = document.createTextNode(indentText);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        handleInput();
      }
      return;
    }
    
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      
      // Check if we're in special elements
      const isInCode = target && (target.tagName === 'CODE' || target.closest('code'));
      const isInQuote = target && target.closest('blockquote');
      
      if (isInCode) {
        // In code blocks, insert newline character
        document.execCommand('insertText', false, '\n');
      } else {
        // In regular text, insert line break
        document.execCommand('insertLineBreak', false, null);
      }
      
      handleInput();
      return;
    }
    
    // Handle Backspace key
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      
      // If there's a text selection, let default behavior handle it
      if (!range.collapsed) {
        setTimeout(() => handleInput(), 0);
        return;
      }
      
      // Check if we're at the very start of the editor
      const editor = editorRef.current;
      if (range.startContainer === editor && range.startOffset === 0) {
        e.preventDefault(); // Don't delete if we're at the very beginning
        return;
      }
      
      // Check if we're at start of a text node after a BR
      if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset === 0) {
        const textNode = range.startContainer;
        const prevSibling = textNode.previousSibling;
        
        if (prevSibling && prevSibling.tagName === 'BR') {
          e.preventDefault();
          // Remove the BR and merge with previous line
          prevSibling.remove();
          // Position cursor at start of current text node
          range.setStart(textNode, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          handleInput();
          return;
        }
      }
      
      // For all other cases, use default backspace behavior
      setTimeout(() => handleInput(), 0);
      return;
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      
      // Maintain consistent formatting by preserving current settings
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        // If we're in a styled container, maintain the formatting
        if (container.nodeType === Node.ELEMENT_NODE || container.parentElement) {
          const element = container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;
          
          // Apply current font settings to new content
          if (fontFamily) {
            element.style.fontFamily = fontFamily;
          }
          if (fontSize) {
            element.style.fontSize = fontSize;
          }
          if (color) {
            element.style.color = color;
          }
        }
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
        <div className="w-px h-6 bg-earth-200 mx-1" />
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} title="Bullet List" />
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} title="Numbered List" />
        <div className="w-px h-6 bg-earth-200 mx-1" />
        <ToolbarButton onClick={handleIndent} icon={Indent} title="Indent (Tab)" />
        <ToolbarButton onClick={handleOutdent} icon={Outdent} title="Outdent (Shift+Tab)" />
        <div className="w-px h-6 bg-earth-200 mx-1" />
        <ToolbarButton onClick={insertQuote} icon={Quote} title="Quote" />
        <ToolbarButton onClick={insertCodeBlock} icon={Code} title="Code Block" />
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
        }}
        placeholder="Start typing..."
      />
    </div>
  );
}
