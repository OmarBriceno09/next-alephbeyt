"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ModalBlockSnippet from "./ModalBlockSnippet";
import { PortableTextBlock } from "next-sanity";
import { Letter } from "@/types/Letter";
import { ModalDimensions } from "@/types/MetaTypes";
import { Script } from "@/types/Script";


type ModalBlockListProps = {
    scriptList: Script[],
    scriptIndex: number,
    letterIndex: number,
    SWAPTIME: number,
    modalDimensions: React.RefObject<ModalDimensions>,
    satColor:string,
    litColor:string,
    darkColor:string
}

const snippetConfigs = [
    { key: "stats", title: "Basic Stats", startOpen: true },
    { key: "exp_summary", title: "General Summary" },
    { key: "ftu_torah", title: "First Time Used in Torah" },
    { key: "ftu_word", title: "First Time Used at the Beginning of a Word" },
    { key: "definition", title: "Definition" },
    { key: "sym_associations", title: "Symbolic Associations" },
    { key: "psalms119", title: "Psalms 119" },
    { key: "gramMorph", title: "Grammatical Morphology" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            //duration:1,
            //when:"beforeChildren",
            staggerChildren: 0.025, // delay between children
        },
    },
    exit: {
        opacity: 0,
        transition: { 
            //duration:1,
            //when:"beforeChildren",
            staggerChildren: 0.025, 
            staggerDirection: 1 
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
};

export default function ModalBlockList({
    scriptList,
    scriptIndex,
    letterIndex,
    SWAPTIME,
    modalDimensions,
    satColor,
    litColor,
    darkColor
}:ModalBlockListProps){
    const[selLetter, setSelLetter] = useState<Letter|null>(null);
    
    useEffect(() => {
        if (scriptList[scriptIndex])
            setSelLetter(scriptList[scriptIndex].letters?.[letterIndex]);
        console.log("changing to: ", scriptIndex);
    }, [scriptIndex, letterIndex]);

    return (
        <div className="ModalBlockList relative w-full h-full overflow-x-hidden">
        <AnimatePresence mode="wait">
            <motion.div
            key={`curr-${scriptIndex}-${letterIndex}`}
            className="absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden pointer-events-auto items-end space-y-5 justify-start"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            transition={{ duration: SWAPTIME, ease: "easeInOut" }}
            style={{
                paddingInline: modalDimensions.current.start_width * 0.3,
                paddingBlock: modalDimensions.current.start_width * 0.1,
            }}
            >
            {snippetConfigs.map(({ key, title, startOpen }) => {
                const info = selLetter?.[key as keyof typeof selLetter];
                if (!info) return null;
                return (
                <motion.div key={key} variants={itemVariants}>
                    <ModalBlockSnippet
                    title={title}
                    saturatedColor={satColor}
                    lightenedColor={litColor}
                    darkenedColor={darkColor}
                    startOpen={startOpen}
                    information={info as PortableTextBlock[]}
                    modalDimensions={modalDimensions}
                    />
                </motion.div>
                );
            })}
            </motion.div>
        </AnimatePresence>
        </div>
    );

}