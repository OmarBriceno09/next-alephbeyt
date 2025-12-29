"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from 'react';
import gsap from "gsap";
import LetterCube from './LetterCube';
import { Script } from '@/types/Script';
import LetterModal, { LetterModalHandle } from "./LetterModal";
import { ModalDimensions, createEmptyModalDims } from '@/types/MetaTypes';

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

const LETTERMODALPERCENTSIZEWIDTH = 0.65; 
const ENTERROTATIONTIME = 1.5;
const SWITCHROTTIME = 0.5;
const DICEANIMDELAY = 0.01;
const DICEMARGINSCALE = 0.25;
//const MODALOPENTIME = 0.5;
//const MODALCLOSETIME = 0.5;

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


export default function LetterGrid({ scripts }: { scripts:Script[] }) {

    //Title and other polish
    const [titleKey, setTitleKey] = useState(0);

    //*----------------------------------------------------------------- */
    //FontSwitcher var declarations
    const [selectedScriptIndex, setSelectedScriptIndex] = useState<number>(-1);
    const [scriptFaces, setScriptFaces] = useState<Script[]>([]);
    const [scriptOptions, setScriptOptions] = useState<string[]>([]);

    const [diceItemsPos, setDiceItemsPos] = useState<{x: number; y: number}[]>([]);

    const cubeCount = useRef<number>(0); //this is important, because this drives how many CubeRefs are being rendered
    
    const cubeRefs = useRef<HTMLDivElement[]>([]); // x/y Positioning
    const cubeRotators = useRef<HTMLDivElement[]>([]); // roatate x/y/z
    const cubeScalers  = useRef<HTMLDivElement[]>([]); // hover scale

    const [selectedLetterIndex, setSelectedLetterIndex] = useState<number>(-1);
    const selCubeCont = useRef<HTMLDivElement| null> (null);
    const intArraySetup = useRef<number[]>([7,8,7]);
    const letterModalDimensions = useRef<ModalDimensions>(createEmptyModalDims());
    //const scriptOptions = Array.from(new Set(scripts.map(script => script.title)));
    //const [letterModalDimensions, setLetterModalDimensions] = useState<ModalDimensions>(createEmptyModalDims());
    const LetterModalRef = useRef<LetterModalHandle> (null);
    const [allowModalClick, setAllowModalClick] = useState(false);// this will allow for the die to be clickable
    
    //gets initial faces and projects them on die
    //die seem to spawn at a scale of 166.64, when they should be of scale 145. 
    useEffect(() => {
        /*function updateCubeSize() {
            const vw = window.innerWidth * 0.085;
            const cubeSize = Math.min(160, Math.max(70, vw));
            console.log("updateCubeSize in useEffect: ", cubeSize);
            //document.documentElement.style.setProperty('--cube-size', `${cubeSize}px`);
        }*/

        //updateCubeSize();
        //window.addEventListener('resize', updateCubeSize);

        if (scriptOptions.length == 0){
            setScriptOptions(Array.from(new Set(scripts.map(script => script.title))));
        }
        if (scriptOptions.length > 0 && selectedScriptIndex<0) {
            setupTheGrid();
        }

        //return () => window.removeEventListener('resize', updateCubeSize);
    }, [scriptOptions, selectedScriptIndex, intArraySetup, letterModalDimensions]);


    const setupTheGrid = async() => {
            const initialFaces = getNeighborScripts(scripts, scriptOptions[0], 5);
            initialFaces.unshift(scripts[0]);
            setScriptFaces(initialFaces);
            setSelectedScriptIndex(0); // default to first option
            //To set up initial "7,8,7" or other Int Array Setup
            intArraySetup.current = stringToArraySetup(scripts[0].array_setup);
            cubeCount.current = intArraySetup.current.reduce((a, b)=> a+b, 0);
            //after this intArrayIsSetup
            refreshDicePositions();
            handleDiceAnimate([], {x:360, y:360}, ENTERROTATIONTIME, DICEANIMDELAY);
    };

    const computeLetterDimensions = async() =>{
        if(cubeCount.current>0){
            try {
                await waitForCubeCount(cubeCount.current);
            } catch (err) {
                console.warn(err);
            }
            const firstCube = cubeRefs.current.at(0); //there will most likely always be a firstCube
            if(firstCube){
                const styles = getComputedStyle(firstCube);
                const dieWidth = parseFloat(styles.width);
                letterModalDimensions.current.start_width = dieWidth;
                letterModalDimensions.current.start_height = dieWidth;
                const modalWidth = LETTERMODALPERCENTSIZEWIDTH * window.innerWidth;
                letterModalDimensions.current.end_width = modalWidth;
                letterModalDimensions.current.end_height = modalWidth*0.6;
            }
        }
    };

    const refreshDicePositions = async() =>{
        await computeLetterDimensions(); //this seems to have the letterModalDimension.start_width = 0 ???
        const dieWidth = letterModalDimensions.current.start_width;//await computeWidth();
        const isLeftToRight = scripts[selectedScriptIndex]?.left_to_right ?? false;
        const initialPositions = computeAlignedPositions(
            window.innerWidth, 
            dieWidth, //160
            (dieWidth*DICEMARGINSCALE), //40
            (dieWidth*DICEMARGINSCALE), //40
            isLeftToRight,
            selectedLetterIndex,
            intArraySetup.current
        );
        setDiceItemsPos(initialPositions);//setDiceItemsPos(initialPositions);
        handleSetDicePosition(initialPositions);
    }

    const getRowColumnIndex = (rows: number[], index:number) =>{
        let acc = 0;
        for (let i=0; i< rows.length; i++){
            if (index < acc + rows[i]) return {r: i, c: index - acc};
            acc += rows[i];
        }
        return {r: -1, c: -1}; // out of range
    };

    //Note: I am choosing not to make the expanded modal the size of the largest row becuase the number of rows
    // is not consistent, and might cause disorientation
    const computeAlignedPositions = (
        containerWidth: number,
        dieSize: number,
        colGap: number = 40, 
        rowGap: number = 30,
        isLeftToRight: boolean = false,
        selLetterIndex: number = -1,
        RowColCountArray: number[]
    ): {x:number; y:number}[] => {
        const positions: { x: number; y: number }[][] = [];

        const dieIsSelected = (selLetterIndex > -1);
        let rowColSel = {r:-1, c:-1};

        const maxRowCount = Math.max(...RowColCountArray);
        const maxRowWidth = ((maxRowCount)*dieSize) + ((maxRowCount-1)*colGap);
        const accountZone = ((maxRowCount-1)*dieSize) + ((maxRowCount-1)*colGap);

        if(dieIsSelected){  
            rowColSel = getRowColumnIndex(RowColCountArray, selLetterIndex);
            const totalRowWidth = (RowColCountArray[rowColSel.r]*dieSize) + ((RowColCountArray[rowColSel.r] - 1) * colGap);
            //console.log("totalRowWidth: ", totalRowWidth);
            const startX = (containerWidth - totalRowWidth)/2;

            const offset = rowColSel.c * (dieSize + colGap);
            const modalStartPosX = isLeftToRight ? startX + offset : startX + (totalRowWidth - dieSize - offset);
            const modalStartPosY = rowColSel.r * (dieSize + rowGap) + rowGap;

            const modalYEnd = rowGap; //index zero will always be in the top row.
            const relPosX = (modalStartPosX - ((containerWidth-maxRowWidth)/2))/(accountZone);
            const modalXEnd = modalStartPosX - (letterModalDimensions.current.end_width - dieSize)*relPosX; //+ ((dieSize)*(1 - relPosX));
            letterModalDimensions.current.start_pos = [modalStartPosX, modalStartPosY];
            letterModalDimensions.current.end_pos = [modalXEnd, modalYEnd];
        }

        RowColCountArray.forEach((rowLen, rowIndex) => {
            const diePx = letterModalDimensions.current.start_pos[0];
            const totalRowWidth = (rowLen*dieSize) + ((rowLen - 1) * colGap);
            const startX = (containerWidth - totalRowWidth)/2;
            const rowPos: { x: number; y: number }[] = [];
            
            let splitIndex = -1;
            const colSelIndex = (rowIndex == rowColSel.r && rowColSel.c > -1) ? rowColSel.c : -1;

            for (let i=0; i<rowLen; i++){
                const offset = i * (dieSize + colGap);

                let x = isLeftToRight ? startX + offset : startX + (totalRowWidth - dieSize - offset);
                const y = rowIndex * (dieSize + rowGap) + rowGap;//additional margin between top of div and die (avoids cutoff)

                if (dieIsSelected && splitIndex<0 && ((isLeftToRight && x>diePx)||(!isLeftToRight && x < diePx)))
                    splitIndex = i;

                rowPos.push({x,y});
            }

            if(dieIsSelected){
                const moveRow = (splitIndex == -1); //it means the whole row has to move (when farthest left or right is clicked)
                let count = 0;
                rowPos.forEach((pos:{ x: number; y: number }, i) => {
                    if (i != colSelIndex){  
                        const distin = ((i<splitIndex || moveRow)===isLeftToRight) ? 
                            letterModalDimensions.current.end_pos[0] - dieSize - colGap://r-l: left side moves
                            letterModalDimensions.current.end_pos[0] + letterModalDimensions.current.end_width + colGap; //r-l: right isde moves
                        const moveIndex = (i<splitIndex || moveRow) ?
                            (isLeftToRight?-1:1)*((moveRow) ? (rowPos.length-1-count-Number(colSelIndex>-1)) : (splitIndex - 1 - count - Number(colSelIndex>-1))):
                            (isLeftToRight?1:-1)*(i - splitIndex);
                        
                        pos.x = distin + moveIndex*(dieSize + colGap);
                        
                        count++;
                    }
                });
            }

            positions.push(rowPos);
        });
        //console.log(positions);

        return positions.flat();
    };

    //call this when the script has switched
    //Okay, it seems to be doing it right, the issue, is that diePositions isn't changing because I haven't
    //set up the animation for it. The sequence of the code should be the following:
    //1. set diePositions to startPos
    //2. feed endPos to a function that lerps diePositions to it
    //3. done

    const handleScriptChange = async (newScriptIndex: number) => {
        const newScriptStr = scripts[newScriptIndex].title;

        // Compute the new row pattern
        intArraySetup.current = stringToArraySetup(scripts[newScriptIndex].array_setup);
        const dieWidth = letterModalDimensions.current.start_width;//await computeWidth();
        // 1. Compute FINAL positions for the target layout
        //const endPositions: {x: number; y: number}[] = [];
        const isLeftToRight = scripts[newScriptIndex].left_to_right ?? false;
        const endPositions = computeAlignedPositions(
            window.innerWidth, 
            dieWidth, //160
            (dieWidth*DICEMARGINSCALE), //40
            (dieWidth*DICEMARGINSCALE), //40
            isLeftToRight,
            selectedLetterIndex,
            intArraySetup.current
        );

        const prevCount = diceItemsPos.length;
        const newCount = endPositions.length;
        // 2. Compute START positions
        const startPositions = [...diceItemsPos.map(c => ({ ...c }))];
        if (newCount > prevCount) {
            // Spawn new cubes below screen
            for (let i = prevCount; i < newCount; i++) {
                startPositions.push({
                    x: endPositions[i].x, 
                    y: 1000
                });
            }
        }
        if (newCount < prevCount) {
            // Animate extra cubes down before they are removed
            for (let i = newCount; i < prevCount; i++) {
                endPositions.push({
                    x: startPositions[i].x,
                    y: 1000
                });
            }
        }

        cubeCount.current = endPositions.length; // keep to this positon, for case of adding die.
        //cubeCount.current = startPositions.length;
        setDiceItemsPos(startPositions);//setDiceItemsPos(startPositions);
        await handleSetDicePosition(startPositions); //wait for the cubes to now be set in their start position via gsap

        setTitleKey(newScriptIndex);
        setSelectedScriptIndex(newScriptIndex);

        //face logic
        //console.log("handleScriptChange: ",scripts[newScriptIndex]);
        const faceIndex = scriptFaces.findIndex(script => script.title === newScriptStr);
        if (scriptFaces.some(script => script.title === newScriptStr)){//like includes
            
            console.log("current face" ,Faces[faceIndex]);
            await handleDiceAnimate(endPositions, faceRotationMap[faceIndex], SWITCHROTTIME, DICEANIMDELAY);//rotate to index
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
                await handleDiceAnimate(endPositions, faceRotationMap[Faces.back], SWITCHROTTIME, DICEANIMDELAY);
                //append to rest of faces
                newFaces.push(scripts[newScriptIndex]);

            }else{//switch the front face, roll to it, then switch the rest of the faces
                console.log("frontface change");
                
                //change front face
                partialFaces[Faces.front] = scripts[newScriptIndex];
                setScriptFaces(partialFaces);

                //roll
                await handleDiceAnimate(endPositions, faceRotationMap[Faces.front], SWITCHROTTIME, DICEANIMDELAY);
                //append to rest of faces
                newFaces.unshift(scripts[newScriptIndex]);
            }
            setScriptFaces(newFaces);//change all faces
        }
        // Optionally store it in state if needed elsewhere
        //setSelectedScriptIndex(newScriptIndex);
        //set the cubeRefs to the correct number of cubes once animation is done.
        cubeCount.current = intArraySetup.current.reduce((a, b)=> a+b, 0);
        if(cubeRefs.current.length>cubeCount.current){
            cubeRefs.current.length = cubeCount.current;
            endPositions.length = cubeCount.current;
        }
        setDiceItemsPos(endPositions);//setDiceItemsPos(endPositions); //after movement and rotation is done

    };


    const animateTranslationCube = (
        cube: HTMLDivElement, 
        delay: number, 
        rottime: number,
        position: {x: number, y: number}, 
    ): Promise<void> => {
        return new Promise((resolve) =>{
            gsap.to(
                cube,
                {
                    x: position.x,
                    y: position.y,
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

    const setPosCube = (
        cube: HTMLDivElement, 
        position: {x: number, y: number}, 
    ): Promise<void> => {
        return new Promise((resolve) =>{
            gsap.set(
                cube,
                {
                    x: position.x,
                    y: position.y,
                    onComplete: () => {
                        resolve();
                    }
                }
            );
        });
    };
  
    /*const translateCube = (
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
    };*/

    const animateRotationCube = (
        cube: HTMLDivElement, 
        delay: number, 
        rottime: number,
        angle: {x: number; y: number}
    ):Promise<void> => {
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

    const handleMouseEnter = (el: HTMLDivElement, time:number) => {
        if (allowModalClick){
            gsap.killTweensOf(el); // stop previous tweens
            gsap.to(el, { 
                scale: 1.1,
                duration: time, 
                ease: "power2.out" });
        }
    };
      
    const handleMouseLeave = (el: HTMLDivElement, time:number): Promise<void> => {
        return new Promise((resolve) => {
            if (allowModalClick){
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

    const waitForCubeCount = (
        target: number
    ): Promise<void> =>{
        return new Promise<void>((resolve, reject) => {
            const start = performance.now();
            const check = () => {
                const ready =
                    cubeRefs.current.length >= target &&
                    cubeRefs.current.slice(0, target).every(Boolean);

                if (ready) return resolve();
                if (performance.now() - start > 2000)
                    return reject("Timed out waiting for cube refs");

                requestAnimationFrame(check);
            };
            check();
        });
    };
    
    const handleDiceAnimate = async (
        positions: { x: number; y: number }[] = [],
        angle: { x: number; y: number } | null,
        duration: number,
        diceanimdelay: number
    ) => {
        setAllowModalClick(false);
        const doesTranslate = positions.length > 0;
        const doesRotate = angle !== null;

        try {
            await waitForCubeCount( doesTranslate ? positions.length : cubeRefs.current.length );
        } catch (err) {
            console.warn(err, "in handleDiceAnimate");
        }

        const rollPromises = cubeRefs.current.map((cube, i) => {
            if (!cube) return Promise.resolve();

            const delay = i * diceanimdelay;
            const anims: Promise<void>[] = [];
            if (doesTranslate && positions[i]) {
                anims.push(animateTranslationCube(cube, delay, duration, positions[i]));
            }
            if (doesRotate && cubeRotators.current[i]) {
                anims.push(animateRotationCube(cubeRotators.current[i], delay, duration, angle!));
            }
            return Promise.all(anims);
        });

        await Promise.all(rollPromises);

        setAllowModalClick(true);
    };

    const handleSetDicePosition = async (
        positions: {x: number; y: number}[] = []
    ) => {
        try {
            await waitForCubeCount(positions.length);
        } catch (err) {
            console.warn(err, "in handleSetDicePosition");
        }
        //console.log("cubeCount    : ", cubeCount.current);
        //console.log("Positions len: ", positions.length);
        //console.log("cubeRefs len : ", cubeRefs.current.length);
        const setPromises = cubeRefs.current.map((cube, i) => {
            if (!cube) return Promise.resolve();
            const pos = positions[i] ?? {x:0, y:0};
            return setPosCube(cube, pos);
        });
        await Promise.all(setPromises); 
    };


    useEffect(() => { // for scaling open cubes
        const handleResize = () => {
            if (selectedLetterIndex>=-1 && selCubeCont.current){
                //moveDiceToOpenPos(selCubeCont.current, 0);
                console.log("open modal");
            }
            refreshDicePositions();
        };
        window.addEventListener('resize', handleResize);
        return ()=> window.removeEventListener('resize', handleResize);
    }, [selectedLetterIndex, selCubeCont, letterModalDimensions, diceItemsPos]);


    //Okay, so when i click it, it shoud:
    //1. Give me an array with the open positions
    //2. Animate them to that position
    //3. Set the positions array to the new position
    const animateOpenCloseDice = async (letterIndex: number) => {
        const dieWidth = letterModalDimensions.current.start_width;//await computeWidth();
        const isLeftToRight = scripts[selectedScriptIndex]?.left_to_right ?? false;
        const initialPositions = await computeAlignedPositions(
            window.innerWidth, 
            dieWidth, //160
            (dieWidth*DICEMARGINSCALE), //40
            (dieWidth*DICEMARGINSCALE), //40
            isLeftToRight,
            letterIndex, // to reset back to place
            intArraySetup.current
        );
        setDiceItemsPos(initialPositions);
        await handleDiceAnimate(initialPositions, null, SWITCHROTTIME, 0.0);
    }


    //how about this: IN LetterModal, detect when the letter index changes, if it does, call close animation from the modal and open it to the new index.
    const handleOnLetterClick = async (letterIndex: number, el: HTMLDivElement) => {
        await handleMouseLeave(el, 0.1); // await 0.1 seconds for size to reset after clicking

        if (selectedLetterIndex>-1 && letterIndex != selectedLetterIndex){
            await LetterModalRef.current?.closeExpandAnim(); //this will call close on its own
        }

        //declare the design and texts of the modal here:
        await LetterModalRef.current?.declareLetterMeta(letterIndex);

        handleOnOpenLetter(letterIndex);
        await LetterModalRef.current?.openExpanAnim();
        
        setSelectedLetterIndex(letterIndex);
    };


    const handleOnOpenLetter = async (letterIndex: number) => {
         await animateOpenCloseDice(letterIndex);
    };

    const handleOnCloseLetter = async () =>{
        //close the letters at the same time as the modal closes.
        await animateOpenCloseDice(-1);
        setSelectedLetterIndex(-1);
    };

    return (
        <div className="relative w-full flex flex-col items-center">
            {/* Title */}
            <div className="scriptTitle text-center">

                <AnimatePresence mode="wait">
                    <motion.h1
                    key={titleKey}
                    initial={{ y: "-100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ duration: SWITCHROTTIME/2, ease: "easeInOut" }}
                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-center"
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
                    className="p-1 border rounded mb-0"
                >
                    {scriptOptions.map((script, idx) => (
                    <option key={idx} value={script}>
                        {script}
                    </option>
                    ))}
                </select>
            </div>
            
            <div className="relative w-full h-[75vh] overflow-hidden">

                <div className="absolute inset-0">
                    <LetterModal
                        ref={LetterModalRef}
                        scripts={scripts} 
                        selectedScriptIndex = {selectedScriptIndex}
                        modalDimensions = {letterModalDimensions}
                        onClose = {handleOnCloseLetter}
                        scriptChange = {handleScriptChange}
                    />
                    
                    {Array.from({length: cubeCount.current}, (_, i) => {
                        const cubeId = `cubewrapper-${i}`;

                        return(
                            <div
                                key={`DieIndex-${i}`}
                                className="absolute transition-transform duration-500"
                                style={{
                                    //transform: `translate(${pos.x}px, ${pos.y}px)`,
                                }}
                            >
                                <LetterCube
                                    key={`LetterCube-${i}`}
                                    cubeId={cubeId}
                                    scriptFaces={scriptFaces}
                                    letterIndex={i}
                                    onClick={handleOnLetterClick}
                                    allowModalClick={allowModalClick}
                                    handleMouseEnter={handleMouseEnter}
                                    handleMouseLeave={handleMouseLeave}
                                    cubeRefs={cubeRefs}
                                    cubeRotators={cubeRotators}
                                    cubeScalers={cubeScalers}
                                    isSelected={false}
                                    scriptChange={handleScriptChange}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
  }