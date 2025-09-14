import { useEffect, useState } from "react";
import { ModalDimensions, LetterDisplay} from '@/types/MetaTypes';
import { motion, AnimatePresence } from "framer-motion";

interface LetterBoxSwapDisplayProps {
    letterDisplayList: LetterDisplay[],
    scriptIndex: number,
    SWAPTIME: number,
    modalDimensions: ModalDimensions,
  }

export default function LetterBoxSwapDisplay({
  letterDisplayList,
  scriptIndex,
  SWAPTIME,
  modalDimensions
}:LetterBoxSwapDisplayProps) {
  const[prevIndex, setPrevIndex] = useState<number|null>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  
  useEffect(() => {
    if (isFirstRender) {
      setPrevIndex(null); // no animation on first render
      setIsFirstRender(false);
    } else if (scriptIndex !== prevIndex) {
      setPrevIndex(scriptIndex);
    }
  }, [scriptIndex]);

  const letterBoxDisplay = (index:number) => {
    if (!letterDisplayList[index]) return;
    return(
      <div
        className="text-glyph-container"
      >
          {(letterDisplayList[index].font === 'url')? (
            <img
              src={letterDisplayList[index].display}
              alt="letter-img"
              className = "image-die-scale object-contain select-none"
            />
          ):(
            <span
            className= "inline-block select-none leading-none text-die-scale"
            style={{ fontFamily: `${letterDisplayList[index].font}, sans-serif` }}
            >
              {letterDisplayList[index].display}
            </span>
          )}
      </div>
    );
  }

  return(
    <div
      style={{ 
        width: modalDimensions.start_width, 
        height: modalDimensions.start_height,
        position: "relative",
      }}
      className="flex items-center justify-center shrink-0"
    >
       <AnimatePresence>
        <motion.div
          key={`curr-${scriptIndex}`}
          initial={{ y: isFirstRender ? 0 : "-100%", opacity: isFirstRender ? 1 : 0}}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: SWAPTIME, ease: "easeInOut" }}
          style={{ position: "absolute" }}
        >
          {letterBoxDisplay(scriptIndex)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

//Make the info boxes slide in and out when transitioning from script to
//Make little tab on top of that will show up when a character in the carousel is highlighted. It will display the script title and the respective time period 
//Remove note value and Chord
