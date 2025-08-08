import { useRef, useState } from "react";
import { ModalDimensions, LetterDisplay} from '@/types/MetaTypes';
import gsap from "gsap";
import CarouselBox from "./CarouselBox";

interface CarouselProps {
    selectedScriptIndex: number,
    letterDisplayList: LetterDisplay[]
    modalDimensions: ModalDimensions,
    scriptChange: (newScriptIndex: number) => void;
}

const SMALLUNITPROPORTION = 0.65; 

export default function Carousel({
    selectedScriptIndex,
    letterDisplayList,
    modalDimensions,
    scriptChange
}: CarouselProps){
    const [offset, setOffset] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollInterval = useRef<NodeJS.Timeout | null>(null);
    const [rightEnd, setRightEnd] = useState(false);
    const [leftEnd, setLeftEnd] = useState(false);
    
    const startScroll = (direction: "left" | "right") => {
        const tilesize = modalDimensions.start_width*SMALLUNITPROPORTION;
        const el = scrollRef.current;
        const windowWidth = (el?.clientWidth||1000);
        const maxScrollWidth = tilesize*(letterDisplayList.length+1/2);
        const maxScroll = -maxScrollWidth+windowWidth;
        const minScroll = tilesize/2;

        const scrollAmount = direction === "left" ? 3 : -3;
        if (scrollInterval.current) return;
        
        let count = offset;
        scrollInterval.current = setInterval(() => {scrollAmount
            count = Math.max(maxScroll, Math.min(minScroll, count+scrollAmount));

            //check if wall has reached left or right end
            if(count == maxScroll){
                setRightEnd(true);
            }else if(count == minScroll){
                setLeftEnd(true);
            }else{
                setRightEnd(false);
                setLeftEnd(false);
            }

            gsap.set(el, {
                x: count,
            })
            setOffset(count);
        }, 1);
    };

    const stopScroll = () => {
        if (scrollInterval.current) {
          clearInterval(scrollInterval.current);
          scrollInterval.current = null;
        }
    };

    const rightStyle = (rightEnd) ? "" : "bg-red-400/50 hover:bg-red-700/50";
    return (
        <div 
            className="relative overflow-hidden bg-gray-500/20"
            style={{margin: modalDimensions.start_width*SMALLUNITPROPORTION*0.25}}
            
        >
            <div 
                className="relative overflow-hidden"// bg-gray-500/20"
                /*style={{
                    maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
                    maskRepeat: 'no-repeat',
                    maskSize: '100% 100%', 
                }}*/
            >
                {/* Left Hot Zone */}
                <div
                onMouseEnter={() => startScroll('left')}
                onMouseLeave={stopScroll}
                className="absolute left-0 top-0 h-full pointer-events-auto z-90 bg-black/25"// bg-green-400/50 hover:bg-green-700/50"
                style={{
                    maskImage: leftEnd 
                      ? 'linear-gradient(to right, transparent, transparent)'
                      : 'linear-gradient(to right, black, transparent)',
                    maskRepeat: 'no-repeat',
                    maskSize: '100% 100%',
                    width: modalDimensions.start_width * SMALLUNITPROPORTION * 0.5
                  }}
                />

                {/* Right Hot Zone */}
                <div
                onMouseEnter={() => startScroll('right')}
                onMouseLeave={stopScroll}
                className="absolute right-0 top-0 h-full pointer-events-auto z-90 bg-black/25"// bg-red-400/50 hover:bg-red-700/50"
                style={{
                    maskImage: rightEnd 
                      ? 'linear-gradient(to left, transparent, transparent)'
                      : 'linear-gradient(to left, black, transparent)',
                    maskRepeat: 'no-repeat',
                    maskSize: '100% 100%',
                    width:modalDimensions.start_width*SMALLUNITPROPORTION*0.5
                }}
                />
                {/*Carousel*/}
                <div
                    ref={scrollRef} 
                    className="flex flex-row items-center scroll-smooth pointer-events-auto"
                >
                    {letterDisplayList.map((item, index) => {
                        return (<CarouselBox
                            key={`CarouselBox-${index}`}
                            letterDisplay={item}
                            scaletype={"die-scale-small"}
                            index={index}
                            selectedIndex={selectedScriptIndex}
                            dimensions={{x: modalDimensions.start_width*SMALLUNITPROPORTION, y: modalDimensions.start_height*SMALLUNITPROPORTION}}
                            scriptChange = {scriptChange}
                        />);
                    })}

                </div>
            </div>
        </div>
    );
}