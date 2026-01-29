"use client";

import { useEffect, useState, useRef } from 'react';
import { Script } from '@/types/Script';
import { createEmptyDiceContainerDims } from '@/types/MetaTypes';
import DiceContainer, { DiceContainerHanlde } from "./DiceContainer";
import SelectedScriptTitle, { SelectedScriptTitleHandle } from './SelectedScriptTitle';

const LETTERMODALPERCENTSIZEWIDTH = 0.65; 
const ENTERROTATIONTIME = 1.5;
const SWITCHROTTIME = 0.5;
const DICEANIMDELAY = 0.01;
const DICEMARGINSCALE = 0.3;


export default function MainLayout({ scripts }: { scripts:Script[] }) {

    //Title and other polish
    //const [titleKey, setTitleKey] = useState(0);
    //*----------------------------------------------------------------- */
    //FontSwitcher var declarations
    const [selectedScriptIndex, setSelectedScriptIndex] = useState<number>(-1);
    
    const [scriptOptions, setScriptOptions] = useState<string[]>([]);

    //const [selectedLetterIndex, setSelectedLetterIndex] = useState<number>(-1);
    const SelectedScriptTitleRef = useRef<SelectedScriptTitleHandle> (null);
    const DiceContainerRef = useRef<DiceContainerHanlde> (null);

    //gets initial faces and projects them on die
    useEffect(() => {
        if (DiceContainerRef){
            if (scriptOptions.length == 0){
                setScriptOptions(Array.from(new Set(scripts.map(script => script.title))));
            }
            if (scriptOptions.length > 0 && selectedScriptIndex<0) {
                const startIndex = 0;
                setSelectedScriptIndex(startIndex);

                SelectedScriptTitleRef.current?.handleScriptChange(startIndex);
                const ContainerDims = createEmptyDiceContainerDims();
                ContainerDims.width = window.innerWidth*1;
                ContainerDims.height = window.innerHeight*0.75;
                DiceContainerRef.current?.setupTheGrid(startIndex,scriptOptions[startIndex], ContainerDims);//indexes have to match
            }
        }
    }, [scriptOptions, selectedScriptIndex, DiceContainerRef]);

    //call this when the script has switched
    //Okay, it seems to be doing it right, the issue, is that diePositions isn't changing because I haven't
    //set up the animation for it. The sequence of the code should be the following:
    //1. set diePositions to startPos
    //2. feed endPos to a function that lerps diePositions to it
    //3. done

    const handleScriptChange = async (newScriptIndex: number) => {
        setSelectedScriptIndex(newScriptIndex);
        SelectedScriptTitleRef.current?.handleScriptChange(newScriptIndex);
        DiceContainerRef.current?.handleScriptChange(newScriptIndex);
    };


    const handleSwitchToScriptTreeView = async (toTreeView: boolean) => {
        const ContainerDims = createEmptyDiceContainerDims();
        let alpha = 1;
        if(toTreeView){
            ContainerDims.width = window.innerWidth*0.25;
            ContainerDims.height = window.innerHeight*0.25;
            alpha = 0.5;
        } else {
            ContainerDims.width = window.innerWidth*1;
            ContainerDims.height = window.innerHeight*0.75;
        }
        
        await DiceContainerRef.current?.handleToMinimize(toTreeView, ContainerDims, alpha,0.5);
        
        await SelectedScriptTitleRef.current?.hideTitle(toTreeView, 0.5);
    }




    useEffect(() => { // for scaling open cubes
        const handleResize = () => {
            const ContainerDims = createEmptyDiceContainerDims();
            ContainerDims.width = window.innerWidth*1;
            ContainerDims.height = window.innerHeight*0.75;
            DiceContainerRef.current?.setContainerDimensions(ContainerDims);
        };
        window.addEventListener('resize', handleResize);
        return ()=> window.removeEventListener('resize', handleResize);
    }, []);



    //how about this: IN LetterModal, detect when the letter index changes, if it does, call close animation from the modal and open it to the new index.

    return (
        <div 
            className="relative w-full flex flex-col items-center"
        >
            {/* Title */}
            {<SelectedScriptTitle
                ref={SelectedScriptTitleRef}
                scripts={scripts}
                SWITCHROTTIME={SWITCHROTTIME}
                onSwitchTreeView={handleSwitchToScriptTreeView}
            />}

            <div 
                className="p-1"
                style = {{
                    //backgroundColor: "#3d9444ff",
                }}
            >
                {/* Font Dropdown / Legend*/}
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
            
            {/* Die Container*/}
            {<DiceContainer
                ref={DiceContainerRef}
                scripts = {scripts}
                LETTERMODALPERCENTSIZEWIDTH = {LETTERMODALPERCENTSIZEWIDTH}
                ENTERROTATIONTIME = {ENTERROTATIONTIME}
                SWITCHROTTIME = {SWITCHROTTIME}
                DICEANIMDELAY = {DICEANIMDELAY}
                DICEMARGINSCALE = {DICEMARGINSCALE}
                scriptChange = {handleScriptChange}
                onSwitchTreeView={handleSwitchToScriptTreeView}

            />}

            {/*<div
                className="w-full h-500"
                style = {{backgroundColor: "#802b80ff",}}
            >
            </div>*/}
        </div>
    );
  }