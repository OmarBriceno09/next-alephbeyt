import React from "react";
import { Letter } from "@/types/Letter";
import { PortableText } from '@portabletext/react';

interface Props {
  letter: Letter | null;
  onClose: () => void;
}

export default function LetterModal({ letter, onClose }: Props) {
  if (!letter) return null;

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

        <h2 className="text-2xl font-bold mb-4">{letter.letter_name}</h2>

        {letter.display && (
          <span>
            {letter.display}
          </span>
        )}

        {letter.exp_summary && (
            <div className="text-gray-700">
                <PortableText value={letter.exp_summary} />
            </div>
        )}
      </div>
    </div>
  );
}