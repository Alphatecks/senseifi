import Header from "@/views/components/Header";
import Footer from "@/views/components/Footer";
import PricingScreen from "@/views/PricingScreen";
import FAQSection from "@/views/FAQSection";
import CenteredAppDownload from "@/views/CenteredAppDownload";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <PricingScreen />
      <FAQSection />
      <CenteredAppDownload />
      <Footer />
    </main>
  );
}
