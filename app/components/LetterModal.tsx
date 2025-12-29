/* This component is responsible for rendering the Modal that displays the letter information and description. It will have illustrations for backgrounds
in the future. It is invoked only by LetterCube.tsx whenever a user clicks on the cube, and it closes when the user clicks on the X */

//For future optimizing. There will only ever be one modal open at a time, so why don't I use one modal, hide it when closed, and when opened again, change the information?
import React, { forwardRef, useImperativeHandle } from "react";
import Color from 'color';
import { useRef, useState } from 'react';
import gsap from "gsap";
import { Script } from "@/types/Script";
import Carousel from "./Carousel";
import { ModalDimensions, LetterDisplay, createEmptyLetterDisplay} from '@/types/MetaTypes';
import LetterBoxSwapDisplay from "./LetterBoxSwapDisplay";
import ModalBlockList from "./ModalBlockList";

interface ModalProps {
  scripts: Script [],
  selectedScriptIndex: number,
  modalDimensions: React.RefObject<ModalDimensions>,
  onClose: () => void;
  scriptChange: (newScriptIndex: number) => void;
}

export type LetterModalHandle = {
  openExpanAnim: () => Promise<void>;
  closeExpandAnim: () => Promise<void>;
  declareLetterMeta: (newIndex:number) => Promise<void>;

};

