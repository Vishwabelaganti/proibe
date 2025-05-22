import Head from 'next/head';
import LofiCircle from '../components/LofiCircle';   
import Header     from '../components/Header'
import Sidebar from '../components/Sidebar'

export default function Home() {
  return (
    <>
      <Head>
        <title>Proibe</title>
        <meta name="description" content="Proibe Lofi Player" />
      </Head>
      <Header />  
      <LofiCircle />               {/* default bottom-right */}
      {/* OR position it wherever: */}
      {/* <LofiCircle className="absolute top-6 left-6" /> */}
      
      <main className="min-h-screen bg-soft-peach text-earth-700 grid grid-cols-[16rem_1fr] overflow-hidden">
      <Sidebar />
       {/* Placeholder for the editor pane */}
      <div className="p-6 overflow-auto">
       {/* When we add NoteEditor, it goes here */}
      <p className="text-earth-700">Select a section to begin editing...</p>
      </div>

      </main>
    </>
    
  )
}
