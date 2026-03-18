import { WindowData } from "../WindowManager"
import DockRow from "./DockRow"


interface DockColumnProps {
    side: string,
    width: number,
    rows: string[][], 
    windows: WindowData[]
    bringToFront: (id: string) => void
    updateWindow: (id: string, data: Partial<WindowData>) => void
    onClose: (id: string) => void
    renderWindowContent: (type: string) => React.ReactNode
};


export default function DockColumn({
    side, 
    width,
    rows,
    windows,
    bringToFront,
    updateWindow,
    onClose,
    renderWindowContent
}:DockColumnProps) {

    console.log("which side?: ", side);
    return (
        <div
        className="h-full flex flex-col border"
        style={{ width: `${width * 100}%` }}
        >
            {rows.map((row, i) => (
                <DockRow 
                key={i} 
                row={row} 
                windows={windows} 
                bringToFront={bringToFront}
                updateWindow={updateWindow}
                onClose={onClose}
                renderWindowContent={renderWindowContent}
                />
            ))}
        </div>
    );
}