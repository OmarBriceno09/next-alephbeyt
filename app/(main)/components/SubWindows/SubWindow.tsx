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

import { useRef } from "react"
import { WindowData } from "../WindowManager"
import gsap from "gsap"

type SubWindowProps = {
  win: WindowData
  docked: boolean
  bringToFront: (id: string) => void
  updateWindow: (id: string, data: Partial<WindowData>) => void
  onClose: (id: string) => void
  children: React.ReactNode
}

export default function SubWindow({
  win,
  docked,
  bringToFront,
  updateWindow,
  onClose,
  children
}:SubWindowProps){

  const ref = useRef<HTMLDivElement>(null);
  const isDocked = docked ?? (win.mode === "docked");

  const startDrag = (e:React.MouseEvent) => {

    bringToFront(win.id);
    // disable text selection
    document.body.classList.add("dragging");

    const startX = e.clientX;
    const startY = e.clientY;

    const startLeft = win.x;
    const startTop = win.y;

    const el = ref.current;
    if(!el) return;

    const move = (ev:MouseEvent) => {

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      const x = Math.min(Math.max(startLeft + dx, 0), window.innerWidth-win.width);
      const y = Math.min(Math.max(startTop + dy, 0), window.innerHeight-100); //I will allow window hiding below

      gsap.set(el,{
        x: x,
        y: y
      });
    }

    const up = (ev:MouseEvent) => {
      //restoring text selection
      document.body.classList.remove("dragging");

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      updateWindow(win.id,{
        x: Math.min(Math.max(startLeft + dx, 0), window.innerWidth-win.width),
        y: Math.min(Math.max(startTop + dy, 0), window.innerHeight-100)
      });

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

  return (
    <div
      ref={ref}
      data-flip-id={win.id}
      className={`shadow-xl flex flex-col pointer-events-auto subWindow ${isDocked ? "docked" : "floating"}`}
      style={
        isDocked
        ? {
          width: "100%",
          height: "100%"
        }
      : {
          transform:`translate(${win.x}px,${win.y}px)`,
          width: win.width,
          height: win.height,
          position:"absolute",
          zIndex: win.z
      }}
      onMouseDown={() => bringToFront(win.id)}
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
      <div className="resize n" onMouseDown={(e)=>startResize(e,"n")} />
      <div className="resize s" onMouseDown={(e)=>startResize(e,"s")} />
      <div className="resize e" onMouseDown={(e)=>startResize(e,"e")} />
      <div className="resize w" onMouseDown={(e)=>startResize(e,"w")} />
      <div className="resize ne" onMouseDown={(e)=>startResize(e,"ne")} />
      <div className="resize nw" onMouseDown={(e)=>startResize(e,"nw")} />
      <div className="resize se" onMouseDown={(e)=>startResize(e,"se")} />
      <div className="resize sw" onMouseDown={(e)=>startResize(e,"sw")} />

    </div>
  );
}