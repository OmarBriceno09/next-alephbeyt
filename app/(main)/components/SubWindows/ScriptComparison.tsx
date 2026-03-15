import { Script } from "@/types/Script";
import { useEffect, useState } from "react";

import { createEmptyLetterDisplay} from '@/types/MetaTypes';
import { renderLetterBoxDisplay } from "../DiceGrid/LetterModal/CarouselBox";

type ScriptComparisonProps = {
    scripts:Script[],
}

export default function ScriptComparison({
    scripts,
}:ScriptComparisonProps){
    const [selScripts, setSelScripts] = useState<{scriptA:number, scriptB: number}>({scriptA:-1,scriptB:-1});

    useEffect(() => {
        if(scripts.length > 1 && selScripts.scriptA < 0 ){
            setSelScripts({scriptA:0, scriptB:1});
        }
    }, [selScripts])

    const handleScriptSel = (target:number, newScriptIndex: number) => {
        //console.log("selected: "+scripts[newScriptIndex].title);
        const newSelScripts = {
            scriptA: (target==0) ? newScriptIndex : selScripts.scriptA,
            scriptB: (target==1) ? newScriptIndex : selScripts.scriptB,  
        };

        setSelScripts(newSelScripts);
    }

    const scriptSelectorMenu = (title:string, selScriptIndex: number, scriptIndex: number) => {
        return(
            <div>
                <h1>{title}</h1>
                <select
                    onChange={(e)=>handleScriptSel(selScriptIndex, e.target.selectedIndex)}
                    value={scripts[scriptIndex]?.title || ''}
                    className="p-1 border rounded mb-0"
                >
                    {scripts.map((script, idx) => (
                        <option key={idx} value={script.title}>
                            {script.title}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    const scriptLettersDisplay = (selScriptSelect: number) => {
        const scriptIndex = (selScriptSelect == 0) ? selScripts.scriptA : selScripts.scriptB;
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

    return(
        <div>
            {/*scripts.map((script, i) => {
                return(<h2 key={'script-title-'+i}>{script.title}</h2>);
            })*/}
            <div className="ScriptSelectors">
                {scriptSelectorMenu("Top Script", 0, selScripts.scriptA)}
                {scriptSelectorMenu("Bottom Script", 1, selScripts.scriptB)}
                <div className="overflow-x-auto">
                    {scriptLettersDisplay(0)}
                    {scriptLettersDisplay(1)}
                </div>
            </div>
        </div>
    );
}