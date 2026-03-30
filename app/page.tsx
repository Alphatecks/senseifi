import Header from '@/views/components/Header';
import Footer from '@/views/components/Footer';
import HomeScreen from '@/views/HomeScreen';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a1a]">
      <Header />
      <HomeScreen />
      <Footer />
    </main>
  );
}
