"use client";

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import gsap from "gsap";
import LetterCube from './LetterCube';
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

function getDiceOpenPosition(selectedBound: DOMRect, row: number){
    const rowD = document.querySelector('[data-row="0"]');

    const rowBound = rowD?.getBoundingClientRect();
    const rowWidth = (rowBound?.width||0) - selectedBound.width;
    const tableXMarg = (window.innerWidth - rowWidth )/2;
    const blockXPos = selectedBound.x + (selectedBound.width/2);
    const blockProportion = Math.max(0, Math.floor(((blockXPos - tableXMarg)/rowWidth)*100)/100);
    const rightPercentMove = 1 - blockProportion;
    const leftPercentMove = blockProportion;
    const popUpSize = 0.75 * rowWidth;

    console.log("block x location:", blockXPos);
    console.log("margin: ", tableXMarg);
    console.log("percent proportion: ", blockProportion);
    console.log("right pm: ", rightPercentMove);
    console.log("left pm: ", leftPercentMove);
    const style = window.getComputedStyle(rowD!);
    const gap = parseFloat(style.gap);

    let moveLeft = 0;
    let moveRight = 0; //window.innerWidth - selectedBound.x
    const isRowEven = (row%2==0);
    if (isRowEven){
        moveLeft = -(selectedBound.width/2) - (gap/2) - (popUpSize*leftPercentMove);
        moveRight = selectedBound.width + (gap/2) + (popUpSize*rightPercentMove);
    } else {
        moveLeft = -(selectedBound.width/2) - (gap/2) - (popUpSize*leftPercentMove);
        moveRight = (selectedBound.width/2) + (gap/2) + (popUpSize*rightPercentMove);
    }
    return [moveLeft, moveRight];
}


export default function LetterGrid({ scripts }: { scripts:Script[] }) {

    //*----------------------------------------------------------------- */
    //FontSwitcher var declarations
    const [shareddata, setSharedData] = useState<LettersSharedRow[]>([]);
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);
    const [scriptFaces, setScriptFaces] = useState<Script[]>([]);

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

    const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
    const [selectedCoord, setSelectedCoord] = useState<[number, number]|null>(null);
    const moveLeftCubesCoords = useRef<Array<[number, number]>>([]);
    const moveRightCubesCoords = useRef<Array<[number, number]>>([]);
    const [allowModalClick, setAllowModalClick] = useState(true);// this will allow for the die to be clickable
    const [hoverAnimPlay, setHoverAnimPlay] = useState(true);
    
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


    const handleMouseEnter = (el: HTMLDivElement, time:number) => {
        if (hoverAnimPlay){
            gsap.to(el, { 
                scale: 1.1,
                duration: time, 
                ease: "power2.out" });
        }
      };
      
    const handleMouseLeave = (el: HTMLDivElement, time:number) => {
        if (hoverAnimPlay){
            gsap.to(el, { 
                scale: 1,
                duration: time, 
                ease: "power2.out" });
        }
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

    const moveDiceToOpenPos = (row: number, col: number, time: number) => {
        const selectedBound = cubeRefs.current[row][col].getBoundingClientRect();
        const [moveLeft, moveRight] = getDiceOpenPosition(selectedBound, row);
        console.log(moveLeft,moveRight)
        moveLeftCubesCoords.current.forEach(([i,j])=> {
            translateCube(cubeRefs.current[i][j], time, {x:moveLeft,y:0});
        });
        moveRightCubesCoords.current.forEach(([i,j])=> {
            translateCube(cubeRefs.current[i][j], time, {x:moveRight,y:0});
        });
    }

    useEffect(() => { // for scaling open cubes
        const handleResize = () => {
            console.log((selectedLetter));
            if (selectedLetter && selectedCoord){
                moveDiceToOpenPos(selectedCoord[0], selectedCoord[1], 0);
            }
        };
        window.addEventListener('resize', handleResize);
        return ()=> window.removeEventListener('resize', handleResize);
    }, [selectedLetter,selectedCoord]);

    //i might not need an async here, since I am going to disable clicking on other letters here, and enable it on the CloseLetterHandler
    const handleOnLetterClick = (letter: Letter | undefined, row: number, col: number, el: HTMLDivElement) => {
        setSelectedLetter(letter || null);
        setSelectedCoord([row, col]);
        setHoverAnimPlay(false);
        handleMouseLeave(el, 0.1)
        setAllowModalClick(false);
        //const screenFactor = window.innerWidth * 0.5;

        cubeRefs.current.forEach((cbrow, i) => {
            cbrow.forEach((_, j) => {
                if (i === row && j === col) return; //skips if same as clicked letter
                const isLeft = (row%2==0) ? j > col : j >= col;//if row is even

                if(isLeft) {
                    moveLeftCubesCoords.current.push([i,j]);
                } else {
                    moveRightCubesCoords.current.push([i,j]);
                }
            })
        });
        
        moveDiceToOpenPos(row, col, 0.5);
    };

    const handleOnCloseLetter = () =>{
        setSelectedLetter(null);
        setSelectedCoord(null);
        setHoverAnimPlay(true);
        setAllowModalClick(true);
        //
        moveLeftCubesCoords.current = [];
        moveRightCubesCoords.current = [];

        cubeRefs.current.forEach((cbrow) => {
            cbrow.forEach((cube) => {
                translateCube(cube, 0.5, {x:0,y:0});
            })
        });
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
                        data-row={i}
                    >
                        {Array.from({ length: rowCount }).map((_, j) => {
                            const letter = selectedScript?.letters?.[letterIndex];
                            const cubeRefIndex = letterIndex;
                            const cubeId = `cubewrapper-${letter?._id || cubeRefIndex}`;

                            const isSelected = selectedCoord?.[0] === i && selectedCoord?.[1] === j;

                            letterIndex++;

                            return (
                                <LetterCube
                                    key={`LetterCube-${letter?._id || cubeRefIndex}`}
                                    cubeId={cubeId}
                                    letter={letter}
                                    shareddata={shareddata}
                                    scriptFaces={scriptFaces}
                                    cubeRefIndex={cubeRefIndex}
                                    row={i}
                                    col={j}
                                    onClick={handleOnLetterClick}
                                    allowModalClick={allowModalClick}
                                    handleMouseEnter={handleMouseEnter}
                                    handleMouseLeave={handleMouseLeave}
                                    cubeRefs={cubeRefs}
                                    isSelected={isSelected}
                                    onClose={handleOnCloseLetter}
                                />
                            );
                        })}
                    </div>
                ))}
                {/*<LetterModal letter={selectedLetter} selScript={selectedScript} onClose={() => handleOnCloseLetter()} />*/}
            </div>
        </div>
    );
  }