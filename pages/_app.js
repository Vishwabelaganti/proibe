
import Head from 'next/head';
import '../styles/globals.css';
import { NotesProvider } from '../context/NotesContext';
import { AuthProvider } from '../context/AuthContext';
import { AISummariesProvider } from '../context/AISummariesContext';
import { ProcessedDocumentsProvider } from '../context/ProcessedDocumentsContext';
import { FlashcardsProvider } from '../context/FlashcardsContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <AuthProvider>
        <NotesProvider>
          <AISummariesProvider>
            <ProcessedDocumentsProvider>
              <FlashcardsProvider>
                <Component {...pageProps} />
              </FlashcardsProvider>
            </ProcessedDocumentsProvider>
          </AISummariesProvider>
        </NotesProvider>
      </AuthProvider>
    </>
  );
}
