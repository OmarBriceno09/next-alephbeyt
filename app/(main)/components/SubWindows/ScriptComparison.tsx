import { Script } from "@/types/Script";
import { useState } from "react";

import { createEmptyLetterDisplay} from '@/types/MetaTypes';
import { renderLetterBoxDisplay } from "../MapTreeContainer/DiceGrid/LetterModal/CarouselBox";

interface ScriptComparisonProps {
    scripts:Script[],
}

export default function ScriptComparison({
    scripts,
}:ScriptComparisonProps){
    const [selScripts, setSelScripts] = useState<number[]>([0,1]); //index = row-index; value = script-index

    const handleScriptSel = (target:number, newScriptIndex: number) => {
        //console.log("selected: "+scripts[newScriptIndex].title);
        const newSelScripts = [...selScripts];
        newSelScripts[target] = newScriptIndex;
        setSelScripts(newSelScripts);
    }

    const handleAddRow = () => {
        const newSelScripts = [...selScripts];
        newSelScripts.push(selScripts.length);
        setSelScripts(newSelScripts);
    }

    const handleRemoveRow = () => {
        const newSelScripts = [...selScripts];
        newSelScripts.pop();
        setSelScripts(newSelScripts);
    }

    const scriptSelectorRow = (selScriptIndex: number) => {
        const scriptIndex  = selScripts[selScriptIndex];
        
        return(
            <div key={`csindex-${selScriptIndex}`} className="flex items-center gap-2">
                <div>
                    <h2 className="w-5 text-center">{selScriptIndex+": "}</h2>
                </div>
                <div>
                    <select
                        onChange={(e)=>handleScriptSel(selScriptIndex, e.target.selectedIndex)}
                        value={scripts[scriptIndex]?.title || ''}
                        className="p-1 border rounded mb-0"
                        style={{
                            height:"min-content",
                        }}
                    >
                        {scripts.map((script, idx) => (
                            <option key={idx} value={script.title}>
                                {script.title}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/*not sure how to fix this ://// */}
                {/*<div 
                    className=""
                    style={{
                        //backgroundColor: "#ccc"
                    }}
                >
                    <hr className="border-gray-300 my-4" />
                </div>*/}
                
                <div>
                    {scriptLettersDisplay(scriptIndex)}
                </div>
            </div>
        );
    }

    const scriptLettersDisplay = (scriptIndex: number) => {
        const scriptLetters = (!scripts[scriptIndex]) ? [] : scripts[scriptIndex].letters;

        return(
        <div 
            className="flex flex-row items-center scroll-smooth"
        >
            {scriptLetters.map((letter, idx) => {
                const newLetterEntry = createEmptyLetterDisplay();
            
                if(letter.display_image){
                    newLetterEntry.display = letter.display_image.asset?.url;
                    newLetterEntry.font = "url";
                } else {
                    newLetterEntry.display = letter.display;
                    newLetterEntry.font = scripts[scriptIndex].font;
                }
                return(
                    <div
                        key={`displetter-${idx}`}
                        className="flex items-center justify-center shrink-0 gap-4"// border border-gray-300"
                    >
                        {renderLetterBoxDisplay(newLetterEntry, "compscript-scale", "m-4")}
                    </div>
                );
            })}
        </div>
        );
    }
    //text-white p-3 rounded-lg shadow-lg

    return(
        <div 
            className= "relative w-full overflow-auto bg-white"
            style={{
                height:"100%",
                border:"1px solid #ddd",
            }}
        >
            <div className="flex flex-col">
                {Array.from({length: selScripts.length}, (_, i) => {
                    return(scriptSelectorRow(i));
                })}
                <div className="h-10"></div>
            </div>

            <div 
                className="sticky bottom-5 left-0 right-0 flex justify-center gap-2"
            >
                <button 
                    className="bg-gray-400 text-white p-2 rounded-lg shadow-lg hover:bg-gray-500 disabled:bg-gray-600 disabled:text-gray-500"
                    onClick={()=>{handleAddRow()}}
                    disabled={selScripts.length>=scripts.length}
                >
                    (+) add row
                </button>
                <button 
                    className="bg-gray-400 text-white p-2 rounded-lg shadow-lg hover:bg-gray-500 disabled:bg-gray-600 disabled:text-gray-500"
                    onClick={()=>{handleRemoveRow()}}
                    disabled={selScripts.length<=0}
                >
                    (-) remove last
                </button>
                <button 
                    className="bg-gray-400 text-white p-2 rounded-lg shadow-lg hover:bg-gray-500 disabled:bg-gray-600 disabled:text-gray-500"
                    onClick={()=>{setSelScripts([])}}
                    disabled={selScripts.length<=0}
                >
                    clear all
                </button>
            </div>

        </div>
    );
}