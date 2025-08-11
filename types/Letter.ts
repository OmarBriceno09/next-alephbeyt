import { PortableTextBlock } from "sanity";
import { PresImage } from "./PresImage";
import { LetterStats } from "./LetterStats";

interface SanityAsset {
    _id: string;
    url: string;
}

export type Letter = {
    //sanity variables
    _id: string;
    _createdAt: Date;
    letter_name: string;
    order_index: Int16Array;
    display: string;
    display_image: {
        asset?: SanityAsset;
    };
    stats: LetterStats;
    exp_summary: PortableTextBlock[];
    ftu_torah: PortableTextBlock[];
    ftu_word: PortableTextBlock[];
    definition: PortableTextBlock[];
    sym_associations: PortableTextBlock[];
    psalms119: PortableTextBlock[];
    gramMorph: PortableTextBlock[];
    imagePresentation: PresImage[];
}