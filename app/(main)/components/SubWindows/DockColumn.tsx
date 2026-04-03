import { useEffect, useRef } from "react"
import { WindowData, Row } from "../WindowManager"
import DockRow from "./DockRow"
import gsap from "gsap"


interface DockColumnProps {
    side: string,
    width: number,
    rows: Row[], 
    windows: WindowData[]
    bringToFront: (id: string) => void
    updateWindow: (id: string, data: Partial<WindowData>) => void
    onClose: (id: string) => void
    handleDragEnd: (id: string, x: number, y: number) => void
    renderWindowContent: (type: string) => React.ReactNode
    updateDockWidth: (side:string, width:number) => void
    updateGsapCenterWidth: (side:string, colWidth:number) => void
    animateGsapCenterWidth:  (side:string, colWidth:number, durartion: number) => void
    undockWindow: (id: string, y: number) => void
};

const MinWidth = 400;

/**TODO: So the biggest issue in my code was the fact that I scaled the middle piece to an
 * enourmosuly large amount, that is why my side docks weren't scaling correctly. Now the bigger
 * question is... how am I going to control the left-right and center divs widths in the DockRenderer..
 */


export default function DockColumn({
    side, 
    width,
    rows,
    windows,
    bringToFront,
    updateWindow,
    onClose,
    handleDragEnd,
    renderWindowContent,
    updateDockWidth,
    updateGsapCenterWidth,
    animateGsapCenterWidth,
    undockWindow
}:DockColumnProps) {

    const ref = useRef<HTMLDivElement>(null);
    
    useEffect(()=>{
        if(width==0 && rows.length>0){
            animateOpenClose("open", 0.2);
        }
        if(width>0 && rows.length==0){
            animateOpenClose("close", 0.2);
        }
        //close will be handled by the last row
    }, [width, rows]);


    /**Open the Column when:
     *  A row has been added
     * Close when:
     *  last row is "moved"
     */
    const animateOpenClose = (state: "open"|"close", duration: number) => {
        const toVal = (state=="open") ? MinWidth : 0;
        const el = ref.current;

        animateGsapCenterWidth(side, toVal, duration); //at the same time
        gsap.to(el,{
            width: toVal,
            duration: duration,
            onComplete: () => {
                updateDockWidth(side, toVal);
            }
        });
    }

    const startResize = (
        e:React.MouseEvent,
        dir:string
    ) => {
        e.stopPropagation();
        // disable text selection
        document.body.classList.add("dragging");

        const startX = e.clientX;

        const startW = width;

        const el = ref.current;
        if(!el) return;

        let w = startW;

        const move = (ev:MouseEvent) => {
            const dx = ev.clientX - startX;

            const minW = MinWidth;

            if (dir.includes("e")) {
                w = Math.min(Math.max(minW, startW + dx), window.innerWidth);
            }
            if (dir.includes("w")) {
                w = Math.min(Math.max(minW, startW - dx), window.innerWidth);
            }

            gsap.set(el,{
                width: w,
            });
            updateGsapCenterWidth(side, w);
        }


        const up = ()=>{
            //restoring text selection
            document.body.classList.remove("dragging");
            updateDockWidth(side, w);

            window.removeEventListener("mousemove",move);
            window.removeEventListener("mouseup",up);
        }

        window.addEventListener("mousemove",move);
        window.addEventListener("mouseup",up);
    }

    return (
        <div
        ref={ref}
        className="dock-column bg-gray-400 border-2 border-gray-400 z-5"
        style={{ 
            width: width,
            //backgroundColor: "#9215cc", 
        }}
        >
            {rows.map((row, i) => (
                <DockRow 
                key={i} 
                row={row}
                //numrows={rows.length} 
                windows={windows} 
                bringToFront={bringToFront}
                updateWindow={updateWindow}
                onClose={onClose}
                handleDragEnd={handleDragEnd}
                renderWindowContent={renderWindowContent}
                undockWindow={undockWindow}
                animOpenCloseCol={animateOpenClose}
                />
            ))}
            {side=="right" ? (
                <div className="resize w" onMouseDown={(e)=>startResize(e,"w")}/>
            ):(
                <div className="resize e" onMouseDown={(e)=>startResize(e,"e")}/>
            )}
        </div>
    );
}