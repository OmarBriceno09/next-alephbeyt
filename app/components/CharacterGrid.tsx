"use client";

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import gsap from "gsap";
import CharacterModal from './CharacterModal';
import { Character } from '@/types/Character';
import Papa from 'papaparse';

//type CharacterRow for switching fonts/scripts ***remove later***
type CharacterRow = {
    letter_name: string;
    script_title: string;
    font_title: string;
    char: string;
}

export default function CharacterGrid({ characters }: { characters: Character[] }) {
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

    //*----------------------------------------------------------------- */
    //FontSwitcher var declarations
    const [data, setData] = useState<CharacterRow[]>([]);
    const [selectedScript, setSelectedScript] = useState<string | null>(null);

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

    const fontOptions = Array.from(new Set(data.map(row => row.script_title)));

    // Filter data by selected font
    const filteredChars  = selectedScript
    ? data.filter(row => row.script_title === selectedScript)
    : data;
    //*----------------------------------------------------------------- */
  
    //splitting characters from groq... might remove later to just stick with csv
    const row1 = characters.slice(0, 7);
    const row2 = characters.slice(7, 15);
    const row3 = characters.slice(15, 22);
    const rows = [row1, row2, row3];

    const cubeRefs = useRef<HTMLDivElement[]>([]);

    const faceRotationMap = {
        front: { x: 0, y: 0 },
        back: { x: 0, y: 180 },
        right: { x: 0, y: -90 },
        left: { x: 0, y: 90 },
        top: { x: -90, y: 0 },
        bottom: { x: 90, y: 0 },
    };

    useLayoutEffect(() => {
        cubeRefs.current.forEach((cube, i) => {
            if (cube){
                const delay = i * 0.01;
                rollCube(cube, delay, 2, {x:360, y:360});//360,360
            }
        });
    }, []);

    const rollCube = (cube: HTMLDivElement, delay: number, rottime: number, angle: {x: number; y: number} ) => {
        gsap.to(
            cube,
            {
                rotationX: angle.x,
                rotationY: angle.y,
                duration: rottime,
                delay,
                ease: "power4.out",
            }
        );
    };

    const handleMouseEnter = (el: HTMLDivElement) => {
        gsap.to(el, { scale: 1.1, duration: 0.3, ease: "power2.out" });
      };
      
    const handleMouseLeave = (el: HTMLDivElement) => {
    gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" });
    };
    
    const handleRotClick = (angle: {x: number; y: number}) => {
        cubeRefs.current.forEach((cube, i) => {
            if (cube){
                const delay = i * 0.01;
                rollCube(cube, delay, 1, angle);//360,360
            }
        });
    };

    let overallIndex = 0;
    return (
        <div>
            <div className="p-4">
                {/* Font Dropdown */}
                <label className="block mb-2 font-semibold text-lg">Select a Font Style:</label>
                <select
                    onChange={(e) => setSelectedScript(e.target.value)}
                    value={selectedScript || ''}
                    className="p-2 border rounded mb-6"
                >
                    <option value="" disabled>Select a font</option>
                    {fontOptions.map((font, idx) => (
                    <option key={idx} value={font}>
                        {font}
                    </option>
                    ))}
                </select>

                {/* Characters for Selected Font */}
                <div className="border p-4 min-h-[200px] text-4xl font-extrabold text-center">
                    {selectedScript && filteredChars.length > 0 ? (
                    filteredChars.map((row, i) => (
                        <span
                        key={i}
                        style={{ 
                            fontFamily: row.font_title, 
                            margin: '0 0.5rem',
                            display: 'inline-block',
                        }}
                        >
                        {row.char}
                        </span>
                    ))
                    ) : (
                    <p>Select a font to see its characters.</p>
                    )}
                </div>
            </div>
            <div className="flex flex-row">
                <div className="p-2 border rounded mb-6">  
                    <button 
                    onClick={() => handleRotClick(faceRotationMap.front)}>
                        Front
                    </button>
                </div>
                <div className="p-2 border rounded mb-6">  
                    <button 
                    onClick={() => handleRotClick(faceRotationMap.right)}>
                        Right
                    </button>
                </div>
                <div className="p-2 border rounded mb-6">  
                    <button 
                    onClick={() => handleRotClick(faceRotationMap.left)}>
                        Left
                    </button>
                </div>
                <div className="p-2 border rounded mb-6">  
                    <button 
                    onClick={() => handleRotClick(faceRotationMap.top)}>
                        Top
                    </button>
                </div>
                <div className="p-2 border rounded mb-6">  
                    <button 
                    onClick={() => handleRotClick(faceRotationMap.bottom)}>
                        Bottom
                    </button>
                </div>
                <div className="p-2 border rounded mb-6">  
                    <button 
                    onClick={() => handleRotClick(faceRotationMap.back)}>
                        Back
                    </button>
                </div>
            </div>
            <div className="flex flex-col [gap:clamp(1.5rem,2.75vw,4rem)]">
                {rows.map((row, i) => (
                    <div 
                        key={i}
                        className="flex justify-center [gap:clamp(1.5rem,2.75vw,4rem)]"
                    >
                    {row.map((character) => (
                        <div 
                            ref = {(el) => {
                                if (el) cubeRefs.current[overallIndex] = el;
                                overallIndex += 1;
                            }}
                            key={`cube-${character._id}`} 
                            className="cube perspective cursor-pointer" 
                            onClick={() => setSelectedCharacter(character)}
                            onMouseEnter={(e) => handleMouseEnter(e.currentTarget)}
                            onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
                        >
                            <div className="cube-inner">
                                <div 
                                    className="face front" 
                                    style={{ backgroundColor: character.char_color || "#f5f5f5" }}
                                >
                                <h1 className="glyph-container">
                                    <span className="glyph">𓆟</span>
                                </h1>
                                <span className="text-[1.5vw] sm:text-sm mt-1 text-center">
                                    {character.letter_name}
                                </span>
                                </div>
                                <div className="face back" style={{ backgroundColor: character.char_color || "#f5f5f5" }}>
                                    {character.modern_char?.asset?.url && (
                                        <img
                                        src={character.modern_char.asset.url}
                                        alt={character.letter_name}
                                        className="w-3/5 h-3/5 object-contain"
                                        />
                                    )}
                                </div>
                                <div className="face left" style={{ backgroundColor: character.char_color || "#f5f5f5" }}>
                                    {character.modern_char?.asset?.url && (
                                        <img
                                        src={character.modern_char.asset.url}
                                        alt={character.letter_name}
                                        className="w-3/5 h-3/5 object-contain"
                                        />
                                    )}
                                </div>
                                <div className="face right" style={{ backgroundColor: character.char_color || "#f5f5f5" }}>
                                    {character.modern_char?.asset?.url && (
                                        <img
                                        src={character.modern_char.asset.url}
                                        alt={character.letter_name}
                                        className="w-3/5 h-3/5 object-contain"
                                        />
                                    )}
                                </div>
                                <div className="face top" style={{ backgroundColor: character.char_color || "#f5f5f5" }}>
                                    {character.modern_char?.asset?.url && (
                                        <img
                                        src={character.modern_char.asset.url}
                                        alt={character.letter_name}
                                        className="w-3/5 h-3/5 object-contain"
                                        />
                                    )}
                                </div>
                                <div className="face bottom" style={{ backgroundColor: character.char_color || "#f5f5f5" }}>
                                    {character.modern_char?.asset?.url && (
                                        <img
                                        src={character.modern_char.asset.url}
                                        alt={character.letter_name}
                                        className="w-3/5 h-3/5 object-contain"
                                        />
                                    )}
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