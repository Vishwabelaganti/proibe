// components/NotesApp.jsx
import React from 'react';
import Sidebar from './Sidebar';
import NoteEditor from './NoteEditor';
import { Book } from 'lucide-react';

export default function NotesApp() {
  return (
    <div className="flex flex-col h-screen">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="bg-earth-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Book className="h-7 w-7 text-earth-700" />
            <h1 className="text-xl font-playfair font-bold text-earth-800">
              Proibe&nbsp;Notes
            </h1>
          </div>
          <span className="text-xs text-earth-700">
            Beautiful note-taking made simple
          </span>
        </div>
      </header>

      {/* ── Workspace ───────────────────────────────────────────── */}
      <main className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col items-stretch justify-start px-0 py-0">
          <div className="w-full h-full flex flex-col">
            <NoteEditor />
          </div>
        </div>
      </main>
    </div>
  );
}
