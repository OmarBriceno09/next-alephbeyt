import { DockLayout } from "../WindowManager";
import MapTreeContainer, { MapTreeContainerHanlde }  from "../MapTreeContainer/MapTreeContainer";
import { WindowData } from "../WindowManager";
import { Script } from '@/types/Script';
import { MapTreeNode } from '@/types/MapTreeNode';
import DockColumn from "./DockColumn";
import { useRef } from "react";
import gsap from "gsap"

interface DockRendererProps {
    windows: WindowData[],
    layout: DockLayout,
    scripts: Script[], 
    mapTreeNodes: MapTreeNode[]
    bringToFront: (id: string) => void
    updateWindow: (id: string, data: Partial<WindowData>) => void
    onClose: (id: string) => void
    handleDragEnd: (id: string, x: number, y: number) => void
    renderWindowContent: (type: string) => React.ReactNode
    updateDockWidth: (side:string, width:number) => void
    undockWindow: (id: string, y: number) => void
};

export default function DockRenderer({
    windows, 
    layout,
    scripts,
    mapTreeNodes,
    bringToFront,
    updateWindow,
    onClose,
    handleDragEnd,
    renderWindowContent,
    updateDockWidth,
    undockWindow
}:DockRendererProps) {
  
  const mtRef = useRef<HTMLDivElement>(null);
  const MapTreeContainerRefHandle = useRef<MapTreeContainerHanlde> (null);

  const leftWidth = layout.leftWidth;//layout.left.length ? layout.leftWidth : 0;
  const rightWidth = layout.rightWidth;//layout.right.length ? layout.rightWidth : 0;

  const centerWidth = layout.middleWidth;//document.documentElement.clientWidth - leftWidth - rightWidth;

  
  
  //this function will be called when only one column is scaling
  const updateGsapCenterWidth = (side:string, colWidth:number) => {
    const el = mtRef.current;
    const calculatedWidth = window.innerWidth - (colWidth + ((side=="right") ? layout.leftWidth : layout.rightWidth));
    
    MapTreeContainerRefHandle.current?.handleRescaleTree(calculatedWidth);
    gsap.set(el, {
      width: calculatedWidth,
    });
  };

  const animateGsapCenterWidth = (side:string, colWidth:number, durartion: number) => {
    const el = mtRef.current;
    const calculatedWidth = window.innerWidth - (colWidth + ((side=="right") ? layout.leftWidth : layout.rightWidth));
    
    //MapTreeContainerRefHandle.current?.handleRescaleAnimTree(calculatedWidth, durartion);
    /**TODO: figure out how to properly use gsap animations to rescale the dice containers and the tree, 
     * right now it looks like low fps, maybe a little choppy :/
     */
    gsap.to(el, {
      width: calculatedWidth,
      duration: durartion,
      onUpdate: () => {
        const updateWidth = Number(gsap.getProperty(el,"width"));
        MapTreeContainerRefHandle.current?.handleRescaleTree(updateWidth);
      }
    });
  };


  return (
    <>
      {/* LEFT */}
        <DockColumn
          side="left"
          width={leftWidth}
          rows={layout.left}
          windows={windows}
          bringToFront={bringToFront}
          updateWindow={updateWindow}
          onClose={onClose}
          handleDragEnd={handleDragEnd}
          renderWindowContent={renderWindowContent}
          updateDockWidth={updateDockWidth}
          updateGsapCenterWidth={updateGsapCenterWidth}
          animateGsapCenterWidth={animateGsapCenterWidth}
          undockWindow={undockWindow}
        />

      {/* CENTER (MapTree) */}
      <div
        ref={mtRef}
        className="h-full"
        style={{ 
          width: `${centerWidth}px`,
        }}
      >
        <MapTreeContainer
            ref={MapTreeContainerRefHandle}
            scripts={scripts}
            mapTreeNodes={mapTreeNodes}
            windowWidth={centerWidth}
        />
      </div>
   
      {/* RIGHT */}
      <DockColumn
        side="right"
        width={rightWidth}
        rows={layout.right}
        windows={windows}
        bringToFront={bringToFront}
        updateWindow={updateWindow}
        onClose={onClose}
        handleDragEnd={handleDragEnd}
        renderWindowContent={renderWindowContent}
        updateDockWidth={updateDockWidth}
        updateGsapCenterWidth={updateGsapCenterWidth}
        animateGsapCenterWidth={animateGsapCenterWidth}
        undockWindow={undockWindow}
      />
    </>
  );
}