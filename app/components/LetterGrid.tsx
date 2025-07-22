"use client";

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import gsap from "gsap";
import LetterModal from './LetterModal';
import { Script, createEmptyScript } from '@/types/Script';
import { Letter } from '@/types/Letter';
import Papa from 'papaparse';

enum Faces{
    front,
    right,
    left,
    top,
    bottom,
    back,
}
const faceRotationMap = [
    { x: 0, y: 0 },
    { x: 0, y: -90 },
    { x: 0, y: 90 },
    { x: -90, y: 0 },
    { x: 90, y: 0 },
    { x: 0, y: 180 }
];

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

        {/**character.modern_char?.asset?.url && (
          <img
            src={character.modern_char.asset.url}
            alt={character.letter_name}
            className="w-3/5 h-3/5 object-contain"
          />
        )**/}
        
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


function getNeighborScripts(scripts: Script[], newScript_title: string, total: number): Script[] {
    const index = scripts.findIndex(script => script.title === newScript_title);
    const half = Math.ceil(total / 2);
    const diff = half*2 - total;
    const wrap = (i: number) => (i + scripts.length) % scripts.length;

    const neighbors = [];
    for (let i = -half; i <= half-diff; i++) {
      if (i !== 0) neighbors.push(scripts[wrap(index + i)]);
    }
    return neighbors;
}


