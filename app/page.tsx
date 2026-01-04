import Header from '@/views/components/Header'
import Hero from '@/views/components/Hero'
import AppDownload from '@/views/components/AppDownload'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a1a]">
      <Header />
      <Hero />
      <AppDownload />
    </main>
  )
}

