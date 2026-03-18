import { useRef, useState } from "react"
import SubWindow from "./SubWindow"
import Footer from "../Footer"

import gsap from "gsap"
import ScrollToPlugin from "gsap/ScrollToPlugin";
import {Flip} from "gsap/Flip"
import { Script } from "@/types/Script";
import ScriptComparison from "./ScriptComparison";



gsap.registerPlugin(Flip)
gsap.registerPlugin(ScrollToPlugin);

export type WindowData  = {
  id: string
  label: string
  type: string
  x: number
  y:number
  width: number
  height: number
  z: number
}

type WindowManagerProps = {
    scripts: Script [],
}

export default function WindowManager({
    scripts,
}:WindowManagerProps) {

    const containerRef = useRef<HTMLDivElement>(null);
    const [windows, setWindows] = useState<WindowData[]>([]);
    const topZ = useRef(1);

    const renderWindowContent = (type: string) => {
        switch(type){
            case "comparison":
                return(<ScriptComparison scripts={scripts}/>);
            
            case "map":
                return(<div>
                    <h1>embedded map should go here.</h1>
                </div>);

            case "conjugate":
                return(<div>
                    <h1>This window is for conjugations.</h1>
                </div>);
            
            default:
                return null;
        }
    }

   
    const runFlip = (update: () => void) => {
        const state = Flip.getState(containerRef.current!.querySelectorAll(".subWindow"));
        update();
        requestAnimationFrame(() => {

            Flip.from(state, {
                duration: 0.25,
                ease: "power2.inOut",
                absolute: true,
                targets:".subWindow",

                onEnter: (elements) => {
                    gsap.fromTo(
                        elements,
                        { opacity: 0, scale: 0.9 },
                        { opacity: 1, scale: 1, duration: 0.25 }
                    );
                },
            });

        }); 
    }

    const spawnWindow = (type:string,label:string, relpos: number) => {

        const z = ++topZ.current

        const spawnW = 420;
        const spawnH = 320;
        const marginX = 100;
        const marginY = 100;
        const spawnX = marginX + relpos * (window.innerWidth - 2 * marginX - spawnW);
        const spawnY = marginY + (Math.sin(relpos*(2*Math.PI))/2+0.5) * (window.innerHeight - 2 * marginY - spawnH);

        console.log(spawnX);

        runFlip(() => {
            setWindows(prev => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    type,
                    label,
                    x:spawnX,
                    y:spawnY,
                    width:spawnW,
                    height:spawnH,
                    z
                }
            ]);
        });
    }


    const updateWindow = (id:string,data:Partial<WindowData>) => {
        setWindows(prev =>
        prev.map(w =>
            w.id === id ? {...w,...data} : w
        )
        )
    }

    const bringToFront = (id:string) => {
        const z = ++topZ.current

        setWindows(prev =>
            prev.map(w =>
                w.id === id ? {...w,z} : w
            )
        )
    }
    
    const closeWindow = (id:string) => {
        const el = containerRef.current?.querySelector(`[data-flip-id="${id}"]`);
        if(!el) return;

        gsap.to(el, {
            opacity:0,
            scale:0.9,
            duration:0.2,
            ease:"power2.inOut",
            onComplete:()=>{
                setWindows(prev => prev.filter(w=>w.id!==id));
            }
        });
    }

    return (
    <>
        <div 
            ref={containerRef}
            className="fixed inset-0 pointer-events-none"
        >
            {windows.map(win => (

                <SubWindow
                key={win.id}
                win={win}
                bringToFront={bringToFront}
                updateWindow={updateWindow}
                onClose={closeWindow}
                >

                    {renderWindowContent(win.type)}

                </SubWindow>

            ))}
        </div>

        <Footer windows={windows} spawnWindow={spawnWindow} />
    </>
    )
}