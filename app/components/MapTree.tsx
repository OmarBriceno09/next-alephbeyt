//My goal with the MapTree is to have it reveal (expand) when the Title is clicked. It can be as long as it needs to be,
//the dice container will shrink and fix itself to the bottom of the screen, until the end of the MapTree where it will sit in place.
//There will be more content below the page, but for now I will place a normal container to represent the rest of the page. 
//The footer will stop appearing when hovered down, and will only appear if the cursor isn't hovered on MapTreeRef (the container div)

//Meaning that I will have to encapsulate DiceContainer in here...
import { ContainerDimensions, createEmptyContainerDims } from "@/types/MetaTypes";
import { ScriptMapTreeNode } from "@/types/ScriptMapTreeNode";
import gsap from "gsap";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import DiceContainer, { DiceContainerHandle } from "./DiceContainer";
import { Script } from "@/types/Script";


const LETTERMODALPERCENTSIZEWIDTH = 0.65; 
const ENTERROTATIONTIME = 1.5;
const SWITCHROTTIME = 0.5;
const DICEANIMDELAY = 0.01;
const DICEMARGINSCALE = 0.3;

const MAPTREEMAXHEIGHT = 2;
const MAPTREEWIDTHSCALE = 0.75;

const MapTreeUpMargin = 20;


type LayoutNode = ScriptMapTreeNode & {
    x: number
    y:number
    xMin: number
    xMax: number
    depth: number
};


