/* This component is responsible for rendering the 3d faces of the cube, and displaying the illustrated Letters, It is invoked by LetterGrid.tsx
and invokes Letter Modal when it is clicked. */

import React from "react";
import { Letter } from "@/types/Letter";
import { Script } from "@/types/Script";

function renderFace(
    faceName: string,
    letter: Letter,
    fontfam: string,
  ) {
    return (
      <div
        className={`face ${faceName}`}
        style={{ backgroundColor: letter.letter_color || "#f5f5f5" }}
        key={faceName}
      >
            {letter.display_image?.asset?.url ? (
                <h1 className="img-glyph-container">
                    <img
                    src={letter.display_image.asset.url}
                    alt={letter.letter_name}
                    className = "image-die-scale object-contain select-none"
                    />
                </h1>
            ) : (
                <h1 className="text-glyph-container">
                    <span
                        className="inline-block select-none leading-none text-die-scale"
                        style={{ fontFamily: `${fontfam}, sans-serif` }}
                    >
                        {letter.display}
                    </span>
                </h1>
            )}
        <span className="absolute bottom-0 select-none text-[clamp(0.6rem,1vw,1rem)] mt-1 text-center block">
            {letter.letter_name}
        </span>
      </div>
    );
}


interface LetterCubeProps {
    cubeId: string,
    scriptFaces: Script[],
    letterIndex: number,
    onClick: (letterIndex: number, element: HTMLDivElement) => void;
    allowModalClick: boolean,
    handleMouseEnter: (element: HTMLDivElement, duration: number)=> void;
    handleMouseLeave: (element: HTMLDivElement, duration: number)=> void;
    cubeRefs: React.RefObject<HTMLDivElement[]>,
    cubeRotators: React.RefObject<HTMLDivElement[]>,
    cubeScalers: React.RefObject<HTMLDivElement[]>,
    isSelected: boolean,
    scriptChange: (newScriptIndex: number) => void;
}

export default function LetterCube({ 
    cubeId,
    scriptFaces,
    letterIndex,
    onClick,
    allowModalClick,
    handleMouseEnter,
    handleMouseLeave,
    cubeRefs,
    cubeRotators,
    cubeScalers,
    isSelected, //get selectedCoord from parent object
}: LetterCubeProps) {

    return (
        <div 
            key={cubeId}
            data-index={letterIndex} //maybe delete if useless
            ref={(el) => {cubeRefs.current[letterIndex] = el!;}}
            className={`relative z-10 ${allowModalClick ? '' : 'pointer-events-none'}`}// No cursor-pointer here
            onClick={(e) => {
                if (allowModalClick && letterIndex>=0) {
                onClick(letterIndex, e.currentTarget as HTMLDivElement);
                }
            }}
            >
            
            <div
                className="cube perspective"
                ref={(el) => {cubeScalers.current[letterIndex] = el!;}}
                onMouseEnter={(e) => handleMouseEnter(e.currentTarget as HTMLDivElement, 0.3)}
                onMouseLeave={(e) => handleMouseLeave(e.currentTarget as HTMLDivElement, 0.3)}
            >
                <div 
                    className={`cube-inner ${isSelected ? 'hidden' : ''}`}
                    ref={(el) => {cubeRotators.current[letterIndex] = el!;}}
                >
                    {["front", "right", "left", "top", "bottom", "back"].map((faceName, faceIndex) => {
                        const script = scriptFaces[faceIndex];
                        const faceLetter = script?.letters?.[letterIndex];
                            
                        //if not, then default to zero for now?
                        const font = script?.font || "sans-serif";
                        
                        //console.log(faceLetter);
                        if (!faceLetter){
                            if(script){
                                return renderFace(faceName, script?.letters?.[0], font);
                            }
                            return null;
                        }
                        
                        return renderFace(faceName, faceLetter, font);
                    })}
                </div>
            </div>
        </div>
    );
}