import { useLayoutEffect, useRef, useState } from "react"
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
  closing: boolean
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
    const flipState = useRef<any>(null);
    const [windows, setWindows] = useState<WindowData[]>([])


    const spawnWindow = (type: string, label: string) => {
        
        if (windows.some(w => w.type === type)) return;
        const newWindow = {
            id: crypto.randomUUID(),
            label,
            type,
            expanded: false,
            closing: false
        };

        flipState.current = Flip.getState(
            containerRef.current!.querySelectorAll(".subWindow")
        );
        
        setWindows(prev => [...prev, newWindow]);
    }


    function toggleExpand(id:string){
        
        flipState.current = Flip.getState(
            containerRef.current!.querySelectorAll(".subWindow")
        );

        setWindows(prev =>
            prev.map(w =>
            w.id === id
                ? {...w, expanded: !w.expanded}
                : w
            )
        );
    }


    const closeWindow = (id: string) => {

        flipState.current = Flip.getState(
            containerRef.current!.querySelectorAll(".subWindow")
        );

        setWindows(prev =>
            prev.map(w =>
            w.id === id 
                ? { ...w, closing: true } 
                : w
            )
        );

    }


    useLayoutEffect(() => {

        if (!flipState.current) return

        const state = flipState.current

        requestAnimationFrame(() => {

            Flip.from(state, {
                duration: 0.45,
                ease: "power2.inOut",
                absolute: true,
                targets: containerRef.current?.querySelectorAll(".subWindow"),

                onEnter: (elements) => {
                    return gsap.fromTo(
                        elements,
                        { opacity: 0, scale: 0.8 },
                        { opacity: 1, scale: 1, duration: 0.4 }
                    );
                },
                onLeave: (elements) => {
                    return gsap.fromTo(
                        elements,
                        { opacity: 1, scale: 1 },
                        { opacity: 0, scale: 0.8, duration: 0.35 }
                    );
                }
            });

            // remove closing windows AFTER the animation
            gsap.delayedCall(0.35, () => {
                setWindows(prev => prev.filter(w => !w.closing))
            });
        });

        flipState.current = null;

    }, [windows])


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
                closing={win.closing}
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