// components/RichTextEditor.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent }           from '@tiptap/react';
import StarterKit                             from '@tiptap/starter-kit';
import Underline                              from '@tiptap/extension-underline';
import TextStyle                              from '@tiptap/extension-text-style';
import Color                                  from '@tiptap/extension-color';
import TextAlign                              from '@tiptap/extension-text-align';
import {
  Bold, Italic, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Undo, Redo,
  Palette, Type as FontIcon,
} from 'lucide-react';
import { cn }                                 from '../utils/cn';
import { Placeholder } from '@tiptap/extension-placeholder';
import FontFamily from '@tiptap/extension-font-family';

/* ─── tiny button helper ───────────────────────────────── */
const ToolBtn = ({ active, onClick, children, title }) => (
  <button
    title={title}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={cn(
      'h-6 w-6 grid place-content-center rounded text-[10px]',
      'hover:bg-light-brown/20',
      active && 'bg-light-brown/30'
    )}
  >
    {children}
  </button>
);
const Divider = () => <div className="h-6 w-px bg-light-brown/30 mx-1" />;

/* ─── main editor component ───────────────────────────────── */
export default function RichTextEditor({ content, onChange, type }) {
  /* colour + size options */
  const palette = ['#000000', '#DEB887', '#B5C18E', '#8B4513', '#A0522D'];
  const sizes   = [
    { label: '10', val: '10px' },
    { label: '12', val: '12px' }, // default
    { label: '14', val: '14px' },
    { label: '18', val: '18px' },
    { label: '24', val: '24px' },
    { label: '32', val: '32px' },
  ];

  const [activeColor, setActiveColor] = useState(palette[0]);
  const [activeSize,  setActiveSize]  = useState(sizes[1]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sizeOpen,    setSizeOpen]    = useState(false);

  const paletteRef = useRef(null);
  const sizeRef    = useRef(null);

  // Font families for dropdown (keep a few good ones)
  const fontFamilies = [
    { label: 'Default', val: '' },
    { label: 'Serif', val: 'serif' },
    { label: 'Sans', val: 'Inter, sans-serif' },
    { label: 'Playfair', val: '"Playfair Display", serif' },
    { label: 'Monospace', val: 'monospace' },
    { label: 'Georgia', val: 'Georgia, serif' },
    { label: 'Courier', val: '"Courier New", monospace' },
  ];
  const [activeFont, setActiveFont] = useState(fontFamilies[0]);
  const [customFont, setCustomFont] = useState('');
  const [customFontUrl, setCustomFontUrl] = useState('');
  const [fontFamilyOpen, setFontFamilyOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);

  /* ─ TipTap setup ────────────────────────────────────────────── */
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            fontSize: {
              default: '16px',
              parseHTML: element => element.style.fontSize || null,
              renderHTML: attributes => {
                if (!attributes.fontSize) return {};
                return { style: `font-size: ${attributes.fontSize}` };
              },
            },
            fontFamily: {
              default: '',
              parseHTML: element => element.style.fontFamily || null,
              renderHTML: attributes => {
                if (!attributes.fontFamily) return {};
                return { style: `font-family: ${attributes.fontFamily}` };
              },
            },
          };
        },
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color.configure({ types: ['textStyle', 'heading', 'paragraph'] }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: type === 'text'
          ? 'Type your note here…'
          : 'Click here to edit the title…',
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  /* close dropdowns when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target))
        setPaletteOpen(false);
      if (sizeRef.current && !sizeRef.current.contains(e.target))
        setSizeOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!editor) return null;

  /* ─ helpers ───────────────────────────────────────────────── */
  const applySize = (px) =>
    editor.chain().focus().setMark('textStyle', { fontSize: px }).run();

  /** Apply a colour to the full heading block if inside one */
  const applyColorSmart = (hex) => {
    const { commands, state } = editor;
    const { $from } = state.selection;
    if ($from.parent.type.name === 'heading') {
      const start = $from.start($from.depth);
      const end   = $from.end($from.depth);
      commands.setColor(hex, { from: start, to: end });
    } else {
      commands.setColor(hex);
    }
  };

  const reapplyMarks = () => {
    applyColorSmart(activeColor);
    applySize(activeSize.val);
  };

  // Only allow font size and font family for text sections
  const showFontSize = type === 'text';
  const showFontFamily = type === 'text';

  // Handle custom font import (from fontgen.net or Google Fonts)
  function handleCustomFontImport(e) {
    e.preventDefault();
    if (!customFont.trim() || !customFontUrl.trim()) return;
    // Add a <link> or <style> to the head for the custom font
    if (!document.getElementById(`custom-font-link-${customFont}`)) {
      // If it's a CSS @import, inject a <style>
      if (customFontUrl.includes('@import')) {
        const style = document.createElement('style');
        style.id = `custom-font-link-${customFont}`;
        style.innerHTML = customFontUrl;
        document.head.appendChild(style);
      } else {
        // Otherwise, treat as a <link> (e.g. Google Fonts or direct CSS)
        const link = document.createElement('link');
        link.id = `custom-font-link-${customFont}`;
        link.rel = 'stylesheet';
        link.href = customFontUrl;
        document.head.appendChild(link);
      }
    }
    setActiveFont({ label: customFont, val: `'${customFont}', sans-serif` });
    editor.chain().focus().setMark('textStyle', { fontFamily: `'${customFont}', sans-serif` }).run();
    setCustomFont('');
    setCustomFontUrl('');
    setShowImport(false);
    setFontFamilyOpen(false);
  }

  /* ─ UI ──────────────────────────────────────────────────────── */
  return (
    <div className="w-full">
      {/* toolbar */}
      <div className="mb-4 p-2 bg-pale-beige rounded-lg flex flex-wrap gap-1 border border-accent shadow-card">
        {/* bold / italic / underline */}
        <ToolBtn
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => {
            editor.chain().focus().toggleBold().run();
            reapplyMarks();
          }}
        >
          <Bold size={14}/>
        </ToolBtn>
        <ToolBtn
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => {
            editor.chain().focus().toggleItalic().run();
            reapplyMarks();
          }}
        >
          <Italic size={14}/>
        </ToolBtn>
        <ToolBtn
          title="Underline"
          active={editor.isActive('underline')}
          onClick={() => {
            editor.chain().focus().toggleUnderline().run();
            reapplyMarks();
          }}
        >
          <UnderlineIcon size={14}/>
        </ToolBtn>

        {/* font family dropdown (after bold/italic/underline, only for text sections) */}
        {showFontFamily && (
          <div className="relative">
            <ToolBtn title="Font style" onClick={() => setFontFamilyOpen(o => !o)}>
              <span className="font-bold text-xs">F</span>
            </ToolBtn>
            {fontFamilyOpen && (
              <div ref={paletteRef} className="absolute left-0 bottom-full mb-1 bg-white border border-accent rounded-lg shadow-lg p-2 flex flex-col gap-1 z-50 min-w-[180px] max-w-[220px]">
                {fontFamilies.map(f => (
                  <button
                    key={f.val}
                    onMouseDown={e=>e.preventDefault()}
                    onClick={() => {
                      setActiveFont(f);
                      editor.chain().focus().setMark('textStyle', { fontFamily: f.val }).run();
                      setFontFamilyOpen(false);
                    }}
                    className={cn(
                      'px-2 py-0.5 text-sm rounded text-left hover:bg-accent/30',
                      f.val === activeFont.val && 'bg-accent/60 font-semibold'
                    )}
                    style={{ fontFamily: f.val || undefined, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {f.label}
                  </button>
                ))}
                <button
                  type="button"
                  className="mt-1 px-2 py-0.5 rounded bg-accent/60 hover:bg-accent text-xs border border-accent"
                  onClick={() => setShowImport((v) => !v)}
                >
                  Import font style
                </button>
                {showImport && (
                  <form
                    onSubmit={handleCustomFontImport}
                    className="flex flex-col gap-1 mt-2 border-t border-accent pt-2"
                    title="Import font from fontgen.net or Google Fonts"
                  >
                    <input
                      type="text"
                      value={customFont}
                      onChange={e => setCustomFont(e.target.value)}
                      placeholder="Font name (e.g. Roboto)"
                      className="border border-accent rounded px-1 py-0.5 text-xs flex-1 bg-pale-beige"
                    />
                    <input
                      type="text"
                      value={customFontUrl}
                      onChange={e => setCustomFontUrl(e.target.value)}
                      placeholder="Font CSS URL or @import"
                      className="border border-accent rounded px-1 py-0.5 text-xs flex-1 bg-pale-beige"
                    />
                    <button
                      type="submit"
                      className="mt-1 px-2 py-0.5 rounded bg-accent/60 hover:bg-accent text-xs border border-accent"
                    >
                      Add Font
                    </button>
                    <span className="text-[10px] text-earth-700 mt-1">
                      Paste the CSS URL or <code>@import</code> from <a href="https://www.fontgen.net" target="_blank" rel="noopener noreferrer" className="underline">fontgen.net</a>
                    </span>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* font-size dropdown (only for text sections, as a dropdown) */}
        {showFontSize && (
          <div className="relative">
            <ToolBtn title="Font size" onClick={() => setFontSizeOpen(o => !o)}>
              <FontIcon size={14}/>
            </ToolBtn>
            {fontSizeOpen && (
              <div ref={sizeRef} className="absolute left-0 bottom-full mb-1 bg-white border border-accent rounded-lg shadow-lg p-2 flex flex-col gap-1 z-50 min-w-[80px] max-w-[120px]">
                {sizes.map(s => (
                  <button
                    key={s.val}
                    onMouseDown={e=>e.preventDefault()}
                    onClick={() => {
                      setActiveSize(s);
                      applySize(s.val);
                      setFontSizeOpen(false);
                    }}
                    className={cn(
                      'px-2 py-0.5 text-sm rounded text-left hover:bg-accent/30',
                      s.val === activeSize.val && 'bg-accent/60 font-semibold'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Divider />

        {/* align */}
        {[
          ['left',   <AlignLeft   size={14} key="l"/ >],
          ['center', <AlignCenter size={14} key="c"/ >],
          ['right',  <AlignRight  size={14} key="r"/ >],
        ].map(([pos, icon]) => (
          <ToolBtn
            key={pos}
            title={`Align ${pos}`}
            active={editor.isActive({ textAlign: pos })}
            onClick={() => editor.chain().focus().setTextAlign(pos).run()}
          >
            {icon}
          </ToolBtn>
        ))}

        <Divider />

        {/* lists */}
        <ToolBtn
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={14}/>
        </ToolBtn>
        <ToolBtn
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={14}/>
        </ToolBtn>

        <Divider />

        {/* palette */}
        <div ref={paletteRef} className="relative">
          <ToolBtn title="Text colour" onClick={() => setPaletteOpen(o => !o)}>
            <Palette size={14}/>
          </ToolBtn>
          {paletteOpen && (
            <div className="absolute bottom-full left-0 mb-1 bg-white shadow-lg rounded
                            p-2 flex gap-1 z-50 items-center">
              {/* Preset palette */}
              {palette.map(c => (
                <button
                  key={c}
                  onMouseDown={e=>e.preventDefault()}
                  onClick={() => {
                    setActiveColor(c);
                    applyColorSmart(c);
                    // Do NOT close palette here
                  }}
                  style={{ backgroundColor: c }}
                  className={cn(
                    'w-5 h-5 rounded-full border border-[#ddd]',
                    c === activeColor && 'outline outline-2 outline-light-brown'
                  )}
                />
              ))}
              {/* Custom color picker */}
              <input
                type="color"
                value={activeColor}
                onChange={e => {
                  setActiveColor(e.target.value);
                  applyColorSmart(e.target.value);
                  // Do NOT close palette here
                }}
                className="w-6 h-6 rounded-full border border-[#ddd] cursor-pointer"
                style={{ padding: 0, background: 'none' }}
                title="Pick a custom color"
              />
              {/* Done/Close button */}
              <button
                onClick={() => setPaletteOpen(false)}
                className="ml-2 px-2 py-1 rounded bg-accent/40 hover:bg-accent/60 text-earth-700 text-xs"
                tabIndex={-1}
              >
                Done
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* undo/redo */}
        <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={14}/>
        </ToolBtn>
        <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={14}/>
        </ToolBtn>
      </div>

      {/* editable area */}
      <EditorContent
        editor={editor}
        className="tiptap prose max-w-none w-full focus:outline-none"
      />
    </div>
  );
}
