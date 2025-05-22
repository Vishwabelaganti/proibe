import Head from 'next/head';
import '../styles/globals.css';
import { NotesProvider } from '../context/NotesContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <NotesProvider>
        <Component {...pageProps} />
      </NotesProvider>
    </>
  );
}
