
import Head from 'next/head';
import '../styles/globals.css';
import { NotesProvider } from '../context/NotesContext';
import { AuthProvider } from '../context/AuthContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <AuthProvider>
        <NotesProvider>
          <Component {...pageProps} />
        </NotesProvider>
      </AuthProvider>
    </>
  );
}
