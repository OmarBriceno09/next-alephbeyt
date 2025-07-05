import React from "react";
import { Character } from "@/types/Character";
import { PortableText } from '@portabletext/react';

interface Props {
  character: Character | null;
  onClose: () => void;
}

export default function CharacterModal({ character, onClose }: Props) {
  if (!character) return null;

  return (
    <div 
        style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
        className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="relative bg-white w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">{character.letter_name}</h2>

        {character.modern_char?.asset?.url && (
          <img
            src={character.modern_char.asset.url}
            alt={character.letter_name}
            className="w-32 h-32 mx-auto mb-4"
          />
        )}

        {character.extended_summary && (
            <div className="text-gray-700">
                <PortableText value={character.extended_summary} />
            </div>
        )}
      </div>
    </div>
  );
}