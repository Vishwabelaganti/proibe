import React, { useState } from 'react';

const PAPER_SIZES = [
  { label: 'A4 (Portrait)', value: 'a4' },
  { label: 'Letter (Portrait)', value: 'letter' },
];
const FONT_STYLES = [
  { label: 'Inter (Default)', value: 'inter' },
  { label: 'Serif', value: 'serif' },
  { label: 'Playfair', value: 'playfair' },
];
const THEMES = [
  { label: 'Light (Current)', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function ExportPDFDialog({
  open,
  onClose,
  onExport,
  previewContent,
  defaultOptions = {},
}) {
  const [paperSize, setPaperSize] = useState(defaultOptions.paperSize || 'a4');
  const [fontStyle, setFontStyle] = useState(defaultOptions.fontStyle || 'inter');
  const [theme, setTheme] = useState(defaultOptions.theme || 'light');
  const [includeDate, setIncludeDate] = useState(defaultOptions.includeDate || false);
  const [addPageNumbers, setAddPageNumbers] = useState(defaultOptions.addPageNumbers !== false);

  // --- Preview Sizing ---
  // Make preview larger and centered, with a better scale for readability
  const PAGE_SIZES = {
    a4: { width: 794, height: 1123 },
    letter: { width: 816, height: 1056 },
  };
  const pageDims = PAGE_SIZES[paperSize] || PAGE_SIZES.a4;
  const PREVIEW_MAX_WIDTH = 480; // larger preview
  const PREVIEW_MAX_HEIGHT = 700;
  const scale = Math.min(
    PREVIEW_MAX_WIDTH / pageDims.width,
    PREVIEW_MAX_HEIGHT / pageDims.height,
    1
  );

  // Render the preview using the same NotesPrintView as the PDF export, always passing through user stylization
  const previewPage = (
    <div
      style={{
        width: pageDims.width,
        height: pageDims.height,
        background: '#fff',
        boxShadow: '0 1px 8px 0 rgba(92,67,46,0.07)',
        borderRadius: 16,
        border: '1px solid #eee',
        margin: '0 auto',
        position: 'relative',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible', // allow overflow for scroll
      }}
    >
      {previewContent}
    </div>
  );

  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <div className="bg-white rounded-xl shadow-xl p-0 w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 min-w-[260px] p-8 border-b md:border-b-0 md:border-r border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Export PDF Options</h2>
            <div className="mb-4">
              <label className="block font-medium mb-1">Paper Size</label>
              <select className="w-full border rounded px-2 py-1" value={paperSize} onChange={e => setPaperSize(e.target.value)}>
                {PAPER_SIZES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Font Style</label>
              <select className="w-full border rounded px-2 py-1" value={fontStyle} onChange={e => setFontStyle(e.target.value)}>
                {FONT_STYLES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Theme</label>
              <select className="w-full border rounded px-2 py-1" value={theme} onChange={e => setTheme(e.target.value)}>
                {THEMES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <input type="checkbox" id="include-date" checked={includeDate} onChange={e => setIncludeDate(e.target.checked)} />
              <label htmlFor="include-date">Include current date</label>
            </div>
            <div className="mb-6 flex items-center gap-2">
              <input type="checkbox" id="add-page-numbers" checked={addPageNumbers} onChange={e => setAddPageNumbers(e.target.checked)} />
              <label htmlFor="add-page-numbers">Add page numbers</label>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 bg-accent text-white rounded shadow hover:bg-accent/80 transition" onClick={() => onExport({ paperSize, fontStyle, theme, includeDate, addPageNumbers })}>Export PDF</button>
              <button className="px-4 py-2 bg-gray-200 rounded shadow hover:bg-gray-300 transition" onClick={onClose}>Cancel</button>
            </div>
          </div>
          <div className="flex-1 min-w-[260px] p-8 overflow-auto flex flex-col items-center justify-center" style={{ maxHeight: '80vh' }}>
            <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
            <div
              className="border rounded bg-gray-50 flex items-center justify-center overflow-auto"
              style={{
                minHeight: PREVIEW_MAX_HEIGHT + 32,
                minWidth: PREVIEW_MAX_WIDTH + 32,
                maxHeight: '70vh',
                maxWidth: '100%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto', // ensure scroll if needed
                background: '#f8f6f3',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                {previewPage}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
