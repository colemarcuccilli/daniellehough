import { Nav } from "@/components/public/nav";
import { Footer } from "@/components/public/footer";
import { InquiryFromUrl, InquiryProvider } from "@/components/public/inquiry-modal";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <InquiryProvider>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <InquiryFromUrl />
    </InquiryProvider>
  );
}
