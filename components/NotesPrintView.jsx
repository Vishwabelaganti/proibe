import React from 'react';
import { useNotes } from '../context/NotesContext';

function PrintSection({ section, getChildSections, level = 1, parentType = null }) {
  if (!section) return null;
  const children = getChildSections(section.id);
  let Tag = 'div';
  let tagProps = {};
  let style = {
    marginBottom: 12,
    paddingLeft: 0,
    paddingTop: 2,
    paddingBottom: 2,
    width: '100%',
    boxSizing: 'border-box',
  };
  // Heading
  if (section.type === 'heading') {
    Tag = 'h1';
    tagProps = { style: { fontFamily: 'Playfair Display, serif', fontWeight: 'bold', fontSize: '2.1rem', marginBottom: '0.6em', color: section.headingColor || '#2d1c0f', textDecoration: section.headingUnderline ? 'underline' : undefined, fontStyle: section.headingItalic ? 'italic' : undefined, letterSpacing: '-1px' } };
    style.marginTop = 0;
  }
  // Subheading: full-width, very light pill/cylinder container
  else if (section.type === 'subheading') {
    Tag = 'h2';
    tagProps = { style: { fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '1.15rem', marginBottom: 0, color: section.headingColor || '#bfae9b', textDecoration: section.headingUnderline ? 'underline' : undefined, fontStyle: section.headingItalic ? 'italic' : undefined, letterSpacing: '-0.5px', textAlign: 'left' } };
    style.background = 'rgba(191, 174, 155, 0.07)'; // much lighter than background
    style.borderRadius = 9999;
    style.padding = '10px 24px';
    style.marginBottom = 12;
    style.display = 'block';
    style.width = '100%';
    style.boxShadow = '0 1px 4px 0 rgba(92,67,46,0.02)';
    style.minWidth = 0;
    style.maxWidth = '100%';
  }
  // Text: container only if parent is heading
  else if (section.type === 'text') {
    Tag = 'div';
    tagProps = { style: { fontFamily: 'Inter, sans-serif', fontSize: '1.05rem', marginBottom: '0.5em', color: '#2d1c0f', lineHeight: 1.7 }, dangerouslySetInnerHTML: { __html: section.content || '' } };
    if (parentType === 'heading') {
      style.background = '#fff';
      style.border = '1.5px solid #e8ded4';
      style.borderRadius = 12;
      style.padding = '12px 16px 8px 16px';
      style.marginBottom = 10;
      style.boxShadow = '0 1px 4px 0 rgba(92,67,46,0.02)';
      style.width = '100%';
      style.boxSizing = 'border-box';
    } else {
      style.background = 'none';
      style.border = 'none';
      style.borderRadius = 0;
      style.padding = 0;
      style.marginBottom = 10;
      style.boxShadow = 'none';
      style.width = '100%';
      style.boxSizing = 'border-box';
    }
  }
  return (
    <div style={style}>
      <Tag {...tagProps}>{section.type === 'text' ? null : section.content}</Tag>
      {children && children.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {children.map(child => (
            <PrintSection key={child.id} section={child} getChildSections={getChildSections} level={level + 1} parentType={section.type} />
          ))}
        </div>
      )}
    </div>
  );
}

export function getPdfBookmarks(sections, getChildSections, parentId = null, level = 0) {
  // Recursively collect bookmarks for headings/subheadings
  const bookmarks = [];
  const children = getChildSections(parentId);
  for (const section of children) {
    if (section.type === 'heading' || section.type === 'subheading') {
      bookmarks.push({
        title: section.content || 'Untitled',
        level,
        id: section.id,
        children: getPdfBookmarks(sections, getChildSections, section.id, level + 1)
      });
    }
    // Always recurse for children
    bookmarks.push(...getPdfBookmarks(sections, getChildSections, section.id, level + 1));
  }
  return bookmarks;
}

