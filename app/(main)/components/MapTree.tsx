//My goal with the MapTree is to have it reveal (expand) when the Title is clicked. It can be as long as it needs to be,
//the dice container will shrink and fix itself to the bottom of the screen, until the end of the MapTree where it will sit in place.
//There will be more content below the page, but for now I will place a normal container to represent the rest of the page. 
//The footer will stop appearing when hovered down, and will only appear if the cursor isn't hovered on MapTreeRef (the container div)

//Meaning that I will have to encapsulate DiceContainer in here...
import { ContainerDimensions, createEmptyContainerDims } from "@/types/MetaTypes";
import { ScriptMapTreeNode } from "@/types/ScriptMapTreeNode";
import gsap from "gsap";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import DiceContainer, { DiceContainerHandle } from "./DiceGrid/DiceContainer";
import { Script } from "@/types/Script";


const LETTERMODALPERCENTSIZEWIDTH = 0.65; 
const ENTERROTATIONTIME = 1.5;
const SWITCHROTTIME = 0.5;
const DICEANIMDELAY = 0.01;
const DICEMARGINSCALE = 0.3;

const MAPTREEMAXLENGTH = 1.5;
const MAPTREEHEIGHTSCALE = 0.75;

const MapTreeLeftMargin = 150;
const MapTreeMinSize = 1300;
const MapTreeLegendHeight = 40;

const timelineDates = [
    {label:"2000 - 1800 BC", x:0.22},
    {label:"1500 - 1000 BC", x:0.3},
    {label:"800 BC", x:0.44},
    {label:"500 BC", x:0.55},
    {label:"1 BC", x:0.6},
    {label:"100 AC", x:0.7},
    {label:"1800 AC", x:0.95},
];


type LayoutNode = ScriptMapTreeNode & {
    x: number
    y:number
    yMin: number
    yMax: number
    depth: number
};


interface MapTreeProps {
    scripts: Script[],
    selectedScriptIndex: number,
    inTreeView: boolean,
    scriptMapTreeNodes: ScriptMapTreeNode[],
    scriptChange: (newScriptIndex: number) => void;
    onSwitchTreeView: (toTreeView: boolean) => void;
};

export type MapTreeHandle = {
    handleToOpenTree: (toOpen:boolean, DefaultDims: ContainerDimensions, time:number) => Promise<void>;
    setupTreeContainerDimensions: (DefaultDims: ContainerDimensions, startIndex:number, scriptOptions: string[]) => Promise<void>
    setTreeContainerDimensions: (DefaultDims: ContainerDimensions) => Promise<void>
    handleScriptChange: (newScriptIndex: number) => Promise<void>;
};

