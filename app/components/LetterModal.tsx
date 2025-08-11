/* This component is responsible for rendering the Modal that displays the letter information and description. It will have illustrations for backgrounds
in the future. It is invoked only by LetterCube.tsx whenever a user clicks on the cube, and it closes when the user clicks on the X */

//For future optimizing. There will only ever be one modal open at a time, so why don't I use one modal, hide it when closed, and when opened again, change the information?
import React from "react";
import Color from 'color';
import { useEffect, useRef, useState } from 'react';
import gsap from "gsap";
import { Script } from "@/types/Script";
import Carousel from "./Carousel";
import ModalBlockSnippet from "./ModalBlockSnippet"
import { LettersSharedRow, ModalDimensions, LetterDisplay, createEmptyLetterDisplay} from '@/types/MetaTypes';
import { PortableTextBlock } from "next-sanity";
import LetterBoxSwapDisplay from "./LetterBoxSwapDisplay";

interface ModalProps {
  scripts: Script [],
  selectedScriptIndex: number,
  letterIndex: number,
  shareddata: LettersSharedRow[],
  isSelected: boolean,
  modalDimensions: ModalDimensions,
  onClose: () => void;
  scriptChange: (newScriptIndex: number) => void;
}

export default function LetterModal({ 
  scripts, 
  selectedScriptIndex,
  letterIndex, 
  shareddata,
  isSelected,
  modalDimensions,
  onClose,
  scriptChange
}: ModalProps) {
  const expandedFaceRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [letterDisplayList, setLetterDisplayList] = useState<LetterDisplay[]>([]);
  const [satColor, setSatColor] = useState<string>("");
  const [litColor, setLitColor] = useState<string>("");
  const [darkColor, setDarkColor] = useState<string>("");


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
            declareIllustrations();
            openExpanAnim(); 
          } else {
            reScaleExpan();
          }
      }

  },[isSelected, modalDimensions]);


  //This function will generate the display lists and the colors. it will only do this once when its open
  const declareIllustrations = () =>{
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
      setSatColor(Color(shareddata[letterIndex].key_color).hsl().saturationl(80).lightness(40).rgb().string());
      setLitColor(Color(shareddata[letterIndex].key_color).hsl().saturationl(85).lightness(85).rgb().string());
      setDarkColor(Color(shareddata[letterIndex].key_color).hsl().saturationl(80).lightness(20).rgb().string());
    } else {
      console.log("list exists");
    }
  }

  const ModalHeader = () => {
    const script = scripts[selectedScriptIndex]
    const letter = script.letters?.[letterIndex];

    return(
        <div 
          className="ModalHeader relative"
        >
          
          <div className="flex flex-row w-full">
            {/*Letter Left Display*/}
            <LetterBoxSwapDisplay
              letterDisplayList={letterDisplayList}
              scriptIndex={selectedScriptIndex}
              SWAPTIME={0.5}
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
              {letter.letter_name.toUpperCase()}
            </h1>
          </div>
        </div>
    );
  };

  //Has all Letter info
  const ModalBody = () => {
    const script = scripts[selectedScriptIndex]
    const letter = script.letters?.[letterIndex]; //finds letter here
    return(
      <div className="ModalBody h-full overflow-y-auto pointer-events-auto">
        <div 
          className="flex flex-col items-end space-y-5 justify-start"
          style={{
            paddingInline: modalDimensions.start_width*0.3,
            paddingBlock: modalDimensions.start_width*0.1
          }}
        >
          {letter?.stats && (
            <ModalBlockSnippet
              title={"Basic Stats"}
              saturatedColor={satColor}
              lightenedColor={litColor}
              darkenedColor={darkColor}
              startOpen={true}
              information={letter.stats}
              modalDimensions={modalDimensions}

            />
          )}
          {letter?.ftu_torah && (
            <ModalBlockSnippet
              title={"First Time Used in Torah"}
              saturatedColor={satColor}
              lightenedColor={litColor}
              darkenedColor={darkColor}
              information={letter.ftu_torah as PortableTextBlock[]}
              modalDimensions={modalDimensions}
            />
          )}
          {letter?.ftu_word && (
            <ModalBlockSnippet
              title={"First Time Used at the Beginning of a Word"}
              saturatedColor={satColor}
              lightenedColor={litColor}
              darkenedColor={darkColor}
              information={letter.ftu_word as PortableTextBlock[]}
              modalDimensions={modalDimensions}
            />
          )}
          {letter?.definition && (
            <ModalBlockSnippet
              title={"Definition"}
              saturatedColor={satColor}
              lightenedColor={litColor}
              darkenedColor={darkColor}
              information={letter.definition as PortableTextBlock[]}
              modalDimensions={modalDimensions}
            />
          )}
          {letter?.sym_associations && (
            <ModalBlockSnippet
              title={"Symbolic Associations"}
              saturatedColor={satColor}
              lightenedColor={litColor}
              darkenedColor={darkColor}
              information={letter.sym_associations as PortableTextBlock[]}
              modalDimensions={modalDimensions}
            />
          )}
          {letter?.psalms119 && (
            <ModalBlockSnippet
              title={"Psalms 119"}
              saturatedColor={satColor}
              lightenedColor={litColor}
              darkenedColor={darkColor}
              information={letter.psalms119 as PortableTextBlock[]}
              modalDimensions={modalDimensions}
            />
          )}
          {letter?.exp_summary && (
            <ModalBlockSnippet
              title={"General Summary"}
              saturatedColor={satColor}
              lightenedColor={litColor}
              darkenedColor={darkColor}
              information={letter.exp_summary as PortableTextBlock[]}
              modalDimensions={modalDimensions}

            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className = "lettermodal">
      {isSelected && (
        <div
        ref={expandedFaceRef}
        className="absolute flex flex-col justify-between bg-emerald-100 z-[30] pointer-events-auto overflow-hidden"
        style={{ 
            width: modalDimensions.start_width, 
            height: modalDimensions.start_height, 
            pointerEvents: 'none', 
            backgroundColor: shareddata[letterIndex].key_color || "#f5f5f5" }}
        >
          {ModalHeader()}
          
          {ModalBody()}

          <div className="shrink-0 flex justify-end p-4">
            <button
            onClick={(e) => {
                e.stopPropagation();
                closeExpandAnim();
                setIsOpen(false);
            }}
            className="absolute bottom-1 right-1 z-[50] pointer-events-auto text-black px-1">
            ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
