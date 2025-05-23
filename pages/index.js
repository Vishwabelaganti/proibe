import Head       from 'next/head'
import LofiCircle from '../components/LofiCircle'
import Header     from '../components/Header'
import Sidebar    from '../components/Sidebar'
import NoteEditor from '../components/NoteEditor'

export default function Home() {
  return (
    <>
      <Head>
        <title>Proibe</title>
        <meta name="description" content="Proibe Lofi Player" />
      </Head>

      <LofiCircle />
      <Header />

      <div className="grid grid-cols-[280px_1fr] min-h-[calc(100vh-80px)]">
        <Sidebar />
        <NoteEditor />
      </div>
    </>
  )
}