const LetterModal = forwardRef<LetterModalHandle, ModalProps>(
  (
    {
      scripts, 
      selectedScriptIndex,
      modalDimensions,
      onClose,
      scriptChange
    },
    ref
  ) => {

  const modalRef = useRef<HTMLDivElement> (null);

  const expandedFaceRef = useRef<HTMLDivElement>(null);
  const [letterDisplayList, setLetterDisplayList] = useState<LetterDisplay[]>([]);
  const [letterIndex, setLetterIndex] = useState<number>(-1);
  const [satColor, setSatColor] = useState<string>("");
  const [litColor, setLitColor] = useState<string>("");
  const [darkColor, setDarkColor] = useState<string>("");

  const [letterName, setLetterName] = useState<string>("");
  const [letterColor, setLetterColor] = useState<string>("#f5f5f5");


  const openExpanAnim = (): Promise<void> => {
    return new Promise((resolve=> {
      gsap.timeline().set(
        expandedFaceRef.current,
          {
              width: modalDimensions.current.start_width,
              height: modalDimensions.current.start_height,
              x: modalDimensions.current.start_pos[0],
              y: modalDimensions.current.start_pos[1]
          }
      ).to(
          expandedFaceRef.current,
          {
              width: modalDimensions.current.end_width,
              height: modalDimensions.current.start_height,
              x: modalDimensions.current.end_pos[0],// + modalDimensions.current.start_width,
              duration: 0.5,
              ease: "power2.out",
          }
      ).to(
          expandedFaceRef.current,
          {
              height: modalDimensions.current.end_height,
              y:modalDimensions.current.end_pos[1],
              duration: 0.25,
              ease: "power2.out",
              onComplete: () =>  {
                  resolve();
              }
          }
      );
    }))
  };


  const reScaleExpan = () => {
    if (expandedFaceRef.current) {
        gsap.set(
            expandedFaceRef.current,
            {
                width: modalDimensions.current.end_width,
                height: modalDimensions.current.end_height,
                x: modalDimensions.current.end_pos[0],
                y: modalDimensions.current.end_pos[1],
                ease: "power2.out",

            }
        );
    }
  };


  const closeExpandAnim = (): Promise<void> => {
    return new Promise((resolve=> {
      gsap.timeline().to(
        expandedFaceRef.current,
        {
          height: modalDimensions.current.start_height,
          y: modalDimensions.current.start_pos[1],
          duration: 0.25,
          ease: "power2.out",
          onComplete: () =>  {
            onClose();
          }
        }
      ).to(
        expandedFaceRef.current,
        {
          width: modalDimensions.current.start_width,
          x: modalDimensions.current.start_pos[0],
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            resolve();
            setLetterIndex(-1); //Setting Letter Index back to -1
          }
        }
      );
    }))
  };


  //This function will declare all the illustrations and images right before isOpen is activated
  const declareLetterMeta = async (newIndex: number) =>{
    const letterList: React.SetStateAction<LetterDisplay[]> = [];
    scripts.forEach(sp => {
      const newLetterEntry = createEmptyLetterDisplay();

      if(sp.letters?.[newIndex].display_image){
          newLetterEntry.display = sp.letters?.[newIndex].display_image.asset?.url;
          newLetterEntry.font = "url";
      } else {
          newLetterEntry.display = sp.letters?.[newIndex].display;
          newLetterEntry.font = sp.font;
      }
      letterList.push(newLetterEntry);
    });
    setLetterDisplayList(letterList);

    //Setting Letter color and names
    const script = scripts[selectedScriptIndex];
    const newLetter = script?.letters?.[newIndex] || null;

    setLetterColor(newLetter.letter_color);
    setLetterName(newLetter.letter_name);
  
    setSatColor(Color(newLetter.letter_color).hsl().saturationl(80).lightness(40).rgb().string());
    setLitColor(Color(newLetter.letter_color).hsl().saturationl(85).lightness(85).rgb().string());
    setDarkColor(Color(newLetter.letter_color).hsl().saturationl(80).lightness(20).rgb().string());

    setLetterIndex(newIndex);
  }


  useImperativeHandle(ref, () => ({
    openExpanAnim,
    closeExpandAnim,
    declareLetterMeta
  }));


  const ModalHeader = () => {
    return(
        <div 
          className="ModalHeader relative"
        >
          
          <div className="flex flex-row w-full">
            {/*Letter Left Display*/}
            <LetterBoxSwapDisplay
              letterDisplayList={letterDisplayList}
              scriptIndex={selectedScriptIndex}
              SWAPTIME={0.25}
              modalDimensions={modalDimensions}
            />
            {/*Carousel*/}
            <div 
              className="flex items-center overflow-hidden"
            >
              {<Carousel
                  selectedScriptIndex={selectedScriptIndex}
                  letterDisplayList={letterDisplayList}
                  modalDimensions = {modalDimensions}
                  scriptChange = {scriptChange}
              />}
            </div>
          </div>
          {/*Letter Name*/}
          <div className="absolute left-10 my-2">
            <h1 
              className="text-6xl select-none"
              style={{ 
                color: satColor,
                letterSpacing: "5px"
              }}
            >
              {letterName.toUpperCase()}
            </h1>
          </div>
        </div>
    );
  };

  //Okay so I think the ModalBlockSnippets need to be encapsulated by a class that is responsible for swapping the cubes to
  //have the effect simillar to the Letter Box Swap Display. This will be extremely useful in cases where one script of a letter
  //has a BlockSnippet for Basic Stats, but the next script over has no BasicStats, meaning the transition has to lead to a blank
  const ModalBody = () => {
    return(
      <div className="ModalBody h-full">
          <ModalBlockList
            scriptList={scripts}
            scriptIndex={selectedScriptIndex}
            letterIndex={letterIndex}
            SWAPTIME={0.25}
            modalDimensions={modalDimensions}
            satColor={satColor}
            litColor={litColor}
            darkColor={darkColor}
          />
      </div>
    );
  }


  return (
    <div 
      ref = {modalRef}
      className = "lettermodal"
    >
      <div
        ref={expandedFaceRef}
        className="absolute flex flex-col justify-between bg-emerald-100 z-[30] pointer-events-auto overflow-hidden"
        style={{ 
            opacity: letterIndex > -1 ? 1 : 0,
            pointerEvents: 'none', 
            backgroundColor: letterColor || "#f5f5f5"
          }}
      >
        {ModalHeader()}
        
        {ModalBody()}

        <div className="shrink-0 flex justify-end p-4">
          <button
          onClick={(e) => {
              e.stopPropagation();
              closeExpandAnim();
          }}
          className="absolute bottom-1 right-1 z-[50] pointer-events-auto text-black px-1">
          ✕
          </button>
        </div>
      </div>
    </div>
  );
});

export default LetterModal;