export default function NotesPrintView({ rootId, style = {} }) {
  const { sections, getChildSections } = useNotes();
  const root = sections.find(s => s.id === rootId);
  if (!root) return null;
  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="proibe-export-area pdf-export-bg" style={{ width: '100%', minHeight: '100vh', ...style }}>
      <style>{`
        .pdf-export-bg {
          background: #fdf8f3 !important;
        }
        .pdf-title {
          font-family: 'Playfair Display', 'Libre Baskerville', Georgia, serif;
          font-size: 2.6rem;
          font-weight: bold;
          text-align: center;
          color: #2d1c0f;
          margin-top: 48px;
          margin-bottom: 0.5em;
        }
        .pdf-date {
          text-align: center;
          color: #a67c52;
          font-family: 'Inter', 'Libre Baskerville', serif;
          font-size: 1.15rem;
          margin-bottom: 2.2em;
        }
        .pdf-section {
          background: #f3eee7;
          border-radius: 2.2em;
          padding: 2em 2.2em 1.7em 2.2em;
          margin: 0 auto 2.2em auto;
          max-width: 900px;
          box-shadow: none;
          width: 90%;
        }
        .pdf-section h2 {
          font-family: 'Playfair Display', 'Libre Baskerville', Georgia, serif;
          font-size: 1.45rem;
          font-weight: bold;
          color: #2d1c0f;
          margin-bottom: 0.7em;
          margin-top: 0;
          text-align: left;
        }
        .pdf-subheading {
          font-family: 'Inter', 'Libre Baskerville', serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #a67c52;
          margin-bottom: 0.7em;
          margin-top: 0;
          text-align: left;
          letter-spacing: 0.01em;
        }
        .pdf-body {
          font-family: 'Libre Baskerville', Georgia, serif;
          font-size: 1.08rem;
          color: #bfae9b;
          font-style: italic;
          text-align: left;
          margin-bottom: 0;
        }
        .pdf-body * {
          font-family: inherit !important;
          color: #bfae9b !important;
          font-style: italic !important;
        }
        .pdf-body strong, .pdf-body b {
          font-weight: bold !important;
          color: #2d1c0f !important;
          font-style: italic !important;
        }
        .pdf-body em, .pdf-body i {
          font-style: italic !important;
        }
        .pdf-body u {
          text-decoration: underline !important;
        }
        .pdf-body ul, .pdf-body ol {
          margin-left: 1.2em;
          margin-bottom: 0.7em;
        }
        .pdf-body li {
          margin-bottom: 0.2em;
        }
        .pdf-footer {
          text-align: center;
          color: #a67c52;
          font-family: 'Inter', 'Libre Baskerville', serif;
          font-size: 1.05rem;
          margin-top: 2.2em;
          margin-bottom: 0;
        }
      `}</style>
      <div className="pdf-title">{root.content || 'Untitled'}</div>
      <div className="pdf-date">{dateStr}</div>
      {getChildSections(root.id).map(section => (
        <SectionBox key={section.id} section={section} getChildSections={getChildSections} />
      ))}
      <div className="pdf-footer">
        Exported from Proibe – {dateStr}
      </div>
    </div>
  );
}

function SectionBox({ section, getChildSections, parentSubheadingColor }) {
  const children = getChildSections(section.id);
  const isSubheading = section.type === 'subheading';
  // Only render the section if it or any of its children have content
  const hasContent = section.content || (children && children.some(child => child.content && child.content.trim() !== ''));
  if (!hasContent && section.type !== 'text') return null;
  function renderBodyContent(content) {
    return { __html: content };
  }
  // Outlined pill style for all section types, refined for modern look
  const pillStyle = {
    background: '#fff',
    border: '1.2px solid #ede7df', // lighter border
    borderRadius: '1.6em', // tighter radius
    boxShadow: 'none',
    margin: '0 auto 1.1em auto', // less margin between pills
    maxWidth: 900,
    width: '90%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '1.1em 1.5em 1em 1.5em', // less vertical padding
  };
  // Heading inside pill
  if (section.type === 'heading') {
    return (
      <div className="pdf-section" style={pillStyle}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 'bold', fontSize: '1.25rem', color: '#2d1c0f', margin: 0, marginBottom: '0.2em', lineHeight: 1.1 }}>{section.content}</h2>
        {children.map((child, idx) => (
          <SectionBox
            key={child.id || idx}
            section={child}
            getChildSections={getChildSections}
            parentSubheadingColor={parentSubheadingColor}
          />
        ))}
      </div>
    );
  }
  // Subheading inside pill
  if (isSubheading) {
    return (
      <div className="pdf-section" style={pillStyle}>
        <h2 className="pdf-subheading" style={{ color: section.headingColor || '#a67c52', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.08rem', margin: 0, marginBottom: '0.15em', lineHeight: 1.1 }}>{section.content}</h2>
        {children.map((child, idx) => (
          <SectionBox
            key={child.id || idx}
            section={child}
            getChildSections={getChildSections}
            parentSubheadingColor={section.headingColor || parentSubheadingColor}
          />
        ))}
      </div>
    );
  }
  // Text section inside pill
  if (section.type === 'text') {
    const color = parentSubheadingColor || '#2d1c0f';
    const customStyle = section.textColor || section.textFont ? {
      color: section.textColor || color,
      fontFamily: section.textFont || undefined,
    } : {};
    return (
      <div className="pdf-section pdf-textbox" style={{ ...pillStyle, padding: '0.7em 1.3em 0.7em 1.3em', margin: '0 auto 0.7em auto', ...customStyle }}>
        <div
          className="prose tiptap pdf-body"
          style={{ color: customStyle.color || color, fontFamily: customStyle.fontFamily, fontStyle: 'inherit', fontSize: '1.08rem', width: '100%', fontWeight: 400 }}
          dangerouslySetInnerHTML={renderBodyContent(section.content)}
        />
        <style>{`.pdf-section.pdf-textbox .pdf-body * { color: ${customStyle.color || color} !important; font-family: ${customStyle.fontFamily || 'inherit'} !important; font-size: 1.08rem !important; font-weight: 400 !important; }`}</style>
      </div>
    );
  }
  // Fallback for any other section type
  return null;
}
