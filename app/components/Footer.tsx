'use client';

import { useEffect, useState, useRef, useLayoutEffect, SetStateAction } from 'react';
import gsap from "gsap";

export default function Footer() {
  
  const footerRef = useRef<HTMLDivElement>(null);
  const revealHeight = 100; //px from bottom that triggers reveal
  let footerVisible = false;

  const topButtons = ['Alphabet', 'Language', 'Letter', 'Games'];
  const bottomButtons = ['Basic States', 'Symbols', 'Lexicon', 'Summary', 'Timeline'];

  const renderButtons = (labels: string[]) =>
    labels.map((label, i) => (
        <button
            key={i}
            onClick={() => alert(`Clicked on ${label}`)}
            className="w-full h-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 transition-colors duration-200"
            >
            {label}
        </button>
  ));

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const footerHeight = footer.offsetHeight;

    // Start hidden
    gsap.set(footer, {
      y: footerHeight,
    });

    const onMouseMove = (e: MouseEvent) => {
      const viewportHeight = window.innerHeight;
      const distanceFromBottom = viewportHeight - e.clientY;

      if (distanceFromBottom < revealHeight && !footerVisible) {
        footerVisible = true;
        gsap.to(footer, {
          y: 0,
          duration: 0.45,
          ease: "power3.out",
        });
      }

      if (distanceFromBottom >= revealHeight && footerVisible) {
        footerVisible = false;
        gsap.to(footer, {
          y: footerHeight,
          duration: 0.4,
          ease: "power3.in",
        });
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);


  return (
    <footer 
      ref={footerRef}
      className="fixed bottom-0 left-0 w-full h-[7vh] z-50 pointer-events-auto"
    >
      <div className="grid grid-rows-2 h-full">
        {/* Top Row (4 buttons) */}
        <div className="grid grid-cols-4">
            {renderButtons(topButtons)}
        </div>

        {/* Bottom Row (5 buttons) */}
        <div className="grid grid-cols-5">
            {renderButtons(bottomButtons)}
        </div>
      </div>
    </footer>
  );
}