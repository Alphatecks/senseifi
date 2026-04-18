import Header from "@/views/components/Header";
import Footer from "@/views/components/Footer";
import PrivacyPolicyScreen from "@/views/PrivacyPolicyScreen";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a1a]">
      <Header hideGetStarted />
      <PrivacyPolicyScreen />
      <Footer />
    </main>
  );
}
