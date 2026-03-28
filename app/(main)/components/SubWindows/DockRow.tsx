import { WindowData } from "../WindowManager"
import SubWindow from "./SubWindow"


interface DockRowProps {
    row: string[],
    windows: WindowData[]
    numrows: number
    bringToFront: (id: string) => void
    updateWindow: (id: string, data: Partial<WindowData>) => void
    onClose: (id: string) => void
    handleDragEnd: (id: string, x: number, y: number) => void
    renderWindowContent: (type: string) => React.ReactNode
};


export default function DockRow({
    row, 
    windows,
    numrows,
    bringToFront,
    updateWindow,
    onClose,
    handleDragEnd,
    renderWindowContent
}:DockRowProps) {
    return (
        <div 
            className="dock-row"
            style={{
                height: `${100 / numrows}%`
            }}
        >
            {row.map(id => {
                const win = windows.find(w => w.id === id);
                if (!win) return null;

                return (
                    <SubWindow
                    key={win.id}
                    win={win}
                    docked={true}
                    bringToFront={bringToFront}
                    updateWindow={updateWindow}
                    onClose={onClose}
                    handleDragEnd={handleDragEnd}
                    >
                        {renderWindowContent(win.type)}
                    </SubWindow>
                );
            })}
        </div>
    );
}