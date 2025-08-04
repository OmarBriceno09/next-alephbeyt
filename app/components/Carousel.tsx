import { useRef, useState } from "react";
import { ModalDimensions, LetterDisplay} from '@/types/MetaTypes';
import gsap from "gsap";

interface CarouselProps {
    letterDisplayList: LetterDisplay[]
    modalDimensions: ModalDimensions,
}

const SMALLUNITPROPORTION = 0.65; 

export default function Carousel({
    letterDisplayList,
    modalDimensions
}: CarouselProps){
    const [offset, setOffset] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollInterval = useRef<NodeJS.Timeout | null>(null);
    
    const startScroll = (direction: "left" | "right") => {
        const el = scrollRef.current;
        const windowWidth = (el?.clientWidth||1000);
        const maxWidth = modalDimensions.start_height*SMALLUNITPROPORTION*(letterDisplayList.length+2);

        const scrollAmount = direction === "left" ? 3 : -3;
        if (scrollInterval.current) return;
        
        let count = offset;
        scrollInterval.current = setInterval(() => {
            count = Math.max(-maxWidth+windowWidth, Math.min(0, count+scrollAmount));

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


    return (
        <div 
            className="relative overflow-hidden bg-gray-500/20"
            style={{margin: modalDimensions.start_width*SMALLUNITPROPORTION*0.25}}
            
        >
            <div 
                className="relative overflow-hidden"// bg-gray-500/20"
                style={{
                    maskImage: 'linear-gradient(to right, transparent 5%, black 15%, black 85%, transparent 95%)',
                    maskRepeat: 'no-repeat',
                    maskSize: '100% 100%', 
                }}
            >
                {/* Left Hot Zone */}
                <div
                onMouseEnter={() => startScroll('left')}
                onMouseLeave={stopScroll}
                className="absolute left-0 top-0 h-full w-20 pointer-events-auto z-90"// bg-green-400/50 hover:bg-green-700/50"
                />

                {/* Right Hot Zone */}
                <div
                onMouseEnter={() => startScroll('right')}
                onMouseLeave={stopScroll}
                className="absolute right-0 top-0 h-full w-20 pointer-events-auto z-90"// bg-red-400/50 hover:bg-red-700/50"
                />
                {/*Carousel*/}
                <div
                    ref={scrollRef} 
                    className="flex flex-row items-center scroll-smooth"
                >
                    <div
                        key='displetter-start'
                        style={{ width: modalDimensions.start_width*SMALLUNITPROPORTION, height: modalDimensions.start_height*SMALLUNITPROPORTION}}
                        className="flex items-center justify-center shrink-0"// border border-gray-300"
                    >
                        {letterBoxDisplay({display:'', font:''}, "die-scale-small")}
                    </div>
                    {letterDisplayList.map((item, index) => {
                        
                        return(
                        <div
                            key={`displetter-${index}`}
                            style={{ width: modalDimensions.start_width*SMALLUNITPROPORTION, height: modalDimensions.start_height*SMALLUNITPROPORTION}}
                            className="flex items-center justify-center shrink-0"// border border-gray-300"
                        >
                        {letterBoxDisplay(item, "die-scale-small")}
                    </div>
                    )})}

                    <div
                        key='displetter-end'
                        style={{ width: modalDimensions.start_width*SMALLUNITPROPORTION, height: modalDimensions.start_height*SMALLUNITPROPORTION}}
                        className="flex items-center justify-center shrink-0"// border border-gray-300"
                    >
                        {letterBoxDisplay({display:'', font:''}, "die-scale-small")}
                    </div>
                </div>
            </div>
        </div>
    );
}