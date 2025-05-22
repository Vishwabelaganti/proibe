import React from 'react';
import { BookOpen } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-earth-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <BookOpen size={28} className="text-earth-700" />
          <h1 className="text-2xl font-playfair font-bold text-earth-800">
            Proibe
          </h1>
        </div>

        <p className="text-sm italic text-earth-700">
          Beautiful note-taking made simple
        </p>
      </div>
    </header>
  );
}
