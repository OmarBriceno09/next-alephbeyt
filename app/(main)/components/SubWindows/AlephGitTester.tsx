import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";


function convertToMarkdownTable(text: string): string {
    const lines = text.split("\n");

    const tableStartIndex = lines.findIndex(line =>
        line.startsWith("Attribute")
    );

    if (tableStartIndex === -1) return text;

    const tableLines = lines.slice(tableStartIndex);

    const rows = tableLines
        .map(line => line.split(/\t+|\s{2,}/)) // split on tabs OR multiple spaces
        .filter(cols => cols.length >= 2);

    if (rows.length === 0) return text;

    const mdTable = [
        `| ${rows[0][0]} | ${rows[0][1]} |`,
        `|---|---|`
    ];

    for (let i = 1; i < rows.length; i++) {
        mdTable.push(`| ${rows[i][0]} | ${rows[i][1]} |`);
    }

    return [
        ...lines.slice(0, tableStartIndex),
        ...mdTable
    ].join("\n");
}



interface AlephGitTesterProps {
    testGitMarkdown:string,
}

export default function AlephGitTester({
    testGitMarkdown,
}:AlephGitTesterProps){
    const formattedMarkdown = convertToMarkdownTable(testGitMarkdown);

    
    return (
        <div 
            className= "relative w-full overflow-auto bg-white"
            style={{
                height:"100%",
                border:"1px solid #ddd",
            }}
        >
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {formattedMarkdown}
            </ReactMarkdown>
        </div>
    );
}