"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useLayoutEffect, SetStateAction } from 'react';
import gsap from "gsap";
import LetterCube from './LetterCube';
import { Script } from '@/types/Script';
import { LettersSharedRow, ModalDimensions, createEmptyModalDims } from '@/types/MetaTypes';

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

const LETTERMODALPERCENTSIZEWIDTH = 0.9; 
const ENTERROTATIONTIME = 1.5;
const SWITCHROTTIME = 0.5;
const MODALOPENTIME = 0.5;
const MODALCLOSETIME = 0.5;

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

function stringToArraySetup( numberString: string | null | undefined ): number[] {
    const defaultArr = [7, 8, 7];
    const intArray = (numberString ?? "")
        .split(',')
        .map(Number)
        .filter(item => !isNaN(item));
    
    return (numberString!=null ||numberString!=undefined) ? intArray : defaultArr;
}

function getDiceOpenPosition(selectedBound: DOMRect, row: number){
    const rowD = document.querySelector('[data-row="0"]');

    const rowBound = rowD?.getBoundingClientRect();

    const rowWidth = (rowBound?.width||0) - selectedBound.width;
    const tableXMarg = (window.innerWidth - rowWidth )/2;
    const centerX = selectedBound.x + (selectedBound.width/2);
    const blockProportion = Math.max(0, Math.floor(((centerX - tableXMarg)/rowWidth)*100)/100);
    const rightPercentMove = 1 - blockProportion;
    const leftPercentMove = blockProportion;
    const modalWidth = LETTERMODALPERCENTSIZEWIDTH * rowWidth;
    //const modalHeight = LETTERMODALPERCENTSIZEHEIGHT * rowWidth;
    const modalHeight = window.innerHeight - 1.35*(rowBound?.y||0);

    //middleMove-(modalWidth/2) + selectedBound.width;
    const midPercentMove = rightPercentMove-0.5;
    const middleMove = (midPercentMove*modalWidth)-(modalWidth/2) + (selectedBound.width*leftPercentMove)

    const style = window.getComputedStyle(rowD!);
    const gap = parseFloat(style.gap);

    const modalYMove = -(((rowBound?.height||0)*(row)) + (gap*row));

    let moveLeft = 0;
    let moveRight = 0; //window.innerWidth - selectedBound.x
    const isRowEven = (row%2==0);
    if (isRowEven){
        moveLeft = -(selectedBound.width/2) - (gap/2) - (modalWidth*leftPercentMove) + (selectedBound.width*leftPercentMove);
        moveRight = selectedBound.width + (gap) + (modalWidth*rightPercentMove) - (selectedBound.width*rightPercentMove);
    } else {
        moveLeft = -(selectedBound.width/2) - (gap/2) - (modalWidth*leftPercentMove) + (selectedBound.width*leftPercentMove);
        moveRight = (selectedBound.width/2) + (gap/2) + (modalWidth*rightPercentMove) - (selectedBound.width*rightPercentMove);
    }

    return [moveLeft, moveRight, modalWidth, modalHeight, middleMove, modalYMove];
}


