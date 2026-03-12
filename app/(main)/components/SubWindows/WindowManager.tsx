import { useRef, useState } from "react"
import SubWindow from "./SubWindow"
import Footer from "../Footer"

import gsap from "gsap"
import {Flip} from "gsap/Flip"

gsap.registerPlugin(Flip)

export type WindowData  = {
  id: string
  label: string
  type: string
  expanded: boolean
  closing?: boolean
}

function renderWindowContent(type: string) {
    switch(type){
        case "comparison":
            return(<div>
                <h1>comparison content haha.</h1>
            </div>)
        
        case "map":
            return(<div>
                <h1>embedded map should go here.</h1>
            </div>)

        case "conjugate":
            return(<div>
                <h1>This window is for conjugations.</h1>
            </div>)
        
        default:
            return null;
    }

}

export default function WindowManager() {

    const containerRef = useRef<HTMLDivElement>(null);
    const [windows, setWindows] = useState<WindowData[]>([])


    const runFlip = (update: () => void) => {
        const state = Flip.getState(containerRef.current!.querySelectorAll(".subWindow"));

        update();

        requestAnimationFrame(() => {

            Flip.from(state, {
                duration: 0.45,
                ease: "power2.inOut",
                absolute: true,
                targets:".subWindow",

                onEnter: (elements) => {
                    gsap.fromTo(
                        elements,
                        { opacity: 0, scale: 0.9 },
                        { opacity: 1, scale: 1, duration: 0.35 }
                    );
                },
            });

        });
    }

    const spawnWindow = (type: string, label: string) => {
        
        if (windows.some(w => w.type === type)) return;

        runFlip(() => {
            setWindows(prev => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    label,
                    type,
                    expanded: false

                }
            ]);
        });
    }

    
    const toggleExpand = (id: string) => {

        runFlip(() => {

        setWindows(prev =>
            prev.map(w =>
            w.id === id
                ? { ...w, expanded: !w.expanded }
                : w
            )
        );

        });
    }

    
    const closeWindow = (id:string) => {

        const el = containerRef.current?.querySelector(`[data-flip-id="${id}"]`);

        if(!el) return;

        gsap.to(el,{
            opacity:0,
            scale:0.9,
            duration:0.3,
            ease:"power2.inOut",
            onComplete:()=>{

            runFlip(()=>{
                setWindows(prev => prev.filter(w => w.id !== id));
            });

            }
        });

    }

    return (
    <>
        <div   
            ref={containerRef}
            className="windowArea"
        >

            {windows.map(win => (

                <SubWindow
                key={win.id}
                id={win.id}
                label={win.label}
                expanded={win.expanded}
                closing={win?.closing}
                onClose={closeWindow}
                onExpand={toggleExpand}
                >

                {renderWindowContent(win.type)}

                </SubWindow>

            ))}

        </div>

        <Footer windows={windows} spawnWindow={spawnWindow} />
    </>
    )
}