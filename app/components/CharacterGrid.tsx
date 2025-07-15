"use client";

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import gsap from "gsap";
import CharacterModal from './CharacterModal';
import { Character } from '@/types/Character';
import { Script } from '@/types/Script';
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

//type CharacterRow for switching fonts/scripts ***remove later***
type CharacterRow = {
    letter_name: string;
    script_title: string;
    font_title: string;
    char: string;
}

function renderFace(
    faceName: string,
    character: {
      char_color?: string;
      modern_char?: { asset?: { url?: string } };
      letter_name: string;
    },
    data: CharacterRow[],
    selectedScript: string
  ) {
    /** doing this is very inefficient, I am thinking of adding an index on the csv so that I can get a list on the layer above,
     *  and have the just the character be passed down to the function, instead of the whole data and filtering it here.*/
    const filteredChar = selectedScript ? 
        data.filter(row => row.script_title === selectedScript && character.letter_name == row.letter_name)[0]: 
        {letter_name: "", script_title: "", font_title: "", char: ""};
    return (
      <div
        className={`face ${faceName}`}
        style={{ backgroundColor: character.char_color || "#f5f5f5" }}
        key={faceName}
      >

        {/**character.modern_char?.asset?.url && (
          <img
            src={character.modern_char.asset.url}
            alt={character.letter_name}
            className="w-3/5 h-3/5 object-contain"
          />
        )**/}
        <h1 className="glyph-container">
            <span
                className="inline-block leading-none translate-y-[8%]"
                style={{ fontFamily: `${filteredChar.font_title}, sans-serif` }}
            >
                {filteredChar.char}
            </span>
        </h1>
        <span className="text-[1.5vw] sm:text-sm mt-1 text-center">
            {character.letter_name}
        </span>
      </div>
    );
}

function getNeighborScripts(scriptOrder: string [], newScript: string, total: number): string[] {
    const index = scriptOrder.indexOf(newScript);
    const half = Math.ceil(total / 2);
    const diff = half*2 - total;
    const wrap = (i: number) => (i + scriptOrder.length) % scriptOrder.length;

    const neighbors = [];
    for (let i = -half; i <= half-diff; i++) {
      if (i !== 0) neighbors.push(scriptOrder[wrap(index + i)]);
    }
    return neighbors;
}


export default function CharacterGrid({ characters, scripts }: { characters: Character[], scripts:Script[] }) {
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

    //*----------------------------------------------------------------- */
    //FontSwitcher var declarations
    const [data, setData] = useState<CharacterRow[]>([]);
    const [selectedScript, setSelectedScript] = useState<string | null>(null);
    const [scriptFaces, setScriptFaces] = useState<string[]>([]);

    useEffect(() => {
        fetch('/data/AlephBeytDatabase.csv')
            .then(res => res.text())
            .then(csv => {
            const parsed = Papa.parse<CharacterRow>(csv, {
                header: true,
                skipEmptyLines: true,
            });
            setData(parsed.data);
        });

    }, []);

    const scriptOptions = Array.from(new Set(data.map(row => row.script_title)));
    
    useEffect(() => {
        if (scriptOptions.length > 0 && !selectedScript) {
        const initialFaces = getNeighborScripts(scriptOptions, scriptOptions[0], 5);
        initialFaces.unshift(scriptOptions[0]);
        setScriptFaces(initialFaces);
        setSelectedScript(scriptOptions[0]); // default to first option
        }
    }, [scriptOptions, selectedScript]);

    const handleScriptChange = async (newScript: string) => {
        const faceIndex = scriptFaces.indexOf(newScript);
        if (scriptFaces.includes(newScript)){
            console.log("current face" ,Faces[faceIndex]);
            await handleRotClick(faceRotationMap[faceIndex]);//rotate to index
        }
        else{
            const selectedIndex = scriptFaces.indexOf(selectedScript||"");//this will get the previous selected face index
            const newFaces = getNeighborScripts(scriptOptions, newScript, 5);
            const partialFaces = [...scriptFaces]; //copy script faces
            if(selectedIndex == Faces.front){// switch the back face, roll to it, then switch the rest of the faces
                console.log("backface change");
                //change backface
                partialFaces[Faces.back] = newScript;
                setScriptFaces(partialFaces);
                //roll
                await handleRotClick(faceRotationMap[Faces.back]);
                //append to rest of faces
                newFaces.push(newScript);

            }else{//switch the front face, roll to it, then switch the rest of the faces
                console.log("frontface change");
                
                //change front face
                partialFaces[Faces.front] = newScript;
                setScriptFaces(partialFaces);

                //roll
                await handleRotClick(faceRotationMap[Faces.front]);
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
    const row1 = characters.slice(0, 7);
    const row2 = characters.slice(7, 15);
    const row3 = characters.slice(15, 22);
    const rows = [row1, row2, row3];

    const cubeRefs = useRef<HTMLDivElement[]>([]);

    useLayoutEffect(() => {
        cubeRefs.current.forEach((cube, i) => {
            if (cube){
                const delay = i * 0.01;
                rollCube(cube, delay, 2, {x:360, y:360});//360,360
            }
        });
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
    
    const handleRotClick = async (angle: {x: number; y: number}) => {
        const rollPromises = cubeRefs.current.map((cube, i) => {
            if (!cube) return Promise.resolve();
            const delay = i * 0.01;
            return rollCube(cube, delay, 1, angle);//360,360
        });

        await Promise.all(rollPromises);
    };

    let overallIndex = 0;
    return (
        <div>
            <div className="p-1">
                {/* Font Dropdown */}
                <select
                    onChange={(e) => handleScriptChange(e.target.value)}
                    value={selectedScript || ''}
                    className="p-1 border rounded mb-4"
                >
                    {scriptOptions.map((script, idx) => (
                    <option key={idx} value={script}>
                        {script}
                    </option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col [gap:clamp(1.5rem,2.75vw,4rem)]">
                {rows.map((row, i) => (
                    <div 
                        key={i}
                        className="flex justify-center [gap:clamp(1.5rem,2.75vw,4rem)]"
                    >
                        {row.map((character) => (
                            <div 
                                key={`cubewrapper-${character._id}`} 
                                className="cursor-pointer"
                                onClick={() => setSelectedCharacter(character)}
                                onMouseEnter={(e) => handleMouseEnter(e.currentTarget)}
                                onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
                            >
                                <div
                                ref = {(el) => {
                                    if (el) cubeRefs.current[overallIndex] = el;
                                    overallIndex += 1;
                                }}
                                className="cube perspective" 
                                >
                                    <div className="cube-inner">
                                        {renderFace("front",character, data, scriptFaces[Faces.front])}
                                        {renderFace("back",character, data, scriptFaces[Faces.back])}
                                        {renderFace("left",character, data, scriptFaces[Faces.left])}
                                        {renderFace("right",character, data, scriptFaces[Faces.right])}
                                        {renderFace("top",character, data, scriptFaces[Faces.top])}
                                        {renderFace("bottom",character, data, scriptFaces[Faces.bottom])}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                
                <CharacterModal character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />
            </div>
        </div>
    );
  }