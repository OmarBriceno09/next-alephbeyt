import { useMemo, useRef } from "react"
import { WindowData, Row} from "../WindowManager"
import SubWindow from "./SubWindow"


interface DockRowProps {
    row: Row,
    //numrows: number,
    windows: WindowData[]
    bringToFront: (id: string) => void
    updateWindow: (id: string, data: Partial<WindowData>) => void
    onClose: (id: string, mode:string) => void
    handleDragEnd: (id: string, x: number, y: number) => void
    renderWindowContent: (type: string) => React.ReactNode
    undockWindow: (id: string, y: number) => void
    //animOpenCloseCol: (state: "open"|"close", duration: number) => void
};


export default function DockRow({
    row, 
    //numrows,I need to know what the number of rows is left to choose animation
    windows,
    bringToFront,
    updateWindow,
    onClose,
    handleDragEnd,
    renderWindowContent,
    undockWindow,
    //animOpenCloseCol
}:DockRowProps) {
    const ref = useRef<HTMLDivElement>(null);


    const windowMap = useMemo(
        () => Object.fromEntries(windows.map(w => [w.id, w])),
        [windows]
    );


    /*
    const animateUndock = () => {
        if(numrows <= 1){
            //animOpenCloseCol("close", 0.2);
            console.log("last col out?");
        } else {
            const el = ref.current;
            gsap.to(el, {
                height: 0,
                duration: 0.2,
            });
        }
    }*/

    const renderSubWindow = () => {
        const win = windowMap[row.id];

        return win ? (
            <SubWindow
                key={win.id}
                win={win}
                bringToFront={bringToFront}
                updateWindow={updateWindow}
                onClose={onClose}
                handleDragEnd={handleDragEnd}
                undockWindow={undockWindow}
                >
                    {renderWindowContent(win.type)}
            </SubWindow>
        ) : null;
    };


    return (
        <div
            ref={ref} 
            className="dock-row"
            style={{
                height: `${100*row.size}%`
            }}
        >
            {renderSubWindow()}
        </div>
    );
}