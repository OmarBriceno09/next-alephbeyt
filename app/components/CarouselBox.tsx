import React from "react";
import { useState } from 'react';
import { LetterDisplay } from "@/types/MetaTypes";

interface CarouselBoxProps{
    letterDisplay: LetterDisplay, 
    scaletype: string,
    index: number,
    selectedIndex: number,
    dimensions: {x: number, y:number},
    scriptChange: (newScriptIndex: number) => void;
}

export default function CarouselBox({
    letterDisplay,
    scaletype,
    index,
    selectedIndex,
    dimensions,
    scriptChange
}: CarouselBoxProps){
    const [hovered, setHovered] = useState(false);
    

    const letterBoxDisplay = (
        letterDisplay: LetterDisplay, 
        scaletype: string,
        index: number,
        selectedIndex: number
    ) => {
        if (!letterDisplay) return;

        //If selected, fully scaled and shaded, else if hovered, partially, else least.
        const baseStyle = (index===selectedIndex) ? "scale-100 opacity-100" : (hovered) ? "scale-97 opacity-80" : "scale-90 opacity-50";

        if ( letterDisplay.font === 'url'){
          return(
            <h1 className={`img-glyph-container transition-all duration-100 ${baseStyle}`}>
            <img
              src={letterDisplay.display}
              alt="letter-img"
              className = {`image-${scaletype} object-contain select-none`}
            />
          </h1>);
        } else {
          return(
            <h1 className={`img-glyph-container transition-all duration-100 ${baseStyle}`}>
              <span
                  className= {`inline-block select-none leading-none text-${scaletype}`}
                  style={{ fontFamily: `${letterDisplay.font}, sans-serif` }}
              >
                  {letterDisplay.display}
              </span>
          </h1>
          );
        }
    };


    return(
        <div
            key={`displetter-${index}`}
            style={{ width: dimensions.x, height: dimensions.y}}
            className="flex items-center justify-center shrink-0 hover:cursor-pointer"// border border-gray-300"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => scriptChange(index)}
        >
            {letterBoxDisplay(letterDisplay, scaletype, index, selectedIndex)}
        </div>
    )

}