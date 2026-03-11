/* This wrapper is to be able to layer more things below the */
//import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {

  return (
    <>
      {children}

      <Footer />
    </>
  );
}