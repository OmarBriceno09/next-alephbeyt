/* This component is responsible for rendering the Modal that displays the letter information and description. It will have illustrations for backgrounds
in the future. It is invoked only by LetterCube.tsx whenever a user clicks on the cube, and it closes when the user clicks on the X */

//For future optimizing. There will only ever be one modal open at a time, so why don't I use one modal, hide it when closed, and when opened again, change the information?

import React from "react";
import { useEffect, useRef, useState } from 'react';
import gsap from "gsap";
import { Script } from "@/types/Script";
import Carousel from "./Carousel";
import { PortableText } from '@portabletext/react';
import { LettersSharedRow, ModalDimensions, LetterDisplay, createEmptyLetterDisplay} from '@/types/MetaTypes';


interface ModalProps {
  scripts: Script [],
  selectedScriptIndex: number,
  letterIndex: number,
  shareddata: LettersSharedRow[],
  isSelected: boolean,
  modalDimensions: ModalDimensions,
  onClose: () => void;
}

export default function LetterModal({ 
  scripts, 
  selectedScriptIndex,
  letterIndex, 
  shareddata,
  isSelected,
  modalDimensions,
  onClose 
}: ModalProps) {
  const expandedFaceRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [letterDisplayList, setLetterDisplayList] = useState<LetterDisplay[]>([]);

  //console.log("hello?: "(modalDimensions));
  const openExpanAnim = () => {
      if (expandedFaceRef.current) {
          const tl = gsap.timeline();
          tl.to(
              expandedFaceRef.current,
              {
                  width: modalDimensions.end_width,
                  height: modalDimensions.start_height,
                  x: modalDimensions.end_center[0],
                  duration: 0.5,
                  ease: "power2.out",
              }
          ).to(
              expandedFaceRef.current,
              {
                  height: modalDimensions.end_height,
                  y:modalDimensions.end_center[1],
                  duration: 0.25,
                  ease: "power2.out",
                  onComplete: () =>  {
                      setIsOpen(true);
                  }
              }
          );
      }
  };

  const reScaleExpan = () => {
    //console.log(modalDimensions);
    if (expandedFaceRef.current) {
        gsap.set(
            expandedFaceRef.current,
            {
                width: modalDimensions.end_width,
                height: modalDimensions.end_height,
                x: modalDimensions.end_center[0],
                y: modalDimensions.end_center[1],
                ease: "power2.out",

            }
        );
    }
  };

  const closeExpandAnim = () => {
      if(expandedFaceRef.current) {
          const tl = gsap.timeline();
          tl.to(
              expandedFaceRef.current,
              {
                  height: modalDimensions.start_height,
                  y: modalDimensions.start_center[1],
                  duration: 0.25,
                  ease: "power2.out",
                  onComplete: () =>  {
                      onClose();
                  }
              }
          ).to(
              expandedFaceRef.current,
              {
                  width: modalDimensions.start_width,
                  x: modalDimensions.start_center[0],
                  duration: 0.5,
                  ease: "power2.out",
              }
          );
      } else {
          onClose();
      }
  };

  useEffect(() => {
      if(isSelected){
          if (!isOpen){
              makeLetterIllustrationList();
              openExpanAnim(); 
          } else {
              reScaleExpan();
          }
      }

  },[isSelected, modalDimensions]);


  const makeLetterIllustrationList = () =>{
    if(letterDisplayList.length === 0){
      const letterList: React.SetStateAction<LetterDisplay[]> = [];
      scripts.forEach(sp => {
        //console.log("letter: ", sp.letters?.[letterIndex].display, "; script: ", sp.title);
        const newletter = createEmptyLetterDisplay();

        if(sp.letters?.[letterIndex].display_image){
            newletter.display = sp.letters?.[letterIndex].display_image.asset?.url;
            newletter.font = "url";
        } else {
            newletter.display = sp.letters?.[letterIndex].display;
            newletter.font = sp.font;
        }
        letterList.push(newletter);
      });
      setLetterDisplayList(letterList);
    } else {
      console.log("list exists");
    }
  }

  const letterBoxDisplay = (letterDisplay: LetterDisplay, scaletype: string) => {
    if (!letterDisplay) return;
    if ( letterDisplay.font === 'url'){
      return(
      <h1 className="img-glyph-container">
        <img
          src={letterDisplay.display}
          alt="letter-img"
          className = {`image-${scaletype} object-contain select-none`}
        />
      </h1>);
    } else {
      return(
        <h1 className="text-glyph-container">
          <span
              className= {`inline-block select-none leading-none text-${scaletype}`}
              style={{ fontFamily: `${letterDisplay.font}, sans-serif` }}
          >
              {letterDisplay.display}
          </span>
      </h1>
      );
    }
  }



  const ModalContentDisplay = () => {
      const script = scripts[selectedScriptIndex]
      const letter = script.letters?.[letterIndex]; //finds letter here

      console.log(letter.transliteration);
      //console.log(letterDisplayList[selectedScriptIndex]);
      return(
          <div 
            className="relative"
          >
            
            <div className="flex flex-row w-full">
              {/*Letter Left Display*/}
              <div
                style={{ width: modalDimensions.start_width, height: modalDimensions.start_height }}
                className="flex items-center justify-center shrink-0"
              >
                {letterBoxDisplay(letterDisplayList[selectedScriptIndex], "die-scale")}
              </div>
              {/*Carousel*/}
              <div 
                className="flex items-center overflow-hidden"
              >
                {<Carousel
                    letterDisplayList={letterDisplayList}
                    modalDimensions = {modalDimensions}
                />}
              </div>
              
            </div>

            <div className="h-64 mx-20 bg-white/30 overflow-y-auto pointer-events-auto drop-shadow-lg/25">
              {letter?.exp_summary && (
                  <div 
                    className="text-gray-700"// border border-gray-300"
                  >
                      <PortableText value={letter.exp_summary} />
                  </div>
              )}
            </div>

          </div>
      );
  };

  return (
    <div className = "lettermodal">
      {isSelected && (
        <div
        ref={expandedFaceRef}
        className="absolute justify-center bg-emerald-100 z-[30] overflow-hidden"
        style={{ 
            width: modalDimensions.start_width, 
            height: modalDimensions.start_height, 
            pointerEvents: 'none', 
            backgroundColor: shareddata[letterIndex].key_color || "#f5f5f5" }}
        >

            <button
            onClick={(e) => {
                e.stopPropagation();
                closeExpandAnim();
                setIsOpen(false);
            }}
            className="absolute bottom-1 right-1 z-[50] pointer-events-auto text-black px-1">
            ✕
            </button>
            {ModalContentDisplay()}
        </div>
      )}
    </div>
  );
}