"use client";

import { useEffect, useRef, useState } from "react"
import SubWindow from "./SubWindows/SubWindow"
import Footer from "./Footer"

import gsap from "gsap"
import ScrollToPlugin from "gsap/ScrollToPlugin";
import {Flip} from "gsap/Flip"
import { Script } from "@/types/Script";
import ScriptComparison from "./SubWindows/ScriptComparison";
import { MapTreeNode } from "@/types/MapTreeNode";
import DockRenderer from "./SubWindows/DockRenderer";
import { LetterIllustration } from "@/types/LetterIllustration";


gsap.registerPlugin(Flip);
gsap.registerPlugin(ScrollToPlugin);

export type WindowData  = {
  id: string
  label: string
  type: string
  mode: "floating" | "docked"

  //floating
  x: number
  y:number
  width: number
  height: number
  z: number
  //docking
  dockSide?: "left" | "right"
}

export type DockSide = "left" | "right";

export type Row = {
    id: string; //id
    size: number; //ratio from 0.0-1.0
};

export type DockLayout = {
  left: Row[];   // rows of window IDs
  right: Row[];
  leftWidth: number;
  rightWidth: number;
  middleWidth: number;
};

type WindowManagerProps = {
    scripts: Script [],
    mapTreeNodes: MapTreeNode[],
    letterIllustrations: LetterIllustration[]
}

export default function WindowManager({
    scripts,
    mapTreeNodes,
    letterIllustrations
}:WindowManagerProps) {

    const containerRef = useRef<HTMLDivElement>(null);
    const [windows, setWindows] = useState<WindowData[]>([]);
    const [dockLayout, setDockLayout] = useState<DockLayout>({
        left: [],
        right: [],
        leftWidth: 0,
        rightWidth: 0,
        middleWidth: 0,
    });
    const topZ = useRef(1);

    useEffect(() => {
        const handleResize = () => {
            const dockCopy = {...dockLayout};
            dockCopy.middleWidth = window.innerWidth - dockCopy.leftWidth - dockCopy.rightWidth;
            setDockLayout(dockCopy);
        };

        if(dockLayout.middleWidth == 0){//when the window starts
            const dockCopy = {...dockLayout};
            dockCopy.middleWidth = window.innerWidth;
            setDockLayout(dockCopy);
        }

        window.addEventListener('resize', handleResize);
        return ()=> window.removeEventListener('resize', handleResize);
    }, [dockLayout]);


    const renderWindowContent = (type: string) => {
        switch(type){
            case "comparison":
                return(<ScriptComparison scripts={scripts}/>);
            
            case "map":
                return(<div>
                    <h1>embedded map should go here.</h1>
                </div>);

            case "conjugate":
                return(
                    <div 
                        className= "relative w-full overflow-auto bg-white"
                        style={{
                            height:"100%",
                            border:"1px solid #ddd",
                        }}
                    >
                        <h1>This window is for conjugations.</h1>
                    </div>
                );
            
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
                targets:".subWindow.floating",
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

        runFlip(() => {
            setWindows(prev => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    type,
                    label,
                    mode:"floating",
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
        );
    }


    const updateDockWidth = (side:string, width:number) => {

        const dockCopy = {...dockLayout};
        if(side=="right"){
            dockCopy.rightWidth = width;
            dockCopy.middleWidth = window.innerWidth - dockCopy.leftWidth - width;
        }else{
            dockCopy.leftWidth = width;
            dockCopy.middleWidth = window.innerWidth - dockCopy.rightWidth - width;
        }

        setDockLayout(dockCopy);
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
        //console.log("closing?...");
        const el = containerRef.current?.querySelector(`[data-flip-id="${id}"]`);
        if(!el) return;
        //console.log("yes: ", el);

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


    const dockWindow = (id:string, side: "left"|"right", y:number) => {
        const el = document.querySelector(`[data-window-id="${id}"]`);
        if (el) {
            gsap.set(el, { clearProps: "transform" });
        }
        setWindows(prev =>
            prev.map(w =>
                w.id ===id
                ? {...w, 
                    mode: "docked", 
                    dockSide:side
                }
                : w
        ));

        setDockLayout(prev => {
            const column = prev[side];
            const insertRowIndex = Math.floor((y/window.innerHeight)*column.length+0.5);//0.5 works for some reason
            const exists = column.some(row => row.id === id);
            if (exists) return prev;
            const newRow = {id, size:1};

            const newColumn = [...column];
            newColumn.splice(insertRowIndex, 0, newRow);
            return {...prev, [side]:normalizeColumn(newColumn)};
        });
    };

    const normalizeColumn = (column: Row[]): Row[] => {
        const size = 1/column.length;
        return column.map(row=> ({
            ...row,
            size
        }));
    };


    const undockWindow = (id: string, y: number) => {
        setWindows(prev =>
            prev.map(w =>
            w.id === id
                ? {
                    ...w,
                    mode: "floating",
                    dockSide: undefined,
                    y
                }
                : w
            )
        );
        setDockLayout(prev => ({
            ...prev,
            left: normalizeColumn(prev.left.filter(row => row.id !== id)),
            right: normalizeColumn(prev.right.filter(row => row.id !== id)),
        }));
    };


    const detectDock = (x: number) => {
        const EDGE = 80;

        if (x < EDGE) return "left";
        if (x > window.innerWidth - EDGE) return "right";

        return null;
    };


    const handleDragEnd = (id: string, x: number, y: number) => {
        
        const side = detectDock(x);

        if (side) {
            dockWindow(id, side, y);
        }
    };
    

    return (
    <div 
        className="w-full h-full flex"
    >

        <DockRenderer
            windows={windows}
            layout={dockLayout}
            scripts={scripts}
            mapTreeNodes={mapTreeNodes}
            letterIllustrations={letterIllustrations}
            bringToFront={bringToFront}
            updateWindow={updateWindow}
            onClose={closeWindow}
            handleDragEnd={handleDragEnd}
            renderWindowContent={renderWindowContent}
            updateDockWidth={updateDockWidth}
            undockWindow={undockWindow}
        />

        
        <div 
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-10"
        >
            {windows
                .filter(w => w.mode === "floating")
                .map(win => (

                    <SubWindow
                    key={win.id}
                    win={win}
                    bringToFront={bringToFront}
                    updateWindow={updateWindow}
                    onClose={closeWindow}
                    handleDragEnd={handleDragEnd}
                    undockWindow={undockWindow}
                    >

                        {renderWindowContent(win.type)}

                    </SubWindow>

            ))}
        </div>

        <Footer windows={windows} spawnWindow={spawnWindow} />
    </div>
    )
}