export default function LetterGrid({ scripts }: { scripts:Script[] }) {

    const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

    //*----------------------------------------------------------------- */
    //FontSwitcher var declarations
    const [shareddata, setSharedData] = useState<LettersSharedRow[]>([]);
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);
    const [scriptFaces, setScriptFaces] = useState<Script[]>([]);

    const [allowModalClick, setAllowModalClick] = useState(true);// this will allow for the die to be clickable

    //keep this one
    useEffect(() => {
        fetch('/data/LettersShared.csv')
            .then(res => res.text())
            .then(csv => {
            const parsed = Papa.parse<LettersSharedRow>(csv, {
                header: true,
                skipEmptyLines: true,
            });
            setSharedData(parsed.data);
        });

    }, []);

    const scriptOptions = Array.from(new Set(scripts.map(script => script.title)));
    
    //gets initial faces and projects them on die
    useEffect(() => {
        if (scriptOptions.length > 0 && !selectedScript) {
        const initialFaces = getNeighborScripts(scripts, scriptOptions[0], 5);
        initialFaces.unshift(scripts[0]);
        setScriptFaces(initialFaces);
        setSelectedScript(scripts[0]); // default to first option
        }
    }, [scriptOptions, selectedScript]);

    const handleScriptChange = async (newScriptStr: string) => {//leave as str
        const newScript = scripts.find(script => script.title === newScriptStr) ?? createEmptyScript();
        const faceIndex = scriptFaces.findIndex(script => script.title === newScriptStr);
        if (scriptFaces.some(script => script.title === newScriptStr)){//like includes
            console.log("current face" ,Faces[faceIndex]);
            await handleRotateTo(faceRotationMap[faceIndex], 0.5);//rotate to index
        }
        else{
            const selectedIndex = scriptFaces.findIndex(script => script.title === selectedScript?.title);//this will get the previous selected face index
            const newFaces = getNeighborScripts(scripts, newScriptStr, 5);
            const partialFaces = [...scriptFaces]; //copy script faces
            if(selectedIndex == Faces.front){// switch the back face, roll to it, then switch the rest of the faces
                console.log("backface change");
                //change backface
                partialFaces[Faces.back] = newScript;
                setScriptFaces(partialFaces);
                //roll
                await handleRotateTo(faceRotationMap[Faces.back], 0.5);
                //append to rest of faces
                newFaces.push(newScript);

            }else{//switch the front face, roll to it, then switch the rest of the faces
                console.log("frontface change");
                
                //change front face
                partialFaces[Faces.front] = newScript;
                setScriptFaces(partialFaces);

                //roll
                await handleRotateTo(faceRotationMap[Faces.front], 0.5);
                //append to rest of faces
                newFaces.unshift(newScript);
            }
            setScriptFaces(newFaces);//change all faces
        }
        // Optionally store it in state if needed elsewhere
        setSelectedScript(newScript);
    }
    //*----------------------------------------------------------------- */
  
    //splitting characters from groq... might remove later to just stick with csv
    
    //using set 7-8-7 pattern
    //const numletters = selectedScript?.letters.length;
    const rows = [7,8,7];

    const cubeRefs = useRef<HTMLDivElement[][]>([]);

    
    useLayoutEffect(() => {

        handleRotateTo({x:360, y:360}, 1.5);
    }, []);


    const rollCube = (
        cube: HTMLDivElement, 
        delay: number, 
        rottime: number, 
        angle: {x: number; y: number} 
    ): Promise<void> => {
        return new Promise((resolve) =>{
            gsap.to(
                cube,
                {
                    rotationX: angle.x,
                    rotationY: angle.y,
                    duration: rottime,
                    delay,
                    ease: "power4.out",
                    onComplete: () => {
                        resolve();
                    }
                }
            );
        });
    };

    
    const translateCube = (
        cube: HTMLDivElement, 
        transtime: number, 
        dir: {x: number; y: number}
    ): Promise<void> => {
        return new Promise((resolve) =>{
            gsap.to(
                cube,
                {
                    x:dir.x,
                    y:dir.y,
                    duration:transtime,
                    ease:"power2.out",
                    onComplete: () => {
                        resolve();
                    }
                }
            )
        });
    };


    const handleMouseEnter = (el: HTMLDivElement) => {
        gsap.to(el, { 
            scale: 1.1,
            duration: 0.3, 
            ease: "power2.out" });
      };
      
    const handleMouseLeave = (el: HTMLDivElement) => {
        gsap.to(el, { 
            scale: 1,
            duration: 0.3, 
            ease: "power2.out" });
    };
    
    const handleRotateTo = async (angle: {x: number; y: number}, duration: number) => {
        setAllowModalClick(false); //can't open while rolling

        const flatRefs = cubeRefs.current.flat();
        const rollPromises = flatRefs.map((cube, i) => {
            if (!cube) return Promise.resolve();
            const delay = i * 0.01;
            return rollCube(cube, delay, duration, angle);//360,360
        });

        await Promise.all(rollPromises);

        setAllowModalClick(true); // now able to
    };

    //i might not need an async here, since I am going to disable clicking on other letters here, and enable it on the CloseLetterHandler
    const handleOnLetterClick = async (letter: Letter | undefined, row: number, col: number) => {
        console.log(row,col);
        setSelectedLetter(letter || null);

        /**let moveLeftCubesCord: Array<[number, number]> = [];
        let moveRightCubesCord: Array<[number, number]> = [];
        const isRowEven = (row%2==0);
        cubeRefs.current.forEach((cbrow, i) => {
            cbrow.forEach((_, j) => {
                if (i === row && j === col) return; //skips if same as clicked letter

                const isLeft = isRowEven ? j > col : j >= col;

                if(isLeft) {
                    moveLeftCubesCord.push([i,j]);
                } else {
                    moveRightCubesCord.push([i,j]);
                }
            })
        });
        
        const moveRPromises = moveRightCubesCord.forEach(([i,j], x)=> {
            translateCube(cubeRefs.current[i][j], 0.5, {x:200,y:0});
        });
        const moveLPromises = moveLeftCubesCord.forEach(([i,j], x)=> {
            translateCube(cubeRefs.current[i][j], 0.5, {x:-200,y:0});
        });
        await Promise.all([moveLPromises, moveRPromises]);**/
    };

    const handleOnCloseLetter = () =>{
        setSelectedLetter(null);
    };

    let letterIndex = 0;
    return (
        <div className="justify-center">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-10 text-center">
                {selectedScript?.title}
            </h1>
            <div className="p-1">
                {/* Font Dropdown */}
                <select
                    onChange={(e) => handleScriptChange(e.target.value)}
                    value={selectedScript?.title || ''}
                    className="p-1 border rounded mb-4"
                >
                    {scriptOptions.map((script, idx) => (
                    <option key={idx} value={script}>
                        {script}
                    </option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col [gap:clamp(1.2rem,2.75vw,2rem)]">
                {rows.map((rowCount, i) => (
                    <div 
                        key={i}
                        className="flex flex-row-reverse justify-center [gap:clamp(1.2rem,2.75vw,2rem)]"
                    >
                        {Array.from({ length: rowCount }).map((_, j) => {
                            const letter = selectedScript?.letters?.[letterIndex];
                            const cubeRefIndex = letterIndex;
                            const cubeId = `cubewrapper-${letter?._id || cubeRefIndex}`;

                            letterIndex++;

                            return (
                                <div 
                                key={cubeId}
                                className="cursor-pointer"
                                onClick={() => {
                                    if(allowModalClick){
                                        handleOnLetterClick(letter, i ,j)
                                    }
                                }}
                                onMouseEnter={(e) => handleMouseEnter(e.currentTarget)}
                                onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
                                >
                                    <div
                                        ref={(el) => {
                                            if (!cubeRefs.current[i]) {
                                                cubeRefs.current[i] = []; // initialize the row first
                                            }
                                            cubeRefs.current[i][j] = el!;
                                        }}
                                        className="cube perspective"
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
                        })}
                    </div>
                ))}
                {<LetterModal letter={selectedLetter} selScript={selectedScript} onClose={() => handleOnCloseLetter()} />}
            </div>
        </div>
    );
  }