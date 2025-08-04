import React from "react";
import { useEffect, useRef, useState } from 'react';
import gsap from "gsap";
import { PortableText, PortableTextBlock, PortableTextComponents} from '@portabletext/react';
import {ModalDimensions, hexToHsl} from '@/types/MetaTypes';
import { LetterStats } from "@/types/LetterStats";

const MAXHEIGHT = 360;// 'h-90' in Tailwind = 360px


interface ModalBlockSnippet {
  title: string,
  color: string,
  startOpen?: boolean,
  information: PortableTextBlock | LetterStats,
  modalDimensions: ModalDimensions,
}

function isLetterStats(data:any): data is LetterStats {
  return typeof data === 'object' && 'letter_name' in data && 'name_pronounced' in data;
}

export default function LetterModal({ 
    title, 
    color,
    startOpen=false,
    information,
    modalDimensions
  }: ModalBlockSnippet) {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentWrapperRef = useRef<HTMLDivElement>(null);
    const contentInnerRef = useRef<HTMLDivElement>(null);

    //Components for the portable text block
    const components: PortableTextComponents = {
      types: {
        image: ({ value }) => (
          <img
            src={value.asset.url}
            alt={value.alt || ''}
            className="my-4 rounded-lg"
          />
        ),
      },
      block: {
        h1: ({ children }) => <h1 className="text-3xl font-bold my-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl font-semibold my-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-medium my-2">{children}</h3>,
        normal: ({ children }) => <p className="text-base my-2">{children}</p>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 pl-4 italic my-2">{children}</blockquote>
        ),
      },
      list: {
        bullet: ({ children }) => <ul className="list-disc ml-6">{children}</ul>,
        number: ({ children }) => <ol className="list-decimal ml-6">{children}</ol>,
      },
      listItem: {
        bullet: ({ children }) => <li className="mb-1">{children}</li>,
        number: ({ children }) => <li className="mb-1">{children}</li>,
      },
      marks: {
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        underline: ({ children }) => <span className="underline">{children}</span>,
        link: ({ value, children }) => (
          <a
            href={value.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {children}
          </a>
        ),
      },
    };

    const toggleExpand = () => {
      if (!contentWrapperRef.current || !contentInnerRef.current) return;
  
      const wrapper = contentWrapperRef.current;
      const inner = contentInnerRef.current;
      const fullHeight = inner.scrollHeight+40;
  
      const targetHeight = isExpanded
        ? 0
        : fullHeight > MAXHEIGHT
        ? MAXHEIGHT
        : fullHeight;
  
      gsap.to(wrapper, {
        height: targetHeight,
        duration: 0.4,
        ease: 'power2.inOut',
      });
  
      setIsExpanded(!isExpanded);
    };

    const saturated = hexToHsl(color, 80, 50);
    const lightened = hexToHsl(color, 85, 85);

    useEffect(() => {
      if(startOpen){
        toggleExpand();
      }
    }, [startOpen]);
    
    return(
      <div 
        className="PortableTextBlockSnippet items-end drop-shadow-lg/25"
        style={{ backgroundColor: lightened }}
      >
        {/*Title Area*/}
        <div 
          className="h-12 flex items-center mx-4"
          onClick={() => {toggleExpand()}}
        >
            <h1 
              className="text-2xl select-none"
              style={{ color: saturated }}
            >
              {title}
            </h1>
        </div>
        <div 
            ref={contentWrapperRef}
            className="h-0 overflow-y-auto"
            style={{
              width: modalDimensions.end_width*0.6, 
              //height: modalDimensions.start_height*0.5
            }}
            >
                {isLetterStats(information) ? (
                  <div ref={contentInnerRef} className="mx-5 text-gray-700">
                    <p><strong>Name Pronounced:</strong> {information.name_pronounced}</p>
                    <p><strong>Letter Pronounced:</strong> {information.letter_pronounced}</p>
                    <p><strong>Transliterated as:</strong> {information.transliteration}</p>
                    <p className="flex gap-1">
                      <strong>Sounds like:</strong> 
                      <PortableText 
                        value={information.sounds_like_text}
                        components={{
                          block: ({ children }) => <>{children}</>, // render block content inline
                        }}
                      />
                      <button onClick={() => new Audio(information.sounds_like_audio.asset?.url).play()}>
                        🔊
                      </button>
                    </p>
                    <p><strong>Numerical Value:</strong> {information.num_val}</p>
                    <p><strong>Variants:</strong> {information.variants}</p>
                    <p><strong>Classification:</strong> {information.classification}</p>
                    <p><strong>Nove Value:</strong> {information.note_val}</p>
                    <p><strong>Chord:</strong> {information.chord}</p>
                  </div>
                ):(
                  <div ref={contentInnerRef} className="m-5 text-gray-700">
                    <PortableText value={information} components={components}/>
                  </div>
                )}
        </div>
      </div>
    );
  }