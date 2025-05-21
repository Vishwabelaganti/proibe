import Head from 'next/head'
import LofiCircle from '../components/LofiCircle'
import SectionsManager from '../components/SectionsManager'

export default function Home() {
  return (
    <>
      <Head>
        <title>Proibe</title>
        <meta name="description" content="Proibe Lofi Player" />
      </Head>

      {/* Global overlay—always top-left */}
      <LofiCircle />

      <main className="min-h-screen bg-[#F9F4EF] text-gray-800 flex flex-col items-center p-6">
        <h1 className="text-4xl font-semibold mt-6">Proibe</h1>
        
      <SectionsManager />
      </main>
    </>
  )
}
