import React from "react";
import { Letter } from "@/types/Letter";
import { Script } from "@/types/Script";
//import { PortableText } from '@portabletext/react';

type LettersSharedRow = {
    letter_name: string;
    key_color: string;
}

function renderFace(
    faceName: string,
    letter: Letter,
    sData: LettersSharedRow,
    fontfam: string,
  ) {
    return (
      <div
        className={`face ${faceName}`}
        style={{ backgroundColor: sData.key_color || "#f5f5f5" }}
        key={faceName}
      >
            {letter.display_image?.asset?.url ? (
                <h1 className="img-glyph-container">
                    <img
                    src={letter.display_image.asset.url}
                    alt={letter.letter_name}
                    className = "w-[clamp(2rem,4vw,5rem)] h-[clamp(2rem,4vw,5rem)] object-contain"
                    />
                </h1>
            ) : (
                <h1 className="text-glyph-container">
                    <span
                        className="inline-block select-none leading-none translate-y-[8%] text-[clamp(2rem,4vw,4rem)]"
                        style={{ fontFamily: `${fontfam}, sans-serif` }}
                    >
                        {letter.display}
                    </span>
                </h1>
            )}
        <span className="select-none text-[clamp(0.6rem,1vw,1rem)] mt-1 text-center block">
            {letter.letter_name}
        </span>
      </div>
    );
}

interface LetterCubeProps {
    cubeId: string,
    letter: Letter|undefined,
    shareddata: LettersSharedRow[],
    scriptFaces: Script[],
    cubeRefIndex: number,
    row: number,
    col: number,
    onClick: (letter: Letter, i: number, j: number, element: HTMLDivElement) => void;
    allowModalClick: boolean,
    handleMouseEnter: (element: HTMLDivElement, duration: number)=> void;
    handleMouseLeave: (element: HTMLDivElement, duration: number)=> void;
    cubeRefs: React.RefObject<HTMLDivElement[][]>,
    isSelected: boolean,
    onClose: () => void;
}

export default function LetterCube({ 
    cubeId,
    letter,
    shareddata,
    scriptFaces,
    cubeRefIndex,
    row,
    col,
    onClick,
    allowModalClick,
    handleMouseEnter,
    handleMouseLeave,
    cubeRefs,
    isSelected, //get selectedCoord from parent object
    onClose,
}: LetterCubeProps) {

    return (
        <div 
            key={cubeId}
            className="relative z-[10]" // No cursor-pointer here
            onClick={(e) => {
                if (allowModalClick && letter) {
                onClick(letter, row, col, e.currentTarget as HTMLDivElement);
                }
            }}
            onMouseEnter={(e) => handleMouseEnter(e.currentTarget as HTMLDivElement, 0.3)}
            onMouseLeave={(e) => handleMouseLeave(e.currentTarget as HTMLDivElement, 0.3)}
            >
            {isSelected && (
                <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute top-1 right-1 z-[50] pointer-events-auto text-black px-1"
                >
                ✕
                </button>
            )}
            <div
                ref={(el) => {
                if (!cubeRefs.current[row]) {
                    cubeRefs.current[row] = [];
                }
                cubeRefs.current[row][col] = el!;
                }}
                className="cube perspective cursor-pointer"
            >
                <div className="cube-inner">
                {["front", "right", "left", "top", "bottom", "back"].map((faceName, faceIndex) => {
                    const script = scriptFaces[faceIndex];
                    const faceLetter = script?.letters?.[cubeRefIndex];
                    const font = script?.font || "sans-serif";
                    const faceShared = shareddata[cubeRefIndex];

                    if (!faceLetter || !faceShared) return null;

                    return renderFace(faceName, faceLetter, faceShared, font);
                })}
                </div>
            </div>
        </div>
    );
}