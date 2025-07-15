import { PortableTextBlock } from "sanity";
import { Letter } from "./Letter";

export type Script = {
    _id: string;
    _createdAt: Date;
    title: string;
    order_index: Int16Array;
    font: string;
    letters: Letter[];
    exp_summary: PortableTextBlock[];
}