import NavBar from '@/components/ui/NavBar';
import Footer from '@/components/ui/Footer';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <NavBar showBanner={true} bannerHeight={6} />
      {children}
      <Footer/>
    </div>
  )
}