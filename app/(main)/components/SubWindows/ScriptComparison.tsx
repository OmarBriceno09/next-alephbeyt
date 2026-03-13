import { Script } from "@/types/Script";

type ScriptComparisonProps = {
    scripts:Script[],
}

export default function ScriptComparison({
    scripts,
}:ScriptComparisonProps){


    return(
        <div>
            {scripts.map((script, i) => {
                return(<h2 key={'script-title-'+i}>{script.title}</h2>);
            })}
        </div>
    );
}