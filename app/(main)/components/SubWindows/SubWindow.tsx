/* 
  Before- I had the sytem work in a chain of operations like this:
      mousemove -> setState -> React re-renders -> DOM update
    This will eventually become laggy if there are 20+ SubWindows.
  
  After - To avoid the overdraw issue, I re-designed it so that dragging doesn't cause react to 
    re-render, and the react state should only update after interactions finish. So the flow looks
    like this:
      mousemove -> update DOM style directly (gsap.set(el, {... x and y}))
      mouseup -> commit final values to react state (updateWindow(..x and y))

*/
"use client";

import { useRef, useState } from "react"
import { WindowData } from "../WindowManager"
import gsap from "gsap"

type SubWindowProps = {
  win: WindowData
  bringToFront: (id: string) => void
  updateWindow: (id: string, data: Partial<WindowData>) => void
  onClose: (id: string) => void
  handleDragEnd: (id: string, x: number, y: number) => void
  undockWindow: (id: string, y: number) => void
  children: React.ReactNode
}

export default function SubWindow({
  win,
  bringToFront,
  updateWindow,
  onClose,
  handleDragEnd,
  undockWindow,
  children
}:SubWindowProps){

  const ref = useRef<HTMLDivElement>(null);
  //const isDocked = useRef<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  /*useEffect(() => {
    if(win.mode == "docked" && !isDocked.current){
      console.log("set to docked");
      isDocked.current = true;
    }
  }, [win]);*/


  //call this to check if window needs to be undocked
  const startDrag = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    if (win.mode === "docked")
      undockWindow(win.id, startY-10); //startY-10- estimate for middle of header

    requestAnimationFrame(() => {
      const el = document.querySelector(
        `[data-flip-id="${win.id}"]`
      ) as HTMLElement;
      if (!el) return;

      beginDrag(e, el, startX, startY);
    });
  }


  const beginDrag = (e:React.MouseEvent, el:HTMLElement, startX: number, startY: number) => {

    setIsDragging(true);
    bringToFront(win.id);
    document.body.classList.add("dragging");

    const rect = el.getBoundingClientRect();
    const startLeft = rect.left;
    const startTop = rect.top;
    
    const move = (ev:MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      const x = Math.min(Math.max(startLeft + dx, 0), window.innerWidth-win.width);
      const y = Math.min(Math.max(startTop + dy, 0), window.innerHeight-100); //I will allow window hiding below
      
      gsap.set(el,{ x: x, y: y });
    }

    const up = (ev:MouseEvent) => {
      //restoring text selection
      //console.log("after: ", el);
      setIsDragging(false);
      document.body.classList.remove("dragging");

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      const finalX = Math.min(Math.max(startLeft + dx, 0), window.innerWidth-win.width);
      const finalY = Math.min(Math.max(startTop + dy, 0), window.innerHeight-100);

      /*const partialData : Partial<WindowData> = (win.mode === "docked") 
        ? {mode: "floating", dockSide: undefined, x:finalX, y:finalY}
        : { x: finalX, y: finalY }*/
      updateWindow(win.id, { x: finalX, y: finalY });
      handleDragEnd(win.id, ev.clientX, ev.clientY);

      window.removeEventListener("mousemove",move);
      window.removeEventListener("mouseup",up);
    }

    window.addEventListener("mousemove",move);
    window.addEventListener("mouseup",up);
  }

  
  const startResize = (
    e:React.MouseEvent,
    dir:string
  ) => {
    e.stopPropagation();
    // disable text selection
    document.body.classList.add("dragging");

    const startX = e.clientX;
    const startY = e.clientY;

    const startW = win.width;
    const startH = win.height;
    const startXpos = win.x;
    const startYpos = win.y;

    const el = ref.current;
    if(!el) return;

    let x = startXpos;
    let y = startYpos;
    let w = startW;
    let h = startH;

    const move = (ev:MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      const minW = 350;
      const minH = 200;

      const right = startXpos + startW;
      const bottom = startYpos + startH;

      if (dir.includes("e")) {
        w = Math.min(Math.max(minW, startW + dx), window.innerWidth - startXpos);
      }

      if (dir.includes("s")) {
        h = Math.max(minH, startH + dy);
      }

      if (dir.includes("w")) {
        x = Math.min(Math.max(startXpos + dx, 0), right - minW);
        w = right - x;
      }

      if (dir.includes("n")) {
        y = Math.min(Math.max(startYpos + dy, 0), bottom - minH);
        h = bottom - y;
      }

      gsap.set(el,{
        x: x,
        y: y,
        width: w,
        height: h,
      });
    }


    const up = ()=>{
      //restoring text selection
      document.body.classList.remove("dragging");
      updateWindow(win.id,{
        x:x,
        y:y,
        width:w,
        height:h
      });

      window.removeEventListener("mousemove",move);
      window.removeEventListener("mouseup",up);
    }

    window.addEventListener("mousemove",move);
    window.addEventListener("mouseup",up);
  }

  //console.log("isDragging: ", isDragging);

  return (
    <div
      ref={ref}
      data-flip-id={win.id}
      className={`shadow-xl flex flex-col pointer-events-auto subWindow ${win.mode === "docked" && !isDragging ? "docked" : "floating"}`}
      style={
        win.mode === "docked" && !isDragging
        ? {
          width: "100%",
          height: "100%",
        }
      : {
          transform:`translate(${win.x}px,${win.y}px)`,
          width: win.width,
          height: win.height,
          position:"absolute",
          zIndex: win.z
      }}
    >

      {/*Header (drag handle)*/}
      <div
        className="windowHeader bg-gray-200 cursor-move select-none"
        onMouseDown={startDrag}
      >
        {win.label}

        <button className="subWinBtn" onClick={() => onClose(win.id)}>✕</button>
      </div>

      {/*Content*/}
      <div className="windowContent flex-1 overflow-auto">
        {children}
      </div>

      {/*Resize Handles*/}
      {(win.mode === "floating") ?(
          <>
            <div className="resize n" onMouseDown={(e)=>startResize(e,"n")} />
            <div className="resize s" onMouseDown={(e)=>startResize(e,"s")} />
            <div className="resize e" onMouseDown={(e)=>startResize(e,"e")} />
            <div className="resize w" onMouseDown={(e)=>startResize(e,"w")} />
            <div className="resize ne" onMouseDown={(e)=>startResize(e,"ne")} />
            <div className="resize nw" onMouseDown={(e)=>startResize(e,"nw")} />
            <div className="resize se" onMouseDown={(e)=>startResize(e,"se")} />
            <div className="resize sw" onMouseDown={(e)=>startResize(e,"sw")} />
          </>
        ):(
          <></>
      )}
    </div>
  );
}