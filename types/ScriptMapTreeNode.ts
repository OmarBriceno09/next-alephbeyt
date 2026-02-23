//This is an intermideary class ment to unify languages and nodes in a single array for maptree drawing
export type ScriptMapTreeNode = {
    _id: string;
    title: string;
    order_index: number;
    age_pos: number;
    points_to: number[];
    is_node: boolean;
    x: number;
    y: number;
}