const MapTree = forwardRef<MapTreeHandle, MapTreeProps>(
    function MapTree(
        {
            scripts,
            inTreeView,
            selectedScriptIndex,
            scriptMapTreeNodes,
            scriptChange,
            onSwitchTreeView,
        },
        ref
    ){

        const MapTreeRef = useRef<HTMLDivElement> (null);//<SVGSVGElement> (null);
        const TreeMaskRef = useRef<HTMLDivElement> (null);
        const DiceContainerRefHandle = useRef<DiceContainerHandle> (null);
        const [mapTreeContainerDims, setMapTreeContainerDims] = useState<ContainerDimensions> (createEmptyContainerDims());
        const [layoutTreeNodes, setLayoutTreeNodes] = useState<LayoutNode[]> ([]);
        const [parentMap, setParentMap] = useState<Map<number, number[]>> ();//(new Map<number, number[]>());

        const handleToOpenTree = async (toOpen:boolean, DefaultDims: ContainerDimensions, time:number) => {
            const recalculateDims : ContainerDimensions = {...DefaultDims};
            //if(toOpen) //I have to do to Open, pass as param, don't rely in use state.
            //    recalculateDims.width = MapTreeLeftMargin + DefaultDims.width*MAPTREEMAXLENGTH;//200 is scale of small dice container

            //Await this one, because DiceContainer has to close first before minimizing
            if(!toOpen) DiceContainerRefHandle.current?.setMiniScreenSelectable(toOpen); //this is supposed to time the selectability .. 
            await DiceContainerRefHandle.current?.handleToMinimize(toOpen, DefaultDims,0.5);
            if(toOpen) DiceContainerRefHandle.current?.setMiniScreenSelectable(toOpen); // im not sure why neither of them are working :/
            
            animateTreeContainerDims(recalculateDims, time);
            const treetime = (toOpen) ? time*4 : time;
            AnimateDisplayTreeWipe(toOpen, treetime);

        };

        const AnimateDisplayTreeWipe = async (toOpen:boolean, time: number) => {
            if (!TreeMaskRef) return;
            if(toOpen){
                console.log("open??");
                gsap.fromTo(
                    TreeMaskRef.current,
                    { 
                        maskPosition: "200% 0%" 

                    },
                    {
                        maskPosition: "0% 0%",
                        duration: time,
                        ease: "none",//"power3.out",
                    }
                );
            } else {
                console.log("close??");
                gsap.to(TreeMaskRef.current, {
                    maskPosition: "200% 0%",
                    duration: time,
                    ease: "none",//"power3.in",
                })
            }

        };


        const setupTreeContainerDimensions = async (DefaultDims: ContainerDimensions, startIndex: number, scriptOptions: string[]): Promise<void> => {
            if(DiceContainerRefHandle){
                //im thinking maybe I want to put and await here to generate the tree
                setMapTreeContainerDims(DefaultDims); //placed here to draw the layout nodes
                layoutTreeMapNodes();
                if(scriptOptions.length>0){
                    DiceContainerRefHandle.current?.setupTheGrid(startIndex,scriptOptions[startIndex], DefaultDims);
                }else{
                    setTreeContainerDimensions(DefaultDims);
                }
            }
        };


        const setTreeContainerDimensions = async (DefaultDims: ContainerDimensions): Promise<void> => {
            const recalculateDims : ContainerDimensions = {...DefaultDims};
            
            console.log(DefaultDims.x);
            setMapTreeContainerDims(recalculateDims);
            DiceContainerRefHandle.current?.setContainerDimensions(DefaultDims);
            return new Promise((resolve => {
                gsap.set(
                    MapTreeRef.current,
                    {
                        width: recalculateDims.width,
                        height: recalculateDims.height,
                        x: recalculateDims.x,
                        y: recalculateDims.y,
                        onComplete: () => {
                            resolve();
                        }
                    },
                );
            }));
        };


        const handleScriptChange = async (newScriptIndex: number) => {
            DiceContainerRefHandle.current?.handleScriptChange(newScriptIndex);
        }

        const animateTreeContainerDims = async (ContainerDims: ContainerDimensions, time:number): Promise<void> => {
            //treeContainerDimensions.current = ContainerDims;
            console.log("animateTreeContainerDims: ", ContainerDims);
            return new Promise((resolve=>{
                gsap.to(
                    MapTreeRef.current,
                    {
                        width: ContainerDims.width,
                        height: ContainerDims.height,
                        x: ContainerDims.x,
                        y: ContainerDims.y,
                        duration: time,
                        ease: "none",//"power2.out",
                        onComplete: () => {
                            resolve();
                        }
                    },
                );
            }));
        };


        useImperativeHandle(ref, () => ({
            handleToOpenTree,
            setupTreeContainerDimensions,
            setTreeContainerDimensions,
            handleScriptChange,
        }));
        

        //Umm,testing purposes
        const layoutTreeMapNodes = () => {
            const W =1 , H = 1;
            const layout: LayoutNode[] = [];

            const bParentMap = buildParentMap(scriptMapTreeNodes);
            setParentMap(bParentMap);
            const childrenMap = buildChildrenMap(scriptMapTreeNodes);
            //const layoutTree = makeLayoutTree(depths, W, H);
            const hMin = (H-(MAPTREEHEIGHTSCALE*H))/2;
            const hMax = hMin + (MAPTREEHEIGHTSCALE*H);
            makeLayoutTree(0, hMin, hMax, W, 0, layout);
            adjustMultiParentNodes(layout, bParentMap, childrenMap);

            console.log(layout);
            setLayoutTreeNodes(layout);
        }

        const makeLayoutTree = (nodeIndex: number, yMin:number, yMax: number, xMax:number, depth: number, layout: LayoutNode[]) => {
            const node = scriptMapTreeNodes[nodeIndex];

            const y = (yMin + yMax) / 2;
            const x = node.age_pos * xMax;

            layout[nodeIndex] = { ...node, x, y, yMin, yMax, depth };

            const children = node.points_to;
            
            if (children.length === 0) return;

            const sectionHeight = (yMax - yMin) / children.length;

            children.forEach((childIndex, i) => {
                const childMin = yMin + i * sectionHeight;
                const childMax = childMin + sectionHeight;

                makeLayoutTree(childIndex, childMin, childMax, xMax, depth + 1, layout);
            });
        };

        //building parent map for the adjustment of multi-parented nodes
        const buildParentMap = (nodes: ScriptMapTreeNode[]) => {
            const parentMap = new Map<number, number[]>();

            nodes.forEach((node, parentIndex) => {
                node.points_to.forEach(childIndex => {
                if (!parentMap.has(childIndex)) {
                    parentMap.set(childIndex, []);
                }
                parentMap.get(childIndex)!.push(parentIndex)
                });
            });

            return parentMap
        };

        //building children map for shifting subsequent nodes after parent has been shifted
        const buildChildrenMap = (nodes: ScriptMapTreeNode[]) => {
            const map = new Map<number, number[]>();
            nodes.forEach((node, index) => {
                map.set(index, node.points_to)
            });
            return map;
        };


        //recursive subtree shift function
        const shiftSubtree = (layout: LayoutNode[], childrenMap: Map<number, number[]>, nodeIndex: number, deltaY: number) => {
            const children = childrenMap.get(nodeIndex);
            if (!children) return;

            children.forEach(childIndex => {
                layout[childIndex].y += deltaY;
                shiftSubtree(layout, childrenMap, childIndex, deltaY);
            });
        };


        //this is where the multi-parent node adjustment will be done, parent map is necessary
        const adjustMultiParentNodes = (
            layout: LayoutNode[], 
            parentMap: Map<number, number[]>, 
            childrenMap: Map<number, number[]>
        ) => {
            layout.forEach((node, index) => {
                const parents = parentMap.get(index);
                if (!parents || parents.length <= 1) return;

                const parentYs = parents.map(p => layout[p].y).sort((a,b)=>a-b);

                const mid = Math.floor(parentYs.length / 2);
                const median =
                parentYs.length % 2 === 0
                    ? (parentYs[mid - 1] + parentYs[mid]) / 2
                    : parentYs[mid];

                const deltaY = median - node.y;
                if (deltaY === 0) return;

                node.y = median;

                // Shift entire subtree
                shiftSubtree(layout, childrenMap, index, deltaY);
            });
        };

        //so the tree doesn't shrink bellow the MapTreeMinSize value
        const mapTreeWidthLimit = () => {
            return (mapTreeContainerDims.width < MapTreeMinSize) ? MapTreeMinSize : mapTreeContainerDims.width;
        }


        //building horiz/vert edge paths
        const buildEdgePath = ( parent: LayoutNode, child: LayoutNode, isMultiParent: boolean) => {
            
            const x1 = parent.x;
            const y1 = parent.y;
            const x2 = child.x;
            const y2 = child.y;

            const dx = x2 - x1;
            const dy = y2 - y1;

            // Pure vertical
            if (dx === 0) {
                return `M ${x1} ${y1} V ${y2}`;
            }
            //Pure Horizontal
            if (dy === 0) {
                return `M ${x1} ${y1} H ${x2}`;
            }

            const xDir = dx > 0 ? 1 : -1;
            const yDir = dy > 0 ? 1 : -1;

            const radius = Math.min(12, Math.abs(dx), Math.abs(dy));

            if (!isMultiParent) {
                // Vertical → Horizontal (multi-parent)
                return `
                M ${x1} ${y1}
                V ${y2 - yDir * radius}
                Q ${x1} ${y2} ${x1 + xDir * radius} ${y2}
                H ${x2}
                `;
            } else {
                // Horizontal → Vertical (normal child)
                return `
                M ${x1} ${y1}
                H ${x2 - xDir * radius}
                Q ${x2} ${y1} ${x2} ${y1 + yDir * radius}
                V ${y2}
                `;
            }
        };


        const positionedNodes = layoutTreeNodes.map(node => {
            const x =
                MapTreeLeftMargin +
                node.x * mapTreeWidthLimit() * MAPTREEMAXLENGTH;

            const y =
                node.y * (mapTreeContainerDims.height - MapTreeLegendHeight);

            return { ...node, x, y };
        });
    

        return(
            <div
                ref = {MapTreeRef} 
                className={`relative w-full h-full ${inTreeView?`overflow-x-auto`:`overflow-x-hidden`} overflow-y-hidden`}
                style = {{
                        //opacity: 0.5,
                        //{`--cube-size`: `${letterModalDimensions.current.start_width}px`},
                        //w-[85vw], h-[75vh]
                        //width: "85vw",
                        //height: "125vh",
                        //backgroundColor: "#6f00ff",
                        //minHeight: "[200vh]"
                }}
            >
                <div
                    ref = {TreeMaskRef}
                    className = "MaskViewport absolute inset-0"
                    style={{
                        height: "100%",
                        width: mapTreeWidthLimit() * MAPTREEMAXLENGTH + MapTreeLeftMargin,
                        //backgroundColor: "#959b2d",
                        WebkitMaskImage:
                        "linear-gradient(to right, black 75%, transparent 100%)",
                        maskImage:
                        "linear-gradient(to right, black 75%, transparent 100%)",
                        WebkitMaskSize: "200% 100%",
                        maskSize: "200% 100%",
                        WebkitMaskPosition: "100% 0%",
                        maskPosition: "200% 0%",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                    }}
                >
                        <div
                            className="absolute h-full w-full"
                        >
                            {/* Tree DISPLAY*/}
                            { (positionedNodes && positionedNodes.length > 0) ? (
                                <svg
                                    //ref = {MapTreeRef} 
                                    className="absolute inset-0"
                                    width= "100%"
                                    height={mapTreeContainerDims.height}
                                    viewBox={`0 0 ${mapTreeWidthLimit() * MAPTREEMAXLENGTH + MapTreeLeftMargin} ${mapTreeContainerDims.height}`}
                                >
                                    <defs>
                                        <linearGradient 
                                            id="treeGradient" 
                                            gradientUnits="userSpaceOnUse" 
                                            x1="0" 
                                            y1="0" 
                                            x2={mapTreeWidthLimit() * MAPTREEMAXLENGTH + MapTreeLeftMargin}
                                            y2="0"
                                        >
                                            <stop offset="0%" stopColor="#ff0000"/>
                                            <stop offset="20%" stopColor="#ff9100"/>
                                            <stop offset="40%" stopColor="#fffb00"/>
                                            <stop offset="60%" stopColor="#2bff00"/>
                                            <stop offset="80%" stopColor="#1900ff"/>
                                            <stop offset="100%" stopColor="#ff00ea"/>
                                        </linearGradient>
                                    </defs>

                                    {/* edges */}
                                    {positionedNodes.map((node, i) =>
                                        node.points_to.map((targetIndex) => {
                                            const child = positionedNodes[targetIndex];
                                            const maplen = parentMap?.get(targetIndex)?.length;
                                            if(maplen == undefined) return null;   
                                            const multi = (maplen > 1);
                                            return (
                                                <path
                                                    key={`${i}-${targetIndex}`}
                                                    d={buildEdgePath(node, child, multi)}
                                                    fill="none"
                                                    stroke="url(#treeGradient)"//"#222"
                                                    strokeWidth={2}
                                                />
                                            );
                                        })
                                    )}
                                    {/* nodes */}
                                    {positionedNodes.map((node) => {
                                        if (node.is_node) return null;// comment this line to see nodes

                                        const paddingX = 15;
                                        const height = 30;
                                        const approxTextWidth = node.title.length * 6;
                                        const width = approxTextWidth + paddingX;

                                        const assignColor = (selectedScriptIndex>-1) ? (scripts[selectedScriptIndex].title === node.title) ? "#222" : "url(#treeGradient)" : "url(#treeGradient)";

                                        return (
                                            <g
                                            key={node._id}
                                            className="node"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => scriptChange(node.order_index)}
                                            onMouseEnter={(e)=>{
                                                gsap.to(e.currentTarget, {
                                                    scale:1.1,
                                                    transformOrigin:"center",
                                                    duration:0.2
                                                });
                                            }}
                                            onMouseLeave={(e)=>{
                                                gsap.to(e.currentTarget,{
                                                    scale:1,
                                                    duration:0.2
                                                });
                                            }}
                                            >
                                                <rect
                                                    x={node.x - width/2}
                                                    y={node.y - height/2}
                                                    width={width}
                                                    height={height}
                                                    rx={height/2}
                                                    fill="#fff"//"none"
                                                    stroke={assignColor}//"url(#treeGradient)"//"#222"
                                                    strokeWidth={2}
                                                    className="nodeRect"
                                                />

                                                <text
                                                    x={node.x}
                                                    y={node.y}
                                                    textAnchor = "middle"
                                                    dominantBaseline = "middle"
                                                    fontSize = "12"
                                                    fill="#222"
                                                    className = "select-none"
                                                >
                                                    {node.title}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/*Underline */}
                                    <line
                                        x1={0}
                                        y1={mapTreeContainerDims.height - MapTreeLegendHeight}
                                        x2={mapTreeWidthLimit() * MAPTREEMAXLENGTH + MapTreeLeftMargin}
                                        y2={mapTreeContainerDims.height - MapTreeLegendHeight}
                                        stroke="url(#treeGradient)"
                                        strokeWidth={8}
                                        strokeLinecap="round"
                                    />

                                    {/*Tick Marks*/}
                                    {timelineDates.map((date, i) => (
                                        <line
                                            key={"tick-"+i}
                                            x1={(mapTreeWidthLimit() * MAPTREEMAXLENGTH + MapTreeLeftMargin)* date.x}
                                            x2={(mapTreeWidthLimit() * MAPTREEMAXLENGTH + MapTreeLeftMargin)* date.x}
                                            y1={mapTreeContainerDims.height - MapTreeLegendHeight - 4}
                                            y2={mapTreeContainerDims.height - MapTreeLegendHeight + 6}
                                            stroke="#444"
                                            strokeWidth={2}
                                        />
                                    ))}

                                    {/*Timeline Labels*/}
                                    {timelineDates.map((date, i) => (
                                        <text
                                            key={i}
                                            x={(mapTreeWidthLimit() * MAPTREEMAXLENGTH + MapTreeLeftMargin)* date.x}
                                            y={mapTreeContainerDims.height - MapTreeLegendHeight + 20}
                                            textAnchor="middle"
                                            fontSize="12"
                                            fill="#222"
                                            className="select-none"
                                        >
                                            {date.label}
                                        </text>
                                    ))}



                                </svg>
                            ) : (
                                null
                            )
                            }
                            {/* Tree DISPLAY*/}
                        </div>

                </div>


                <div
                    className="diceContainerMover relative w-min"
                    style = {{
                        position: "sticky",
                        left: 0,
                        display: "flex",
                        justifyContent: "left",
                        //backgroundColor: "#ff00f2",
                    }}
                >
                    {/* Die Container*/}
                    {<DiceContainer
                        ref={DiceContainerRefHandle}
                        inTreeView = {inTreeView}
                        scripts = {scripts}
                        LETTERMODALPERCENTSIZEWIDTH = {LETTERMODALPERCENTSIZEWIDTH}
                        ENTERROTATIONTIME = {ENTERROTATIONTIME}
                        SWITCHROTTIME = {SWITCHROTTIME}
                        DICEANIMDELAY = {DICEANIMDELAY}
                        DICEMARGINSCALE = {DICEMARGINSCALE}
                        scriptChange = {scriptChange}
                        onSwitchTreeView={onSwitchTreeView}

                    />}
                </div>
            </div>
        );
    }
);
export default MapTree;