import { Footer, MarketingHeader } from "@/components/layout";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
