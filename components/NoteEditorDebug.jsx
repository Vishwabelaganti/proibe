import React from 'react';

// Test each import one by one
import SortableSection from './SortableSection'

export default function NoteEditorDebug() {
  console.log('SortableSection:', SortableSection);
  
  return (
    <div>
      <h1>Debug Component Imports</h1>
      <p>Testing SortableSection import...</p>
      <p>SortableSection: {typeof SortableSection}</p>
    </div>
  );
}
