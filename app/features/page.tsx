import Header from "@/views/components/Header";
import Footer from "@/views/components/Footer";
import FeaturesScreen from "@/views/FeaturesScreen";
import FAQSection from "@/views/FAQSection";
import CenteredAppDownload from "@/views/CenteredAppDownload";

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <FeaturesScreen />
      <FAQSection />
      <CenteredAppDownload />
      <Footer />
    </main>
  );
}
