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
import ModalBlockList, { ModalBlockListHandle } from "./ModalBlockList";
import { Letter } from "@/types/Letter";

interface ModalProps {
  scripts: Script [],
  modalDimensions: React.RefObject<ModalDimensions>,
  onClose: () => void;
  scriptChange: (newScriptIndex: number) => void;
}

export type LetterModalHandle = {
  openExpanAnim: () => Promise<void>;
  closeExpandAnim: () => Promise<void>;
  rescaleOpenModal: () => Promise<void>;
  scriptChangeUpdates: (newScriptIndex: number) => Promise<void>;
  declareLetterMeta: (newIndex:number) => Promise<void>;
};

const LetterModal = forwardRef<LetterModalHandle, ModalProps>(
  function LetterModal(
    {
      scripts,
      modalDimensions,
      onClose,
      scriptChange
    },
    ref
  ){

    const modalRef = useRef<HTMLDivElement> (null);

    const ModalBlockListRef = useRef<ModalBlockListHandle> (null);

    const expandedFaceRef = useRef<HTMLDivElement>(null);
    const [letterDisplayList, setLetterDisplayList] = useState<LetterDisplay[]>([]);
    const [selectedScriptIndex, setSelectedSciptIndex] = useState<number>(-1);
    const [letterIndex, setLetterIndex] = useState<number>(-1);

    const prevLetter = useRef<Letter | null> (null);

    const colorPalette = useRef<{sat:string, lit:string, dark:string}> ({sat:"", lit:"", dark:""});

    
    const openExpanAnim = async (): Promise<void> => {
      const newColor = prevLetter.current?.letter_color || "#f5f5f5";
      const newColorPalette = computePalette(newColor);
      colorPalette.current = newColorPalette;

      return new Promise((resolve=> {
        gsap.timeline().set(
          expandedFaceRef.current,
            {
              width: modalDimensions.current.start_width,
              height: modalDimensions.current.start_height,
              x: modalDimensions.current.start_pos[0],
              y: modalDimensions.current.start_pos[1]
            }
        ).set(
          expandedFaceRef.current,
            {
              css: {
                  "--color-default":newColor,
                  "--color-dark":colorPalette.current.dark
              },
              onComplete: () =>  {
                //console.log("change the block snippet color, opening");
                ModalBlockListRef.current?.updateBlockListColors(newColorPalette);
              }
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
      }));
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
      }));
    };


    const rescaleOpenModal = (): Promise<void> => {
      return new Promise((resolve=>{
        gsap.set(
          expandedFaceRef.current,
          {
            width: modalDimensions.current.end_width,
            height: modalDimensions.current.end_height,
            x: modalDimensions.current.end_pos[0],
            y: modalDimensions.current.end_pos[1],
            onComplete: () => {
              resolve();
            }
          }
        );
      }));

    };

    const translateOpenModal = (): Promise<void> => {
      return new Promise((resolve=>{
        gsap.to(
          expandedFaceRef.current,
          {
            x: modalDimensions.current.end_pos[0],
            y: modalDimensions.current.end_pos[1],
            duration: 0.5,//SWITCHROTTIME
            ease: "power2.out",
            onComplete: () => {
              resolve();
            }
          }
        );
      }));
    };



    const computePalette = (base: string) => {
      return {
        sat: Color(base).hsl().saturationl(80).lightness(40).rgb().string(),
        lit: Color(base).hsl().saturationl(85).lightness(85).rgb().string(),
        dark: Color(base).hsl().saturationl(80).lightness(20).rgb().string()
      };
    };


    const letterColorAnim = async (newColor: string, duration: number) => {
      const newColorPalette = computePalette(newColor);
      colorPalette.current = newColorPalette;

      gsap.to(expandedFaceRef.current, {
        duration: duration,
        ease: "power1.out",
        css: {
          "--color-default":newColor,
          "--color-dark": newColorPalette.dark
        },
        onComplete: () =>  {
          //console.log("change the block snippet color, switching");
          ModalBlockListRef.current?.updateBlockListColors(newColorPalette);
        }
      });
    }


    const scriptChangeUpdates = async (newScriptIndex: number) => {
        setSelectedSciptIndex(newScriptIndex);
        
        const script = scripts[newScriptIndex];
        const newLetter = script?.letters?.[letterIndex] || null;
        const newColor = newLetter?.letter_color || "#f5f5f5";
        console.log("newLetter!: ", newLetter);
        if(newLetter && expandedFaceRef.current &&(prevLetter.current?.letter_color != newColor)){
          letterColorAnim(newColor, 0.3);
        }
        translateOpenModal(); //this will update the position of the modal if changed

        prevLetter.current = newLetter;
    }
  

    //This function will declare all the illustrations and images right before isOpen is activated
    const declareLetterMeta = async (newIndex: number) =>{
      setLetterIndex(newIndex);
      
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

      prevLetter.current = newLetter;
      //Color will be handeled at openAnimExpand when the modal moves to the correct position
    }


    useImperativeHandle(ref, () => ({
      openExpanAnim,
      closeExpandAnim,
      rescaleOpenModal,
      scriptChangeUpdates,
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
                className="letter-title text-6xl select-none"
                style={{ 
                  //color: satColor,
                  letterSpacing: "5px"
                }}
              >
                {prevLetter.current?.letter_name.toUpperCase() || ""}
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
              ref={ModalBlockListRef}
              scriptList={scripts}
              scriptIndex={selectedScriptIndex}
              letterIndex={letterIndex}
              SWAPTIME={0.25}
              modalDimensions={modalDimensions}//Pass the colorPalette here instead of just the letterColor, or better yet use a function to update in block list
            />
        </div>
      );
    }


    return (
      <div 
        ref = {modalRef}
      >
        <div
          ref={expandedFaceRef}
          className="letter-modal absolute flex flex-col justify-between bg-emerald-100 z-[30] pointer-events-auto overflow-hidden"
          style={{ 
              opacity: letterIndex > -1 ? 1 : 0,
              pointerEvents: 'none', 
              //backgroundColor: letterColor || "#f5f5f5"
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
  }
);

export default LetterModal;