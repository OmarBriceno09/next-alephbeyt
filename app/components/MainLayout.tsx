"use client";

import { useEffect, useState, useRef } from 'react';
import { Script } from '@/types/Script';
import { createEmptyContainerDims } from '@/types/MetaTypes';
import SelectedScriptTitle, { SelectedScriptTitleHandle } from './SelectedScriptTitle';
import { MapTreeNode } from '@/types/MapTreeNode';
import { ScriptMapTreeNode } from '@/types/ScriptMapTreeNode';
import MapTree, { MapTreeHandle } from './MapTree';

const SWITCHROTTIME = 0.5;

function stringToMapEdge( pointsTo: string, mapTreeLength: number): number[] {
    const newPointsTo = [];
    const segments = pointsTo ? pointsTo.split(',') : [];

    for (const segment of segments){
        const trimSeg = segment.trim();
        if(trimSeg.startsWith('n') && trimSeg.length>1){
            const numAfterN = parseFloat(trimSeg.substring(1));

            if(!isNaN(numAfterN))
                newPointsTo.push(numAfterN + mapTreeLength);
            else
                console.warn(`MainLayout:stringToMapEdge: invalid num after 'n' in segment: ${trimSeg}`);          
        } else {
            const numVal = parseFloat(trimSeg);
            if(!isNaN(numVal))
                newPointsTo.push(numVal);
            else
                console.warn(`MainLayout:stringToMapEdge: invalid num after 'n' in segment: ${trimSeg}`)
        }
    }

    return newPointsTo;
}


export default function MainLayout(
    { 
        scripts, 
        mapTreeNodes 
    }: { 
        scripts:Script[], 
        mapTreeNodes: MapTreeNode[] 
    }
) {

    //Title and other polish
    //const [titleKey, setTitleKey] = useState(0);
    //*----------------------------------------------------------------- */
    //FontSwitcher var declarations
    const [selectedScriptIndex, setSelectedScriptIndex] = useState<number>(-1);
    
    const [scriptOptions, setScriptOptions] = useState<string[]>([]);
    const [scriptMapTreeNodes, setScriptMapTreeNodes] = useState<ScriptMapTreeNode[]>([]);

    //const [selectedLetterIndex, setSelectedLetterIndex] = useState<number>(-1);
    const SelectedScriptTitleRef = useRef<SelectedScriptTitleHandle> (null);
    const MapTreeRefHandle = useRef<MapTreeHandle> (null);

    const [inTreeView, setInTreeView] = useState<boolean>(false);
    //const [DefaultDims, setDefaultDims] = useState<DiceContainerDimensions> (createEmptyDiceContainerDims());
    //const DiceContainerRefHandle = useRef<DiceContainerHandle> (null);

    

    //gets initial faces and projects them on die
    useEffect(() => {
        if(MapTreeRefHandle){
            if (scriptOptions.length == 0){
                declareLangMapTreeNodes();
                setScriptOptions(Array.from(new Set(scripts.map(script => script.title))));
            }
            if(scriptOptions.length > 0 && selectedScriptIndex<0){
            
                const defDims = createEmptyContainerDims();
                defDims.width = document.documentElement.clientWidth;
                defDims.height = window.innerHeight*0.75;
                //setDefaultDims(defDims);
                //this one will also set the diceContainer

                const startIndex = 0;
                setSelectedScriptIndex(startIndex);
                SelectedScriptTitleRef.current?.handleScriptChange(startIndex);
                MapTreeRefHandle.current?.setupTreeContainerDimensions(defDims, startIndex, scriptOptions);
            }
        }
    }, [scriptOptions, selectedScriptIndex, MapTreeRefHandle]);

    //call this when the script has switched
    //Okay, it seems to be doing it right, the issue, is that diePositions isn't changing because I haven't
    //set up the animation for it. The sequence of the code should be the following:
    //1. set diePositions to startPos
    //2. feed endPos to a function that lerps diePositions to it
    //3. done

    const declareLangMapTreeNodes = async ():Promise<void> => {
        const langMTNodes : ScriptMapTreeNode[] = [];
        scripts.forEach(script => {
            const langNode:ScriptMapTreeNode = {
                _id: script._id,
                title: script.title,
                order_index: script.order_index,
                age_pos: script.age_pos,
                points_to: stringToMapEdge(script.points_to, scripts.length),
                is_node: false,
                x: 0, y: 0
            };
            langMTNodes.push(langNode);
        });
        mapTreeNodes.forEach(node => {
            const langNode:ScriptMapTreeNode = {
                _id: node._id,
                title: node.title,
                order_index: node.order_index,
                age_pos: node.age_pos,
                points_to: stringToMapEdge(node.points_to, scripts.length),//scripts.length is kept in case a node points to another...
                is_node: true,
                x: 0, y: 0
            };
            langMTNodes.push(langNode); 
        });

        setScriptMapTreeNodes(langMTNodes);
    };


    const handleScriptChange = async (newScriptIndex: number) => {
        setSelectedScriptIndex(newScriptIndex);
        SelectedScriptTitleRef.current?.handleScriptChange(newScriptIndex);
        MapTreeRefHandle.current?.handleScriptChange(newScriptIndex);
    };


    const handleSwitchToScriptTreeView = async (toTreeView: boolean) => {
        setInTreeView(toTreeView);
        const defDims = createEmptyContainerDims();
        defDims.width = document.documentElement.clientWidth;
        defDims.height = window.innerHeight*0.75;

        MapTreeRefHandle.current?.handleToOpenTree(toTreeView, defDims, 0.5);

        await SelectedScriptTitleRef.current?.hideTitle(toTreeView, 0.5);
    }


    useEffect(() => { // for scaling open cubes
        const handleResize = () => {
            const defDims = createEmptyContainerDims();
            defDims.width = document.documentElement.clientWidth;
            defDims.height = window.innerHeight*0.75;
            //setDefaultDims(defDims);
            MapTreeRefHandle.current?.setTreeContainerDimensions(defDims);
        };
        window.addEventListener('resize', handleResize);
        return ()=> window.removeEventListener('resize', handleResize);
    }, []);



    //how about this: IN LetterModal, detect when the letter index changes, if it does, call close animation from the modal and open it to the new index.

    return (
        <div 
            className="relative flex flex-col items-center"
        >
            {/* Title */}
            {<SelectedScriptTitle
                ref={SelectedScriptTitleRef}
                scripts={scripts}
                SWITCHROTTIME={SWITCHROTTIME}
                onSwitchTreeView={handleSwitchToScriptTreeView}
            />}

            {<MapTree
                ref={MapTreeRefHandle}
                inTreeView = {inTreeView}
                scripts={scripts}
                scriptMapTreeNodes={scriptMapTreeNodes}
                scriptChange = {handleScriptChange}
                onSwitchTreeView={handleSwitchToScriptTreeView}
            />}

            {/*
            <div 
                className="p-1"
                style = {{
                    //backgroundColor: "#3d9444ff",
                }}
            >
                {// Font Dropdown / Legend}
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
            */}
            <div
                className="footerSpace w-full h-[10vh]"
            >
            </div>

            {/*<div
                className="w-full h-500"
                style = {{backgroundColor: "#802b80ff",}}
            >
            </div>*/}
        </div>
    );
  }