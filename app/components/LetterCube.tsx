
import React from "react";
import { useEffect, useRef, useState } from 'react';
import gsap from "gsap";
import { Letter } from "@/types/Letter";
import { Script } from "@/types/Script";
import { LettersSharedRow, ModalDimensions} from '@/types/MetaTypes';
//import { PortableText } from '@portabletext/react';

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
    modalDimensions: ModalDimensions,
    row: number,
    col: number,
    onClick: (letter: Letter, element: HTMLDivElement) => void;
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
    modalDimensions,
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
    const expandedFaceRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const openExpanAnim = () => {
        if (expandedFaceRef.current) {
            const tl = gsap.timeline();
            tl.to(
                expandedFaceRef.current,
                {
                    width: modalDimensions.end_width,
                    height: modalDimensions.start_height,
                    x: modalDimensions.end_center[0],
                    duration: 0.5,
                    ease: "power2.out",
                }
            ).to(
                expandedFaceRef.current,
                {
                    height: modalDimensions.end_height,
                    y:modalDimensions.end_center[1],
                    duration: 0.25,
                    ease: "power2.out",
                    onComplete: () =>  {
                        setIsOpen(true);
                    }
                }
            );
        }
    };

    const reScaleExpan = () => {
        if (expandedFaceRef.current) {
            gsap.set(
                expandedFaceRef.current,
                {
                    width: modalDimensions.end_width,
                    height: modalDimensions.end_height,
                    x: modalDimensions.end_center[0],
                    ease: "power2.out",

                }
            );
        }
    }

    const closeExpandAnim = () => {
        if(expandedFaceRef.current) {
            const tl = gsap.timeline();
            tl.to(
                expandedFaceRef.current,
                {
                    height: modalDimensions.start_height,
                    y: modalDimensions.start_center[1],
                    duration: 0.25,
                    ease: "power2.out",
                    onComplete: () =>  {
                        onClose();
                    }
                }
            ).to(
                expandedFaceRef.current,
                {
                    width: modalDimensions.start_width,
                    x: modalDimensions.start_center[0],
                    duration: 0.5,
                    ease: "power2.out",
                }
            );
        } else {
            onClose();
        }
    }

    useEffect(() => {
        if(isSelected){
            if (!isOpen){
                openExpanAnim(); 
            } else {
                reScaleExpan();
            }
        }

    },[isSelected, modalDimensions]);

    return (
        <div 
            key={cubeId}
            data-row={row}
            data-col={col}
            className="relative z-[10]" // No cursor-pointer here
            onClick={(e) => {
                if (allowModalClick && letter) {
                onClick(letter, e.currentTarget as HTMLDivElement);
                }
            }}
            onMouseEnter={(e) => handleMouseEnter(e.currentTarget as HTMLDivElement, 0.3)}
            onMouseLeave={(e) => handleMouseLeave(e.currentTarget as HTMLDivElement, 0.3)}
            >
            {isSelected && (
                <div
                ref={expandedFaceRef}
                className="absolute justify-center bg-emerald-100 z-[30]"
                style={{ 
                    width: modalDimensions.start_width, 
                    height: modalDimensions.start_height, 
                    pointerEvents: 'none', 
                    backgroundColor: shareddata[cubeRefIndex].key_color || "#f5f5f5" }}
                >

                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        closeExpandAnim();
                        setIsOpen(false);
                    }}
                    className="absolute top-1 right-1 z-[50] pointer-events-auto text-black px-1"
                    >
                    ✕
                    </button>
                </div>
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
                <div className={`cube-inner ${isSelected ? 'hidden' : ''}`}>
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