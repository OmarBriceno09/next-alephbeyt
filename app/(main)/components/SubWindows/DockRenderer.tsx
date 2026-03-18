import { DockLayout } from "../WindowManager";
import MapTreeContainer from "../MapTreeContainer/MapTreeContainer";
import { WindowData } from "../WindowManager";
import { Script } from '@/types/Script';
import { MapTreeNode } from '@/types/MapTreeNode';
import DockColumn from "./DockColumn";


interface DockRendererProps {
    windows: WindowData[],
    layout: DockLayout,
    scripts: Script[], 
    mapTreeNodes: MapTreeNode[]
    bringToFront: (id: string) => void
    updateWindow: (id: string, data: Partial<WindowData>) => void
    onClose: (id: string) => void
    renderWindowContent: (type: string) => React.ReactNode
};

export default function DockRenderer({
    windows, 
    layout,
    scripts,
    mapTreeNodes,
    bringToFront,
    updateWindow,
    onClose,
    renderWindowContent,
}:DockRendererProps) {
  const leftWidth = layout.left.length ? layout.leftWidth : 0;
  const rightWidth = layout.right.length ? layout.rightWidth : 0;

  const centerWidth = 1 - leftWidth - rightWidth;

  return (
    <>
      {/* LEFT */}
      {leftWidth > 0 && (
        <DockColumn
          side="left"
          width={leftWidth}
          rows={layout.left}
          windows={windows}
          bringToFront={bringToFront}
          updateWindow={updateWindow}
          onClose={onClose}
          renderWindowContent={renderWindowContent}
        />
      )}

      {/* CENTER (MapTree) */}
      <div
        className="h-full"
        style={{ width: `${centerWidth * 100}%` }}
      >
        <MapTreeContainer
            scripts={scripts}
            mapTreeNodes={mapTreeNodes}
        />
      </div>

      {/* RIGHT */}
      {rightWidth > 0 && (
        <DockColumn
          side="right"
          width={rightWidth}
          rows={layout.right}
          windows={windows}
          bringToFront={bringToFront}
          updateWindow={updateWindow}
          onClose={onClose}
          renderWindowContent={renderWindowContent}
        />
      )}
    </>
  );
}