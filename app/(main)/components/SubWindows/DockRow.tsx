import { WindowData } from "../WindowManager"
import SubWindow from "./SubWindow"


interface DockRowProps {
    row: string[],
    windows: WindowData[]
    bringToFront: (id: string) => void
    updateWindow: (id: string, data: Partial<WindowData>) => void
    onClose: (id: string) => void
    renderWindowContent: (type: string) => React.ReactNode
};


export default function DockRow({
    row, 
    windows,
    bringToFront,
    updateWindow,
    onClose,
    renderWindowContent
}:DockRowProps) {
    return (
        <div className="flex-1 border-b">
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
                >
                    {renderWindowContent(win.type)}
                </SubWindow>
            );
        })}
        </div>
    );
}