// pages/migrate.js - Migration utility for unified workspace
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { migrateToUnifiedWorkspace } from '../lib/firestoreBlocks';
import { auth } from '../lib/firebase';

export default function MigratePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');
  const [error, setError] = useState('');

  async function handleMigration() {
    if (!user) return;
    
    setMigrating(true);
    setError('');
    setMigrationStatus('Starting migration...');
    
    try {
      setMigrationStatus('Converting notes to unified workspace...');
      await migrateToUnifiedWorkspace(user.uid);
      
      setMigrationStatus('Migration completed successfully!');
      
      setTimeout(() => {
        router.push('/app');
      }, 2000);
      
    } catch (err) {
      console.error('Migration error:', err);
      setError('Migration failed: ' + err.message);
    } finally {
      setMigrating(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Migrate to Unified Workspace
          </h1>
          
          <p className="text-gray-600 mb-6">
            We've upgraded Proibe to use a unified Notion-style workspace. 
            This will convert your existing notes to the new format.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {migrationStatus && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              {migrationStatus}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleMigration}
              disabled={migrating}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {migrating ? 'Migrating...' : 'Start Migration'}
            </button>

            <button
              onClick={() => router.push('/app')}
              className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Skip Migration (Go to Notes)
            </button>

            <button
              onClick={() => auth.signOut()}
              className="w-full py-2 px-4 text-red-600 hover:text-red-800 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
