import { createEmptyDiceContainerDims, createEmptyModalDims, DiceContainerDimensions, ModalDimensions } from "@/types/MetaTypes";
import { Script } from "@/types/Script";
import gsap from "gsap";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import LetterModal, { LetterModalHandle } from "./LetterModal";
import LetterCube from "./LetterCube";


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

const DIECONTAINERSCALE = 0.07; // this number has to match to "--cube-size: 7cqw;" inside of globals.css

interface DiceContainerProps {
    scripts: Script [],
    LETTERMODALPERCENTSIZEWIDTH: number,
    ENTERROTATIONTIME: number,
    SWITCHROTTIME: number,
    DICEANIMDELAY: number,
    DICEMARGINSCALE: number,
    scriptChange: (newScriptIndex: number) => void;
    onSwitchTreeView: (toTreeView: boolean) => void;
}

export type DiceContainerHanlde = {
    setupTheGrid: (scriptIndex: number, scriptOption: string, ContainerDims: DiceContainerDimensions) => Promise<void>;
    setContainerDimensions: (ContainerDims: DiceContainerDimensions) => Promise<void>
    handleToMinimize: (isMinimized:boolean, ContainerDims: DiceContainerDimensions, alpha: number, time:number) => Promise<void>;
    handleScriptChange: (newScriptIndex: number) => Promise<void>;
};

