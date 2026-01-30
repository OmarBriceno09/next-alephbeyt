import { PortableTextBlock } from "sanity";
import { Letter } from "./Letter";

export type Script = {
    _id: string;
    _createdAt: Date;
    title: string;
    order_index: number;
    age_pos: number;
    points_to: string;
    font: string;
    left_to_right: boolean;
    array_setup: string;
    letters: Letter[];
    exp_summary: PortableTextBlock[];
}

export const createEmptyScript = (): Script => ({
    _id: "",
    _createdAt: new Date(),       // “now” instead of epoch
    title: "",
    order_index: -1,
    age_pos: 0,
    points_to: "",
    font: "",
    left_to_right: false,
    array_setup: "7,8,7",
    letters: [],
    exp_summary: [],
  });