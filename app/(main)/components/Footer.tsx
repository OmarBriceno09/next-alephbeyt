'use client';

import { useEffect, useRef } from 'react';
import gsap from "gsap";
import { WindowData  } from './WindowManager';

type FooterProps = {
  windows: WindowData []
  spawnWindow: (type:string, label:string, relpos:number) => void
}

export default function Footer({
  windows,
  spawnWindow
}:FooterProps) {
  
  const footerRef = useRef<HTMLDivElement>(null);
  const revealHeight = 100; //px from bottom that triggers reveal
  let footerVisible = false;


  const topButtons = [
    {type:"comparison", label:"Compare Scripts"},
    {type:"map", label:"Maps"},
    {type:"conjugate", label:"Conjugate"},
    {type:"games", label:"Games"},
  ];

  const bottomButtons = [
    {type:"basicStates", label:"Basic States"},
    {type:"symbols", label:"Symbols"},
    {type:"lexicon", label:"Lexicon"},
    {type:"summary", label:"Summary"},
    {type:"about", label:"About"},
  ];

  const renderButtons = (buttons: {type:string, label:string}[]) =>
    buttons.map((btn, i) => {
        const active = windows.some(w => w.type == btn.type);

        return(<button
            key={i}
            disabled={active}
            onClick={() => spawnWindow(btn.type, btn.label, i/(buttons.length-1))}//i/(buttons.length-1) to normalize
            className="w-full h-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 transition-colors duration-200"
            >
            {btn.label}
        </button>
        );
    }
  );

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
      className="fixed bottom-0 left-0 w-full h-18 z-50 pointer-events-auto z-20"
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