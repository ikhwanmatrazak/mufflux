import SiteNavbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import MobileBottomNav from "@/components/ui/MobileBottomNav";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNavbar />
      <div className="min-h-screen">{children}</div>
      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
    </>
  );
}