interface MapTreeProps {
    scripts: Script[],
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
            scriptMapTreeNodes,
            scriptChange,
            onSwitchTreeView,
        },
        ref
    ){

        const MapTreeRef = useRef<HTMLDivElement> (null);
        const TreeDisplayRef = useRef<HTMLDivElement> (null);
        const DiceContainerRefHandle = useRef<DiceContainerHandle> (null);
        const [mapTreeContainerDims, setMapTreeContainerDims] = useState<ContainerDimensions> (createEmptyContainerDims());
        const [stickyTopHeight, setStickyTopHeight] = useState<number>(0);
        const [layoutTreeNodes, setLayoutTreeNodes] = useState<LayoutNode[]> ([]);
        const [parentMap, setParentMap] = useState<Map<number, number[]>> ();//(new Map<number, number[]>());

        const handleToOpenTree = async (toOpen:boolean, DefaultDims: ContainerDimensions, time:number) => {
            const recalculateDims : ContainerDimensions = {...DefaultDims};
            if(toOpen) //I have to do to Open, pass as param, don't rely in use state.
                recalculateDims.height = MapTreeUpMargin + DefaultDims.height*MAPTREEMAXHEIGHT + 200;//200 is scale of small dice container

            //Await this one, because DiceContainer has to close first before minimizing
            await DiceContainerRefHandle.current?.handleToMinimize(toOpen, DefaultDims,0.5);
            
            animateTreeContainerDims(recalculateDims, time);
            const treetime = (toOpen) ? time*4 : time;
            AnimateDisplayTreeWipe(toOpen, treetime);

        };

        const AnimateDisplayTreeWipe = async (toOpen:boolean, time: number) => {
            if (!TreeDisplayRef) return;
            if(toOpen){
                console.log("open??");
                gsap.fromTo(
                    TreeDisplayRef.current,
                    { 
                        maskPosition: "0% 200%" 

                    },
                    {
                        maskPosition: "0% 0%",
                        duration: time,
                        ease: "none",//"power3.out",
                    }
                );
            } else {
                console.log("close??");
                gsap.to(TreeDisplayRef.current, {
                    maskPosition: "0% 200%",
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
                    setStickyTopHeight(window.innerHeight - (DefaultDims.width*0.1));
                    DiceContainerRefHandle.current?.setupTheGrid(startIndex,scriptOptions[startIndex], DefaultDims);
                }else{
                    setTreeContainerDimensions(DefaultDims);
                }
            }
        };


        const setTreeContainerDimensions = async (DefaultDims: ContainerDimensions): Promise<void> => {
            setStickyTopHeight(window.innerHeight - (DefaultDims.width*0.1));
            const recalculateDims : ContainerDimensions = {...DefaultDims};
            if(inTreeView)
                recalculateDims.height = DefaultDims.height*MAPTREEMAXHEIGHT;

            setMapTreeContainerDims(DefaultDims);
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
            const wMin = (W-(MAPTREEWIDTHSCALE*W))/2;
            const wMax = wMin + (MAPTREEWIDTHSCALE*W);
            makeLayoutTree(0, wMin, wMax, H, 0, layout);
            adjustMultiParentNodes(layout, bParentMap, childrenMap);

            console.log(layout);
            setLayoutTreeNodes(layout);
        }

        const makeLayoutTree = (nodeIndex: number, xMin:number, xMax: number, yMax:number, depth: number, layout: LayoutNode[]) => {
            const node = scriptMapTreeNodes[nodeIndex];

            const x = (xMin + xMax) / 2;
            const y = node.age_pos * yMax;//+20 is up buffer

            layout[nodeIndex] = { ...node, x, y, xMin, xMax, depth };

            const children = node.points_to;
            
            if (children.length === 0) return;

            const sectionWidth = (xMax - xMin) / children.length;

            children.forEach((childIndex, i) => {
                const childMin = xMin + i * sectionWidth;
                const childMax = childMin + sectionWidth;

                makeLayoutTree(childIndex, childMin, childMax, yMax, depth + 1, layout);
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
        const shiftSubtree = (layout: LayoutNode[], childrenMap: Map<number, number[]>, nodeIndex: number, deltaX: number) => {
            const children = childrenMap.get(nodeIndex);
            if (!children) return;

            children.forEach(childIndex => {
                layout[childIndex].x += deltaX;
                shiftSubtree(layout, childrenMap, childIndex, deltaX);
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

                const parentXs = parents.map(p => layout[p].x).sort((a,b)=>a-b);

                const mid = Math.floor(parentXs.length / 2);
                const median =
                parentXs.length % 2 === 0
                    ? (parentXs[mid - 1] + parentXs[mid]) / 2
                    : parentXs[mid];

                const deltaX = median - node.x;
                if (deltaX === 0) return;

                node.x = median;

                // Shift entire subtree
                shiftSubtree(layout, childrenMap, index, deltaX);
            });
        };

        //building horiz/vert edge paths
        const buildEdgePath = ( parent: LayoutNode, child: LayoutNode, isMultiParent: boolean) => {
            const heightFactor = (mapTreeContainerDims.height*MAPTREEMAXHEIGHT);
            
            const x1 = parent.x * mapTreeContainerDims.width;
            const y1 = MapTreeUpMargin + parent.y * heightFactor;
            const x2 = child.x * mapTreeContainerDims.width;
            const y2 = MapTreeUpMargin + child.y * heightFactor;

            const dx = x2 - x1;
            const dy = y2 - y1;

            // Pure vertical
            if (dx === 0) {
                return `M ${x1} ${y1} V ${y2}`;
            }

            // Pure horizontal
            if (dy === 0) {
                return `M ${x1} ${y1} H ${x2}`;
            }

            const xDir = dx > 0 ? 1 : -1;
            const yDir = dy > 0 ? 1 : -1;

            const radius = Math.min(12, Math.abs(dx), Math.abs(dy));

            if (!isMultiParent) {
                // Horizontal → Vertical
                return `
                M ${x1} ${y1}
                H ${x2 - xDir * radius}
                Q ${x2} ${y1} ${x2} ${y1 + yDir * radius}
                V ${y2}
                `;
            } else {
                // Vertical → Horizontal
                return `
                M ${x1} ${y1}
                V ${y2 - yDir * radius}
                Q ${x1} ${y2} ${x1 + xDir * radius} ${y2}
                H ${x2}
                `;
            }
        };
    
        return(
            <div
                ref = {MapTreeRef} 
                className="relative"
                style = {{
                        //opacity: 0.5,
                        //{`--cube-size`: `${letterModalDimensions.current.start_width}px`},
                        //w-[85vw], h-[75vh]
                        //width: "85vw",
                        //height: "125vh",
                        //backgroundColor: "#959b2d",
                        //minHeight: "[200vh]"
                }}
            >

                <div
                    ref = {TreeDisplayRef}
                    className = "TreeDisplay absolute"
                    style={{
                        height: "100%",
                        width: "100%",
                        //backgroundColor: "#959b2d",
                        WebkitMaskImage:
                        "linear-gradient(to bottom, black 75%, transparent 100%)",
                        maskImage:
                        "linear-gradient(to bottom, black 75%, transparent 100%)",
                        WebkitMaskSize: "100% 200%",
                        maskSize: "100% 200%",
                        WebkitMaskPosition: "0% 100%",
                        maskPosition: "0% 200%",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                    }}
                >
                    {/* Tree DISPLAY*/}
                    { (layoutTreeNodes && layoutTreeNodes.length > 0) ? (
                        <svg className="absolute inset-0 w-full h-full">
                            {/* edges */}
                            {layoutTreeNodes.map((node, i) =>
                                node.points_to.map((targetIndex) => {
                                    const child = layoutTreeNodes[targetIndex];
                                    const maplen = parentMap?.get(targetIndex)?.length;
                                    if(maplen == undefined) return null;   
                                    const multi = (maplen > 1);
                                    return (
                                        <path
                                            key={`${i}-${targetIndex}`}
                                            d={buildEdgePath(node, child, multi)}
                                            fill="none"
                                            stroke="#333"
                                            strokeWidth={2}
                                        />
                                    );
                                })
                            )}
                            {/* nodes */}
                            {layoutTreeNodes.map((node) => {
                                if (node.is_node) return null;

                                const paddingX = 15;
                                const height = 30;
                                const approxTextWidth = node.title.length * 6;
                                const width = approxTextWidth + paddingX;

                                return (
                                    <g
                                    key={node._id}
                                    transform={`translate(
                                        ${node.x*mapTreeContainerDims.width}, 
                                        ${MapTreeUpMargin + node.y*mapTreeContainerDims.height*MAPTREEMAXHEIGHT})`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => scriptChange(node.order_index)}
                                    onMouseEnter={(e) => {
                                        const targRect = e.currentTarget.querySelector("rect")
                                        const nHeight = height*1.1; const nWidth = width*1.1;
                                        targRect?.setAttribute("height", nHeight.toString());
                                        targRect?.setAttribute("width", nWidth.toString());
                                        targRect?.setAttribute("x", (-nWidth / 2).toString());
                                        targRect?.setAttribute("y", (-nHeight / 2).toString());
                                    }}
                                    onMouseLeave={(e) => {
                                        const targRect = e.currentTarget.querySelector("rect")
                                        targRect?.setAttribute("height", height.toString());
                                        targRect?.setAttribute("width", width.toString());
                                        targRect?.setAttribute("x", (-width / 2).toString());
                                        targRect?.setAttribute("y", (-height / 2).toString());
                                    }}
                                    >
                                    <rect
                                        x={-width / 2}
                                        y={-height / 2}
                                        width={width}
                                        height={height}
                                        rx={height / 2}
                                        ry={height / 2}
                                        fill="#fff"//none
                                        stroke="#222"
                                        strokeWidth={2}
                                    />

                                    <text
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="12"
                                        fill="#222"
                                    >
                                        {node.title}
                                    </text>
                                    </g>
                                );
                            })}
                        </svg>
                    ) : (
                        null
                    )
                    }
                    {/* Tree DISPLAY*/}



                </div>



                <div
                    className="diceContainerMover"
                    style = {{
                        position: "sticky",
                        top: stickyTopHeight,
                        display: "flex",
                        justifyContent: "center"
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