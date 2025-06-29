// pages/index.js
import Head from 'next/head';
import LofiCircle from '../components/LofiCircle';
import NotesApp from '../components/NotesApp';

export default function Home() {
  return (
    <>
      <Head>
        <title>Proibe</title>
        <meta name="description" content="Proibe Lofi Player" />
      </Head>

      {/* Floating lofi-player control */}
      <LofiCircle />

      {/* Full notes workspace (header + sidebar + editor) */}
      <NotesApp />
    </>
  );
}
