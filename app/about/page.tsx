import Header from "@/views/components/Header";
import Footer from "@/views/components/Footer";
import AboutScreen from "@/views/AboutScreen";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a1a]">
      <Header hideGetStarted />
      <AboutScreen />
      <Footer />
    </main>
  );
}

