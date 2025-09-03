import React from 'react';
import { useNotes } from '../../context/NotesContext';

export default function SectionsDebugger() {
  const { sections, getChildSections } = useNotes();

  const pinnedSections = sections.filter((s) => s.pinned);
  const rootSections = getChildSections(null).filter((s) => !s.pinned);
  const childSections = sections.filter((s) => s.parent);

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 m-4">
      <h3 className="font-bold text-lg mb-4">🔍 Sections Debug Info</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold text-blue-600">Total Sections</h4>
          <p className="text-2xl font-bold">{sections.length}</p>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold text-yellow-600">Pinned Sections</h4>
          <p className="text-2xl font-bold">{pinnedSections.length}</p>
          {pinnedSections.map(s => (
            <div key={s.id} className="text-xs bg-yellow-50 p-1 mt-1 rounded">
              {s.type}: {typeof s.content === 'string' ? s.content.substring(0, 30) : 'Object'}
            </div>
          ))}
        </div>
        
        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold text-green-600">Root Sections (Visible in Sidebar)</h4>
          <p className="text-2xl font-bold">{rootSections.length}</p>
          {rootSections.map(s => (
            <div key={s.id} className="text-xs bg-green-50 p-1 mt-1 rounded">
              {s.type}: {typeof s.content === 'string' ? s.content.substring(0, 30) : 'Object'}
            </div>
          ))}
        </div>
        
        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold text-purple-600">Child Sections</h4>
          <p className="text-2xl font-bold">{childSections.length}</p>
          {childSections.map(s => (
            <div key={s.id} className="text-xs bg-purple-50 p-1 mt-1 rounded">
              {s.type}: {typeof s.content === 'string' ? s.content.substring(0, 30) : 'Object'}
              <br />
              <span className="text-gray-500">Parent: {s.parent}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">All Sections List:</h4>
        <div className="bg-white p-3 rounded border max-h-40 overflow-y-auto">
          {sections.map(s => (
            <div key={s.id} className="text-xs border-b pb-1 mb-1 last:border-b-0">
              <strong>{s.type}</strong>: {typeof s.content === 'string' ? s.content.substring(0, 50) : JSON.stringify(s.content).substring(0, 50)}
              <br />
              <span className="text-gray-500">
                ID: {s.id} | Parent: {s.parent || 'none'} | Pinned: {s.pinned ? 'yes' : 'no'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
