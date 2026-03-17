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

    const spawnWindow = (type:string,label:string) => {

        const z = ++topZ.current

        setWindows(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                type,
                label,
                x:200,
                y:120,
                width:420,
                height:320,
                z
            }
        ])
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
        setWindows(prev => prev.filter(w=>w.id!==id))
    }

    return (
    <>
        <div className="fixed inset-0 pointer-events-none">
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