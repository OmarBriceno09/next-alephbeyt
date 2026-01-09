
import { Script } from "@/types/Script";
import gsap from "gsap";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


interface SelectedScriptTitleProps {
    scripts: Script [],
    SWITCHROTTIME: number,
    onSwitchTreeView: (toTreeView: boolean) => void;

}

export type SelectedScriptTitleHandle = {
    hideTitle: (isHide: boolean, time:number) => void;
    handleScriptChange: (newScriptIndex: number) => Promise<void>;
}

const SelectedScriptTitle = forwardRef<SelectedScriptTitleHandle, SelectedScriptTitleProps>(
    function SelectedScriptTitle(
        {
            scripts,
            SWITCHROTTIME,
            onSwitchTreeView
        },
        ref
    ){
        const SelectedScriptTitleRef = useRef<HTMLDivElement> (null);
        const [titleKey, setTitleKey] = useState(0);

        const hideTitle = (isHide: boolean, time:number) => {
            const moveToY = (isHide) ? -100: 0;
            const toPos = {x:0, y:moveToY};
            AnimatePosition(toPos, time);

        }

        const AnimatePosition = async (toPos: {x:number, y:number}, time: number): Promise<void> => {
            return new Promise(resolve=> {
                gsap.to(
                    SelectedScriptTitleRef.current,
                    {
                        x: toPos.x,
                        y: toPos.y,
                        duration: time,
                        ease: "power2.in",
                        onComplete: () => {
                            resolve();
                        }
                    }
                );
            });
        };

        const handleMouseEnter = (el: HTMLDivElement, time:number) => {
            gsap.killTweensOf(el); // stop previous tweens
            gsap.to(el, { 
                scale: 1.05,
                duration: time, 
                ease: "power2.out" });
        };


        const handleMouseLeave = (el: HTMLDivElement, time:number): Promise<void> => {
            return new Promise((resolve) => {
                gsap.killTweensOf(el); //stop previous tweens
                gsap.to(
                    el, 
                    { 
                        scale: 1,
                        duration: time, 
                        ease: "power2.out",
                        onComplete: () => {
                            resolve();
                        }
                    }
                )
            });
        };



        const handleScriptChange = async (newScriptIndex: number) => {
            return new Promise<void>((resolve=>{
                setTitleKey(newScriptIndex);
                resolve();
            }));
        }


        useImperativeHandle(ref, () => ({
            hideTitle,
            handleScriptChange
        }));


        return(
            <div 
                ref = {SelectedScriptTitleRef}
                className="scriptTitle text-center"
                onClick={()=>onSwitchTreeView(true)}// switch to tree-view when title is clicked
                onMouseEnter={(e)=>handleMouseEnter(e.currentTarget as HTMLDivElement, 0.3)}
                onMouseLeave={(e)=>handleMouseLeave(e.currentTarget as HTMLDivElement, 0.3)}
                //style = {{backgroundColor: "#4274e0ff",}}
            >

                <AnimatePresence mode="wait">
                    <motion.h1
                    key={titleKey}
                    initial={{ y: "-100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ duration: SWITCHROTTIME/2, ease: "easeInOut" }}
                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-center select-none"
                    >
                        {scripts[titleKey]?.title}
                    </motion.h1>
                </AnimatePresence>
            </div>
        );
    }
);

export default SelectedScriptTitle;