const DiceContainer = forwardRef<DiceContainerHanlde, DiceContainerProps>(
    function DiceContainer(
        {
            scripts,
            LETTERMODALPERCENTSIZEWIDTH, 
            ENTERROTATIONTIME,
            SWITCHROTTIME,
            DICEANIMDELAY,
            DICEMARGINSCALE,
            scriptChange,
            onSwitchTreeView
        },
        ref
    ){

        const DiceContainerRef = useRef<HTMLDivElement> (null);

        const [selectedScriptIndex, setSelectedScriptIndex] = useState<number>(-1);

        const [scriptFaces, setScriptFaces] = useState<Script[]>([]);
        const [diceItemsPos, setDiceItemsPos] = useState<{x: number; y: number}[]>([]);
        const cubeCount = useRef<number>(0); //this is important, because this drives how many CubeRefs are being rendered    
        const cubeRefs = useRef<HTMLDivElement[]>([]); // x/y Positioning
        const cubeRotators = useRef<HTMLDivElement[]>([]); // roatate x/y/z
        const cubeScalers  = useRef<HTMLDivElement[]>([]); // hover scale
    
        const selectedLetterIndex = useRef<number>(-1);
        const intArraySetup = useRef<number[]>([7,8,7]);
        const containerDimensions = useRef<DiceContainerDimensions>(createEmptyDiceContainerDims());
        const letterModalDimensions = useRef<ModalDimensions>(createEmptyModalDims());
        //const scriptOptions = Array.from(new Set(scripts.map(script => script.title)));
        //const [letterModalDimensions, setLetterModalDimensions] = useState<ModalDimensions>(createEmptyModalDims());
        const LetterModalRef = useRef<LetterModalHandle> (null);
        const [allowModalClick, setAllowModalClick] = useState(false);// this will allow for the die to be clickable
        const [isMinimized, setIsMinimized] = useState(false); //this will switch true when die container is small
        const [selDieVis, setSelDieVis] = useState(true);

        const setContainerDimensions = async (ContainerDims: DiceContainerDimensions): Promise<void> => {
            return new Promise((resolve => {
                gsap.set(
                    DiceContainerRef.current,
                    {
                        width: ContainerDims.width,
                        height: ContainerDims.height,
                        x: ContainerDims.x,
                        y: ContainerDims.y,
                        onComplete: () => {
                            containerDimensions.current = ContainerDims;
                            refreshDicePositions();
                            resolve();
                        }
                    },
                );
            }));
        };

        const animateContainerDimensions = async (ContainerDims: DiceContainerDimensions, alpha: number, time:number): Promise<void> => {
            containerDimensions.current = ContainerDims;
            await computeLetterDimensions(); //this seems to have the letterModalDimension.start_width = 0 ???
            const dieWidth = letterModalDimensions.current.start_width;//await computeWidth();
            const isLeftToRight = scripts[selectedScriptIndex]?.left_to_right ?? false;
            console.log("animateContainerDims: selectedLetterIndex: ", selectedLetterIndex.current);
            const initialPositions = await computeAlignedPositions(
                containerDimensions.current.width,//ContainerWidth, 
                dieWidth, //160
                (dieWidth*DICEMARGINSCALE), //40
                (dieWidth*DICEMARGINSCALE), //40
                isLeftToRight,
                selectedLetterIndex.current,
                intArraySetup.current
            );
            setDiceItemsPos(initialPositions);//setDiceItemsPos(initialPositions);
            //handleSetDicePosition(initialPositions);
            handleDiceAnimate(initialPositions, null, time, 0.0, "none");


            return new Promise((resolve => {
                gsap.to(
                    DiceContainerRef.current,
                    {
                        width: ContainerDims.width,
                        height: ContainerDims.height,
                        x: ContainerDims.x,
                        y: ContainerDims.y,
                        opacity: alpha,
                        duration: time,
                        ease: "none",//"power2.out",
                        onComplete: () => {
                            refreshDicePositions();
                            resolve();
                        }
                    },
                );
            }));
        };

        const setupTheGrid = async(scriptIndex: number, scriptOption: string, ContainerDims: DiceContainerDimensions) => {
            const initialFaces = getNeighborScripts(scripts, scriptOption, 5);
            initialFaces.unshift(scripts[scriptIndex]);//remove script zero
            setScriptFaces(initialFaces);
            setSelectedScriptIndex(0); // default to first option
            LetterModalRef.current?.scriptChangeUpdates(scriptIndex); //setting script for modal as 0
            //To set up initial "7,8,7" or other Int Array Setup
            intArraySetup.current = stringToArraySetup(scripts[scriptIndex].array_setup);
            cubeCount.current = intArraySetup.current.reduce((a, b)=> a+b, 0);
            //after this intArrayIsSetup
            await setContainerDimensions(ContainerDims);
            //this will not be 360 maybe? Fix later?
            setAllowModalClick(false);
            handleDiceAnimate([], {x:360, y:360}, ENTERROTATIONTIME, DICEANIMDELAY, "power4.out");
            setAllowModalClick(true);
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
                    //const styles = getComputedStyle(firstCube);
                    const dieWidth = containerDimensions.current.width*DIECONTAINERSCALE//parseFloat(styles.width);
                    letterModalDimensions.current.start_width = dieWidth;
                    letterModalDimensions.current.start_height = dieWidth;
                    const modalWidth = LETTERMODALPERCENTSIZEWIDTH * containerDimensions.current.width;
                    letterModalDimensions.current.end_width = modalWidth;

                    const modalHeight =  containerDimensions.current.height - (dieWidth*DICEMARGINSCALE);

                    letterModalDimensions.current.end_height = modalHeight;
                }
            }
        };

        const refreshDicePositions = async() =>{
            await computeLetterDimensions(); //this seems to have the letterModalDimension.start_width = 0 ???
            const dieWidth = letterModalDimensions.current.start_width;//await computeWidth();
            const isLeftToRight = scripts[selectedScriptIndex]?.left_to_right ?? false;
            console.log("refresDiePos: selectedLetterIndex = ", selectedLetterIndex.current);
            const initialPositions = await computeAlignedPositions(
                containerDimensions.current.width,//ContainerWidth, 
                dieWidth, //160
                (dieWidth*DICEMARGINSCALE), //40
                (dieWidth*DICEMARGINSCALE), //40
                isLeftToRight,
                selectedLetterIndex.current,
                intArraySetup.current
            );
            if (selectedLetterIndex.current>-1) //rescale modal when opened
                await LetterModalRef.current?.rescaleOpenModal();
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

                    const x = isLeftToRight ? startX + offset : startX + (totalRowWidth - dieSize - offset);
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

        const animateTranslationCube = (
            cube: HTMLDivElement, 
            delay: number, 
            rottime: number,
            position: {x: number, y: number}, 
            ease: string,
        ): Promise<void> => {
            return new Promise((resolve) =>{
                gsap.to(
                    cube,
                    {
                        x: position.x,
                        y: position.y,
                        duration: rottime,
                        delay,
                        ease: ease,//"none",//"power4.out",
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
    
        const animateRotationCube = (
            cube: HTMLDivElement, 
            delay: number, 
            rottime: number,
            angle: {x: number; y: number},
            ease: string,
        ):Promise<void> => {
            return new Promise((resolve) =>{
                gsap.to(
                    cube,
                    {
                        rotationX: angle.x,
                        rotationY: angle.y,
                        duration: rottime,
                        delay,
                        ease: ease,
                        onComplete: () => {
                            resolve();
                        }
                    }
                );
            });
        };
    
        const handleMouseEnter = (el: HTMLDivElement, time:number) => {
            const elIndex = el.getAttribute('data-index') || -1;
            //console.log("selIndex: ", selectedLetterIndex);
            if (allowModalClick && elIndex != selectedLetterIndex.current){//elIndex will never be -1, so elIndex(-1) == selectedLetterIndex(-1) will never happen
                //console.log("el: "+ el.getAttribute('data-index')+ ", selIndex: "+selectedLetterIndex);
                gsap.killTweensOf(el); // stop previous tweens
                gsap.to(el, { 
                    scale: 1.1,
                    duration: time, 
                    ease: "power2.out" });
            }
        };
            
        const handleMouseLeave = (el: HTMLDivElement, time:number): Promise<void> => {
            return new Promise((resolve) => {
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
            diceanimdelay: number,
            ease: string
        ) => {
            //setAllowModalClick(false); //when the die are animated, the selection will be set to false.
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
                    anims.push(animateTranslationCube(cube, delay, duration, positions[i], ease));
                }
                if (doesRotate && cubeRotators.current[i]) {
                    anims.push(animateRotationCube(cubeRotators.current[i], delay, duration, angle!, ease));
                }
                return Promise.all(anims);
            });
    
            await Promise.all(rollPromises);
    
            //setAllowModalClick(true);
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
                containerDimensions.current.width,//ContainerWidth,, 
                dieWidth, //160
                (dieWidth*DICEMARGINSCALE), //40
                (dieWidth*DICEMARGINSCALE), //40
                isLeftToRight,
                selectedLetterIndex.current,
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

            setSelectedScriptIndex(newScriptIndex);
            LetterModalRef.current?.scriptChangeUpdates(newScriptIndex);

            //face logic
            //console.log("handleScriptChange: ",scripts[newScriptIndex]);
            const faceIndex = scriptFaces.findIndex(script => script.title === newScriptStr);
            setAllowModalClick(false);
            if (scriptFaces.some(script => script.title === newScriptStr)){//like includes
                
                console.log("current face" ,Faces[faceIndex]);
                await handleDiceAnimate(endPositions, faceRotationMap[faceIndex], 
                    SWITCHROTTIME, DICEANIMDELAY, "power4.out");//rotate to index
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
                    await handleDiceAnimate(endPositions, faceRotationMap[Faces.back], 
                        SWITCHROTTIME, DICEANIMDELAY, "power4.out");
                    //append to rest of faces
                    newFaces.push(scripts[newScriptIndex]);

                }else{//switch the front face, roll to it, then switch the rest of the faces
                    console.log("frontface change");
                    
                    //change front face
                    partialFaces[Faces.front] = scripts[newScriptIndex];
                    setScriptFaces(partialFaces);

                    //roll
                    await handleDiceAnimate(endPositions, faceRotationMap[Faces.front], 
                        SWITCHROTTIME, DICEANIMDELAY, "power4.out");
                    //append to rest of faces
                    newFaces.unshift(scripts[newScriptIndex]);
                }
                setScriptFaces(newFaces);//change all faces
            }
            setAllowModalClick(true);
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


        //Okay, so when i click it, it shoud:
        //1. Give me an array with the open positions
        //2. Animate them to that position
        //3. Set the positions array to the new position
        const animateOpenCloseDice = async (letterIndex: number) => {
            const dieWidth = letterModalDimensions.current.start_width;//await computeWidth();
            const isLeftToRight = scripts[selectedScriptIndex]?.left_to_right ?? false;
            const initialPositions = await computeAlignedPositions(
                containerDimensions.current.width,//ContainerWidth, 
                dieWidth, //160
                (dieWidth*DICEMARGINSCALE), //40
                (dieWidth*DICEMARGINSCALE), //40
                isLeftToRight,
                letterIndex, // to reset back to place
                intArraySetup.current
            );
            setDiceItemsPos(initialPositions);
            await handleDiceAnimate(initialPositions, null, SWITCHROTTIME, 0.0, "power4.out");
        }

        const handleOnLetterClick = async (letterIndex: number, el: HTMLDivElement) => {
            setAllowModalClick(false); // this will turn back to true after all dice are animated with handleOpenLetter
            await handleMouseLeave(el, 0.2); // await 0.1 seconds for size to reset after clicking

            console.log("DiceContainer:handleOnLetterClick: arg letterIndex = ", letterIndex);
            console.log("DiceContainer:handleOnLetterClick: selectedLetterIndex = ", selectedLetterIndex.current);
            if (selectedLetterIndex.current>-1 && letterIndex != selectedLetterIndex.current){
                //setAllowModalClick(false);
                await LetterModalRef.current?.closeExpandAnim(true); //true = is switching the letter, not closing
                setAllowModalClick(true);
            }
            selectedLetterIndex.current = letterIndex;

            //declare the design and texts of the modal here:
            await LetterModalRef.current?.declareLetterMeta(letterIndex);

            handleOnOpenLetter(letterIndex);
            await LetterModalRef.current?.openExpanAnim();

            setSelDieVis(false); //turns off the die so its not visible when rolling
        };

        const handleOnOpenLetter = async (letterIndex: number) => {
            setAllowModalClick(false);
            await animateOpenCloseDice(letterIndex);
            setAllowModalClick(true);
        };

        //allow modal click will be determined when closeExpandAnim is called
        const handleOnCloseLetter = async (switchingLetter:boolean) =>{
            //close the letters at the same time as the modal closes.
            setSelDieVis(true); // dice is back on before expansion to avoid race condition, the die will always be visible before the modal dissapears
            if(!switchingLetter)
                //console.log("DiceContainer:handleOnCloseLetter: not switching to letter, so index is -1");
                selectedLetterIndex.current = -1;//if letter is not being switched, then close
            await animateOpenCloseDice(-1);
        };

        const handleToMinimize = async (toMinimize:boolean, ContainerDims: DiceContainerDimensions, alpha: number, time:number) => {
            console.log("DiceContainer:handleToMinimize: arg toMinimized = ", toMinimize);
            setIsMinimized(toMinimize);
            setAllowModalClick(!toMinimize);
            console.log("DiceContainer:handleToMinimize: arg selectedLetterIndex = ", selectedLetterIndex);
            if(toMinimize && selectedLetterIndex.current>-1){
                console.log("DiceContainer:handleToMinimize: Modal closing");
                await LetterModalRef.current?.closeExpandAnim(false);

                console.log("DiceContainer:handleToMinimize: Modal closed");
            }

            animateContainerDimensions(ContainerDims, alpha, time);
        } 

        useImperativeHandle(ref, () => ({
            setupTheGrid,
            setContainerDimensions,
            handleToMinimize,
            handleScriptChange
        }));


        return (
            <div
                ref = {DiceContainerRef} 
                className="relative overflow-hidden cube-grid-container"
                onClick={() => {
                    if(isMinimized){
                        console.log("Clicked dice container");
                        onSwitchTreeView(false);
                    }
                }}
                style = {{
                        //opacity: 0.5,
                        //{`--cube-size`: `${letterModalDimensions.current.start_width}px`},
                        //w-[85vw], h-[75vh]
                        //width: TEMPWIDTH,
                        //backgroundColor: "#953b2d",
                }}
            >

                <div className="absolute inset-0">
                    <LetterModal
                        ref={LetterModalRef}
                        scripts={scripts} 
                        modalDimensions = {letterModalDimensions}
                        onClose = {handleOnCloseLetter}
                        scriptChange = {scriptChange}
                    />
                    
                    {Array.from({length: cubeCount.current}, (_, i) => {
                        const cubeId = `cubewrapper-${i}`;

                        return(
                            <div
                                key={`DieIndex-${i}`}
                                className="absolute transition-transform duration-500"
                                style={{
                                    opacity: (selectedLetterIndex.current == i && !selDieVis) ? 0 : 1,
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
                                    scriptChange={scriptChange}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
);

export default DiceContainer;