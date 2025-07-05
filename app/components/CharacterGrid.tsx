"use client";

import { useState, useRef, useLayoutEffect } from 'react';
import gsap from "gsap";
import CharacterModal from './CharacterModal';
import { Character } from '@/types/Character';
import Image from 'next/image';

export default function CharacterGrid({ characters }: { characters: Character[] }) {
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
    const row1 = characters.slice(0, 7);
    const row2 = characters.slice(7, 15);
    const row3 = characters.slice(15, 22);
    const rows = [row1, row2, row3];

    const cubeRefs = useRef<HTMLDivElement[]>([]);

    useLayoutEffect(() => {
        cubeRefs.current.forEach((cube, i) => {
            if (cube){
                const delay = i * 0.01;
                rollCube(cube, delay);
            }
        });
    }, []);

    const rollCube = (cube: HTMLDivElement, delay: number) => {
        gsap.fromTo(
            cube,
            { rotationX: 0, rotationY: 0 },
            {
                rotationX: "+=360",
                rotationY: "-=360",
                duration: 2,
                delay,
                ease: "power4.out",
                onComplete: () => {
                    gsap.set(cube, { rotationX: 0, rotationY: 0 });
                },
            }
        );
    };

    const handleMouseEnter = (el: HTMLDivElement) => {
        gsap.to(el, { scale: 1.1, duration: 0.3, ease: "power2.out" });
      };
      
    const handleMouseLeave = (el: HTMLDivElement) => {
    gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" });
    };

    let overallIndex = 0;
    return (
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
                            {character.modern_char?.asset?.url && (
                                <Image
                                src={character.modern_char.asset.url}
                                alt={character.letter_name}
                                className="w-3/5 h-3/5 object-contain"
                                />
                            )}
                            <span className="text-[1.5vw] sm:text-sm mt-1 text-center">
                                {character.latin_char}
                            </span>
                            </div>
                            <div className="face back" style={{ backgroundColor: character.char_color || "#f5f5f5" }}>
                                {character.modern_char?.asset?.url && (
                                    <Image
                                    src={character.modern_char.asset.url}
                                    alt={character.letter_name}
                                    className="w-3/5 h-3/5 object-contain"
                                    />
                                )}
                            </div>
                            <div className="face left" style={{ backgroundColor: character.char_color || "#f5f5f5" }}>
                                {character.modern_char?.asset?.url && (
                                    <Image
                                    src={character.modern_char.asset.url}
                                    alt={character.letter_name}
                                    className="w-3/5 h-3/5 object-contain"
                                    />
                                )}
                            </div>
                            <div className="face right" style={{ backgroundColor: character.char_color || "#f5f5f5" }}>
                                {character.modern_char?.asset?.url && (
                                    <Image
                                    src={character.modern_char.asset.url}
                                    alt={character.letter_name}
                                    className="w-3/5 h-3/5 object-contain"
                                    />
                                )}
                            </div>
                            <div className="face top" style={{ backgroundColor: character.char_color || "#f5f5f5" }}>
                                {character.modern_char?.asset?.url && (
                                    <Image
                                    src={character.modern_char.asset.url}
                                    alt={character.letter_name}
                                    className="w-3/5 h-3/5 object-contain"
                                    />
                                )}
                            </div>
                            <div className="face bottom" style={{ backgroundColor: character.char_color || "#f5f5f5" }}>
                                {character.modern_char?.asset?.url && (
                                    <Image
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
    );
  }