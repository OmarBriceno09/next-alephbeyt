'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname.startsWith('/admin');

  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const fromBottom = window.innerHeight - e.clientY;
      setShowFooter(fromBottom < 100);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {children}

      {!hideFooter && (
        <div
          className={`fixed bottom-0 left-0 w-full bg-white z-50 transform transition-transform duration-500 ${
            showFooter ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <Footer />
        </div>
      )}
    </>
  );
}