export default function LetterGrid({ scripts }: { scripts:Script[] }) {

    //Title and other polish
    const [titleKey, setTitleKey] = useState(0);

    //*----------------------------------------------------------------- */
    //FontSwitcher var declarations
    const [selectedScriptIndex, setSelectedScriptIndex] = useState<number>(-1);
    const [scriptFaces, setScriptFaces] = useState<Script[]>([]);
    const [scriptOptions, setScriptOptions] = useState<string[]>([]);

    const cubeRefs = useRef<HTMLDivElement[]>([]); // I don't need this to be a 2d array, cause the cube refs list will be dynamic :||
    const selCubeCont = useRef<HTMLDivElement| null> (null);
    const intArraySetup = useRef<number[]>([7,8,7]);
    const diePositions = useRef<{ x: number; y: number; }[]>([]);
    //const scriptOptions = Array.from(new Set(scripts.map(script => script.title)));
    
    //gets initial faces and projects them on die
    useEffect(() => {
        if (scriptOptions.length == 0){
            setScriptOptions(Array.from(new Set(scripts.map(script => script.title))));
        }
        if (scriptOptions.length > 0 && selectedScriptIndex<0) {
            defineInitialDiePosition(1500);
            
            const initialFaces = getNeighborScripts(scripts, scriptOptions[0], 5);
            initialFaces.unshift(scripts[0]);
            setScriptFaces(initialFaces);
            setSelectedScriptIndex(0); // default to first option
            //To set up initial "7,8,7" or other Int Array Setup
            intArraySetup.current = stringToArraySetup(scripts[0].array_setup);
        }
    }, [scriptOptions, selectedScriptIndex, intArraySetup]);


    //This will only be called once, and it will declare the initial positions of the die based on the screen size and pattern
    const defineInitialDiePosition = (screenscale: number) => {
        let startPos: { x: number; y: number; }[] = [];
        const spacing = screenscale/10;
        intArraySetup.current.forEach((rowlen: number, rownum: number) =>{
            for(var i=0; i<rowlen; i++){
                startPos.push({x:i*spacing, y:rownum*spacing});
            }
        });
        //console.log(startPos);
        diePositions.current = startPos;
    };


    //Move individual die lerp:
    const lerpMoveDie = (cubeEl:HTMLDivElement, targetPos:{x:number, y:number})=>{
        return new Promise<void>((resolve) => {
            gsap.to(cubeEl, {
                x: targetPos.x,
                y: targetPos.y,
                duration: 0.2,
                ease: "power2.inOut",
                onComplete:() => resolve(),
            });
        });
    };

    const shiftMoveDice = async (positions: { x: number; y: number }[], cubeRefs: HTMLDivElement[]) => {
        for (let i = 0; i < cubeRefs.length; i++) {
            const cube = cubeRefs[i];
            const pos = positions[i];
            if (!cube) continue;
            await lerpMoveDie(cube, pos); // Wait for each die before moving the next
        }
        console.log("All dice finished lerping");
    };
    //call this when the script has switched
    //Okay, it seems to be doing it right, the issue, is that diePositions isn't changing because I haven't
    //set up the animation for it. The sequence of the code should be the following:
    //1. set diePositions to startPos
    //2. feed endPos to a function that lerps diePositions to it
    //3. done

    const getStartAndEndPositions = (screenscale: number): 
    Promise<[
        sAP: { x: number; y: number; }[], 
        eAP: { x: number; y: number; }[],
        fP: { x: number; y: number; }[]
    ]> => {
        return new Promise((resolve) =>{
            let startAnimPos = diePositions.current.map(pos => ({...pos})); //shallow copy
            let endAnimPos: { x: number; y: number; }[] = [];
            const spacing = screenscale/10;

            //gets new positions
            //console.log("intArraySetup: ", intArraySetup)
            intArraySetup.current.forEach((rowlen: number, rownum: number) =>{
                for(var i=0; i<rowlen; i++){
                    endAnimPos.push({x:i*spacing, y:rownum*spacing});
                }
            });
            //console.log("endpos len: ", endPos.length)
            let finalPos = endAnimPos.map(pos => ({...pos})); //finalPosition, before after animation ends
        
            if(endAnimPos.length < startAnimPos.length){
                console.log("removing die");
                for(var j=0; j<startAnimPos.length; j++){
                    if(j>=endAnimPos.length){
                        endAnimPos.push({x:startAnimPos[j].x, y:1000});
                    }
                }
            } else{
                console.log("same or adding")
                for(var j=0; j<endAnimPos.length; j++){
                    if(j>=startAnimPos.length){
                        startAnimPos.push({x:endAnimPos[j].x, y:1000});
                    }
                }
            }
            resolve([startAnimPos, endAnimPos, finalPos]);
        });
    };

    const handleScriptChange = async (newScriptIndex: number) => {//leave as str
        const newScriptStr = scripts[newScriptIndex].title;

        intArraySetup.current = stringToArraySetup(scripts[newScriptIndex].array_setup);
        console.log("handleScriptChange: \n",intArraySetup.current);


        //end and start animPos should match in numcount, but finalPos resets to the correct num of characters.
        const [startAnimPos, endAnimPos, finalPos] = await getStartAndEndPositions(700);
        console.log(startAnimPos, endAnimPos, finalPos);
        diePositions.current = startAnimPos;
        await Promise.all(
            cubeRefs.current.map((cube, i) => lerpMoveDie(cube, endAnimPos[i]))
        );
        diePositions.current = finalPos;

        setTitleKey(newScriptIndex);//setting new title
        setSelectedScriptIndex(newScriptIndex);

        //console.log("handleScriptChange: ",scripts[newScriptIndex]);
        const faceIndex = scriptFaces.findIndex(script => script.title === newScriptStr);
        if (scriptFaces.some(script => script.title === newScriptStr)){//like includes
            
            console.log("current face" ,Faces[faceIndex]);
            await handleRotateTo(faceRotationMap[faceIndex], SWITCHROTTIME);//rotate to index
        }
        else{
            const selectedIndex = scriptFaces.findIndex(script => script.title === scripts[selectedScriptIndex]?.title);//this will get the previous selected face index
            const newFaces = getNeighborScripts(scripts, newScriptStr, 5);
            const partialFaces = [...scriptFaces]; //copy script faces
            if(selectedIndex == Faces.front){// switch the back face, roll to it, then switch the rest of the faces
                console.log("backface change");
                //change backface
                partialFaces[Faces.back] = scripts[newScriptIndex];
                setScriptFaces(partialFaces);
                //roll
                await handleRotateTo(faceRotationMap[Faces.back], SWITCHROTTIME);
                //append to rest of faces
                newFaces.push(scripts[newScriptIndex]);

            }else{//switch the front face, roll to it, then switch the rest of the faces
                console.log("frontface change");
                
                //change front face
                partialFaces[Faces.front] = scripts[newScriptIndex];
                setScriptFaces(partialFaces);

                //roll
                await handleRotateTo(faceRotationMap[Faces.front], SWITCHROTTIME);
                //append to rest of faces
                newFaces.unshift(scripts[newScriptIndex]);
            }
            setScriptFaces(newFaces);//change all faces
        }
        // Optionally store it in state if needed elsewhere
        //setSelectedScriptIndex(newScriptIndex);


    };
    //*----------------------------------------------------------------- */
  
    //splitting characters from groq... might remove later to just stick with csv
    //using set 7-8-7 pattern
    //const numletters = selectedScript?.letters.length;
    //const rows = [7,8,7];// intArraySetup

    const [selectedLetterIndex, setSelectedLetterIndex] = useState<number>(-1);
    const moveLeftCubesCoords = useRef<Array<[number, number]>>([]);
    const moveRightCubesCoords = useRef<Array<[number, number]>>([]);
    const [allowModalClick, setAllowModalClick] = useState(true);// this will allow for the die to be clickable
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [canHoverAnim, setCanHoverAnim] = useState(true);// allows die hoverAnim (expand when hovered)
    const [letterModalDimensions, setLetterModalDimensions] = useState<ModalDimensions>(createEmptyModalDims());


    useEffect(() => {
        handleRotateTo({x:360, y:360}, ENTERROTATIONTIME);
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
        if (canHoverAnim){
            gsap.killTweensOf(el); // stop previous tweens
            gsap.to(el, { 
                scale: 1.1,
                duration: time, 
                ease: "power2.out" });
        }
    };
      
    const handleMouseLeave = (el: HTMLDivElement, time:number): Promise<void> => {
        return new Promise((resolve) => {
            if (canHoverAnim){
                gsap.killTweensOf(el); //stop previous tweens
                gsap.to(
                    el, 
                    { 
                        scale: 1,
                        duration: time, 
                        ease: "power2.out",
                        onComplete: () => {
                            resolve();
                        }
                    }
                )
            } else {
                resolve();
            }
        });
    };

    const waitForCubeRefs = (
        refs: React.MutableRefObject<HTMLDivElement[]>, 
        interval = 50
    ): Promise<void> => {
        return new Promise((resolve) =>{
            const check = () => {
                if(refs.current.length != 0)
                    resolve();
                else
                    setTimeout(check, interval);
            }
            check();
        });
    };
    
    
    const handleRotateTo = async (angle: {x: number; y: number}, duration: number) => {
        setAllowModalClick(false); //can't open while rolling

        if (cubeRefs.current.length == 0)// await if arr len is 0
            await waitForCubeRefs(cubeRefs);
        
        const rollPromises = cubeRefs.current.map((cube, i) => {
            if (!cube) return Promise.resolve();
            const delay = i * 0.01;
            return rollCube(cube, delay, duration, angle);//360,360
        });

        await Promise.all(rollPromises);
        if (!isModalOpen)
            setAllowModalClick(true); // now able to
    };


    const moveDiceToOpenPos = (selDie: HTMLDivElement, time: number) => {
        const row = parseInt(selDie.dataset.row!);
        const selectedBound = selDie.getBoundingClientRect();
        
        const [moveLeft, moveRight, modalWidth, modalHeight, middleMove, modalYMove] = getDiceOpenPosition(selectedBound, row);
        setLetterModalDimensions({
            start_width: selectedBound.width,
            start_height: selectedBound.height,
            end_width: modalWidth,
            end_height: modalHeight,
            start_center: [0, 0],
            end_center: [middleMove,modalYMove] });

        //console.log(moveLeft,moveRight)
        //Don't move die for now, working on cubeRef refactoring
        /*moveLeftCubesCoords.current.forEach(([i,j])=> {
            translateCube(cubeRefs.current[i][j], time, {x:moveLeft,y:0});
        });
        moveRightCubesCoords.current.forEach(([i,j])=> {
            translateCube(cubeRefs.current[i][j], time, {x:moveRight,y:0});
        });*/
    };

    useEffect(() => { // for scaling open cubes
        const handleResize = () => {
            if (selectedLetterIndex>=0 && selCubeCont.current){
                moveDiceToOpenPos(selCubeCont.current, 0);
                //console.log("new screen end width:", letterModalDimensions.end_width);
            }
        };
        window.addEventListener('resize', handleResize);
        return ()=> window.removeEventListener('resize', handleResize);
    }, [selectedLetterIndex,selCubeCont, letterModalDimensions]);

    //nvm
    const handleOnLetterClick = async (letterIndex: number, el: HTMLDivElement) => {
        await handleMouseLeave(el, 0.1); // await 0.1 seconds for size to reset after clicking
        const row = parseInt(el.dataset.row!);
        const col = parseInt(el.dataset.col!);

        selCubeCont.current = el;
        setSelectedLetterIndex(letterIndex);
        setCanHoverAnim(false);
        setAllowModalClick(false);
        setIsModalOpen(true);
        
        /*cubeRefs.current.forEach((cbrow, i) => {
            cbrow.forEach((_, j) => {
                if (i === row && j === col) return; //skips if same as clicked letter
                const isLeft = (row%2==0) ? j > col : j >= col;//if row is even

                if(isLeft) {
                    moveLeftCubesCoords.current.push([i,j]);
                } else {
                    moveRightCubesCoords.current.push([i,j]);
                }
            })
        });*/
        moveDiceToOpenPos(el, MODALOPENTIME); //open in 0.5 seconds
    };

    const handleOnCloseLetter = async () =>{

        const flatRefs = cubeRefs.current.flat();
        const closePromises = flatRefs.map((cube) => {
            if (!cube) return Promise.resolve();
            return translateCube(cube, MODALCLOSETIME, {x:0,y:0});//360,360
        });
        await Promise.all(closePromises);

        selCubeCont.current = null;
        setSelectedLetterIndex(-1);
        setCanHoverAnim(true);
        setAllowModalClick(true);
        setIsModalOpen(false);
        //
        moveLeftCubesCoords.current = [];
        moveRightCubesCoords.current = [];
    };

    return (
        <div className="justify-center">
            {/* Title */}
            <div className="scriptTitle relative">
                {/*<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-10 text-center">
                    {scripts[selectedScriptIndex]?.title}
                </h1>*/}

                <AnimatePresence mode="wait">
                    <motion.h1
                    key={titleKey}
                    initial={{ y: "-100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ duration: SWITCHROTTIME/2, ease: "easeInOut" }}
                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-10 text-center"
                    >
                        {scripts[selectedScriptIndex]?.title}
                    </motion.h1>
                </AnimatePresence>
            </div>

            <div className="p-1">
                {/* Font Dropdown */}
                <select
                    onChange={(e) => handleScriptChange(e.target.selectedIndex)}
                    value={scripts[selectedScriptIndex]?.title || ''}
                    className="p-1 border rounded mb-4"
                >
                    {scriptOptions.map((script, idx) => (
                    <option key={idx} value={script}>
                        {script}
                    </option>
                    ))}
                </select>
            </div>
            <div className="py-5 absolute w-full h-full">
                
                {diePositions.current.map(({x,y}, i)=>{
                    const cubeId = `cubewrapper-${i}`;
                           
                    /*const rowStr = selCubeCont.current?.dataset.row;
                    const selRow = rowStr !== undefined ? parseInt(rowStr) : -1;
                    const colStr = selCubeCont.current?.dataset.col;
                    const selCol = colStr !== undefined ? parseInt(colStr) : -1;
                    const isSelected = (selRow === i && selCol=== j);*/

                    return(
                        <div
                            key={i}
                            className="absolute transition-transform duration-500"
                            style={{
                                transform: `translate(${x}px, ${y}px)`,
                            }}
                        >
                            <LetterCube
                                key={`LetterCube-${i}`}
                                cubeId={cubeId}
                                scripts={scripts}
                                scriptFaces={scriptFaces}
                                selectedScriptIndex={selectedScriptIndex}
                                letterIndex={i}
                                modalDimensions={letterModalDimensions}
                                onClick={handleOnLetterClick}
                                allowModalClick={allowModalClick}
                                handleMouseEnter={handleMouseEnter}
                                handleMouseLeave={handleMouseLeave}
                                cubeRefs={cubeRefs}
                                isSelected={false}
                                onClose={handleOnCloseLetter}
                                scriptChange={handleScriptChange}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
  }